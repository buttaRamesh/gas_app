from django.db import transaction
from django.core.exceptions import ValidationError

from inventory.models import InventoryBucket, InventoryState, InventoryTransaction, Product
from inventory.services.inventory_service import InventoryService

from delivery.models import (
    DeliveryRun,
    DeliveryLoad,
    DeliveryLoadItem,
    DeliverySummary,
    DeliverySummaryItem,
    DeliveryRecord,
)


class DeliveryService:
    """
    Service for delivery lifecycle:
      - post_load(load): GODOWN/FULL -> CM_OUT/FULL (reserve)
      - post_summary(summary): CM_OUT -> GODOWN/EMPTY + GODOWN/FULL(unsold) + DEF
      - create_delivery_record(payload): store detailed record (Option B) (does not touch inventory)
      - reconcile_run(run): compare summary vs detailed records, return differences or create adjustment txns
    """

    @staticmethod
    @transaction.atomic
    def post_load(load: DeliveryLoad, reference=None):
        if not isinstance(load, DeliveryLoad):
            raise ValidationError("Invalid load")

        godown = InventoryBucket.objects.get(code="GODOWN")
        cm_out = InventoryBucket.objects.get(code="CM_OUT")
        full_state = InventoryState.objects.get(code="FULL")

        for item in load.items.select_related("product").all():
            qty = int(item.qty_full_loaded or 0)
            if qty <= 0:
                continue

            # Move GODOWN/FULL -> CM_OUT/FULL
            InventoryService.move(
                product=item.product,
                from_bucket=godown,
                from_state=full_state,
                to_bucket=cm_out,
                to_state=full_state,
                qty=qty,
                txn_type=InventoryTransaction.TxnType.ASSIGN,
                reference_id=f"LOAD-{load.id}"
            )

        return True

    @staticmethod
    @transaction.atomic
    def post_summary(summary: DeliverySummary):
        if not isinstance(summary, DeliverySummary):
            raise ValidationError("Invalid summary")

        run = summary.run

        cm_out = InventoryBucket.objects.get(code="CM_OUT")
        godown = InventoryBucket.objects.get(code="GODOWN")
        def_full = InventoryBucket.objects.get(code="DEF_FULL")
        def_empty = InventoryBucket.objects.get(code="DEF_EMPTY")

        full_state = InventoryState.objects.get(code="FULL")
        empty_state = InventoryState.objects.get(code="EMPTY")
        def_state = InventoryState.objects.get(code="DEFECTIVE")

        for item in summary.items.select_related("product").all():
            product = item.product

            # total to remove from CM_OUT (full)
            total_to_remove = (
                int(item.total_full_delivered or 0) +
                int(item.total_unsold_full or 0) +
                int(item.total_defective or 0)
            )

            if total_to_remove > 0:
                # decrease CM_OUT/FULL
                InventoryService.decrease_stock(
                    product=product,
                    bucket=cm_out,
                    state=full_state,
                    qty=total_to_remove,
                    txn_type=InventoryTransaction.TxnType.DELIVERY,
                    reference_id=f"SUMMARY-{summary.id}"
                )

            # Unsold full -> GODOWN/FULL (returned unsold)
            if item.total_unsold_full and item.total_unsold_full > 0:
                InventoryService.increase_stock(
                    product=product,
                    bucket=godown,
                    state=full_state,
                    qty=item.total_unsold_full,
                    txn_type=InventoryTransaction.TxnType.RETURN,
                    reference_id=f"SUMMARY-{summary.id}",
                    notes="Unsold full returned"
                )

            # Empty collected -> GODOWN/EMPTY
            if item.total_empty_collected and item.total_empty_collected > 0:
                InventoryService.increase_stock(
                    product=product,
                    bucket=godown,
                    state=empty_state,
                    qty=item.total_empty_collected,
                    txn_type=InventoryTransaction.TxnType.RETURN,
                    reference_id=f"SUMMARY-{summary.id}",
                    notes="Empty collected from delivery"
                )

            # Defective -> DEF_EMPTY (business policy; adjust if full-defective)
            if item.total_defective and item.total_defective > 0:
                InventoryService.increase_stock(
                    product=product,
                    bucket=def_empty,
                    state=def_state,
                    qty=item.total_defective,
                    txn_type=InventoryTransaction.TxnType.ADJUSTMENT,
                    reference_id=f"SUMMARY-{summary.id}",
                    notes="Defective returned"
                )

        # mark run as returned (inventory moved back)
        run.status = "RETURNED"
        run.save(update_fields=["status"])
        return True

    @staticmethod
    def create_delivery_record(**payload):
        """
        Create a DeliveryRecord (detailed record). Does not touch inventory.
        Example payload keys:
            run, consumer_name, consumer_code, booking_reference, product,
            qty_full_delivered, qty_empty_collected, qty_empty_not_collected, entered_by
        """
        rec = DeliveryRecord.objects.create(**payload)
        return rec

    @staticmethod
    @transaction.atomic
    def reconcile_run(run: DeliveryRun, auto_adjust=False):
        """
        Compare Option A (summary) vs Option B (detailed) per-product and return differences.
        If auto_adjust=True, create ADJUSTMENT InventoryService calls to make inventory match summary.
        Returns dict {product_id: {summary: {...}, record: {...}, diff: {...}}}
        """
        if not isinstance(run, DeliveryRun):
            raise ValidationError("Invalid run")

        # gather summary aggregates (Option A)
        summary_map = {}
        if hasattr(run, "summary") and run.summary:
            for si in run.summary.items.select_related("product"):
                pid = si.product.id
                summary_map[pid] = {
                    "summary_full_delivered": int(si.total_full_delivered or 0),
                    "summary_empty_collected": int(si.total_empty_collected or 0),
                }

        # gather record aggregates (Option B)
        record_map = {}
        for rec in run.records.select_related("product").all():
            pid = rec.product.id
            if pid not in record_map:
                record_map[pid] = {"record_full_delivered": 0, "record_empty_collected": 0}
            record_map[pid]["record_full_delivered"] += int(rec.qty_full_delivered or 0)
            record_map[pid]["record_empty_collected"] += int(rec.qty_empty_collected or 0)

        # compute differences and optionally adjust (policy: keep inventory per summary)
        adjustments = []
        result = {}
        for pid, summ in summary_map.items():
            prod = Product.objects.get(id=pid)
            recs = record_map.get(pid, {"record_full_delivered": 0, "record_empty_collected": 0})

            delivered_diff = summ["summary_full_delivered"] - recs["record_full_delivered"]
            empty_diff = summ["summary_empty_collected"] - recs["record_empty_collected"]

            result[pid] = {
                "product": prod,
                "summary": summ,
                "records": recs,
                "diff": {"delivered_diff": delivered_diff, "empty_diff": empty_diff},
            }

            if auto_adjust and (delivered_diff != 0 or empty_diff != 0):
                # record adjustment txns (metadata only) - policy choice
                InventoryTransaction.objects.create(
                    product=prod,
                    from_bucket=None,
                    to_bucket=None,
                    from_state=None,
                    to_state=None,
                    quantity=abs(delivered_diff),
                    txn_type=InventoryTransaction.TxnType.ADJUSTMENT,
                    reference_id=f"RECONCILE-{run.id}",
                    notes=f"Delivered diff adjustment: {delivered_diff}"
                )
                InventoryTransaction.objects.create(
                    product=prod,
                    from_bucket=None,
                    to_bucket=None,
                    from_state=None,
                    to_state=None,
                    quantity=abs(empty_diff),
                    txn_type=InventoryTransaction.TxnType.ADJUSTMENT,
                    reference_id=f"RECONCILE-{run.id}",
                    notes=f"Empty diff adjustment: {empty_diff}"
                )
                adjustments.append({"product": prod, "delivered_diff": delivered_diff, "empty_diff": empty_diff})

        # mark run reconciled
        run.status = "RECONCILED"
        run.save(update_fields=["status"])

        return {"result": result, "adjustments": adjustments}
