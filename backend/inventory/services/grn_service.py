from django.db import transaction
from django.core.exceptions import ValidationError

from inventory.models import (
    GRNHeader,
    GRNItem,
    InventoryBucket,
    InventoryState,
    InventoryTransaction,
)
from inventory.services.inventory_service import InventoryService


class GRNService:
    @staticmethod
    @transaction.atomic
    def post_grn(grn: GRNHeader, user=None):
        """
        Post a DRAFT GRN:
         - Validate header/items
         - For each GRNItem: increase Godown/FULL by received_full,
                              increase Godown/EMPTY by received_empty,
                              increase DEF_EMPTY or DEF_FULL by received_defective (choose DEF_EMPTY for empty defective)
         - Create InventoryTransaction entries (done by InventoryService)
         - Mark GRN as POSTED
        """
        if grn.status != "DRAFT":
            raise ValidationError("Only DRAFT GRNs can be posted")

        items = list(grn.items.select_related("product").all())
        if not items:
            raise ValidationError("GRN has no items")

        # Lookup buckets/states (single DB hits)
        try:
            godown_bucket = InventoryBucket.objects.get(code="GODOWN")
            def_full_bucket = InventoryBucket.objects.get(code="DEF_FULL")
            def_empty_bucket = InventoryBucket.objects.get(code="DEF_EMPTY")
            full_state = InventoryState.objects.get(code="FULL")
            empty_state = InventoryState.objects.get(code="EMPTY")
            def_state = InventoryState.objects.get(code="DEFECTIVE")
        except InventoryBucket.DoesNotExist as e:
            raise ValidationError(f"Missing InventoryBucket: {e}")
        except InventoryState.DoesNotExist as e:
            raise ValidationError(f"Missing InventoryState: {e}")

        # Process every line
        for item in items:
            prod = item.product

            if item.received_full and item.received_full > 0:
                InventoryService.increase_stock(
                    product=prod,
                    bucket=godown_bucket,
                    state=full_state,
                    qty=item.received_full,
                    txn_type=InventoryTransaction.TxnType.GRN,
                    reference_id=grn.grn_number,
                    notes=f"GRN {grn.grn_number} - full"
                )

            if item.received_empty and item.received_empty > 0:
                InventoryService.increase_stock(
                    product=prod,
                    bucket=godown_bucket,
                    state=empty_state,
                    qty=item.received_empty,
                    txn_type=InventoryTransaction.TxnType.GRN,
                    reference_id=grn.grn_number,
                    notes=f"GRN {grn.grn_number} - empty"
                )

            if item.received_defective and item.received_defective > 0:
                # we treat defective depending on whether full/empty flagged by upstream
                # here we put defectives into DEF_EMPTY if empty-like; choose appropriately per your ops
                InventoryService.increase_stock(
                    product=prod,
                    bucket=def_empty_bucket,
                    state=def_state,
                    qty=item.received_defective,
                    txn_type=InventoryTransaction.TxnType.GRN,
                    reference_id=grn.grn_number,
                    notes=f"GRN {grn.grn_number} - defective"
                )

        # Mark posted
        grn.status = "POSTED"
        grn.save(update_fields=["status"])
        return grn
