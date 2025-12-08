from django.db import transaction
from django.core.exceptions import ValidationError

from inventory.models import (
    InvoiceHeader,
    InvoiceItem,
    InventoryBucket,
    InventoryState,
    InventoryTransaction,
)
from inventory.services.inventory_service import InventoryService


class InvoiceService:

    @staticmethod
    @transaction.atomic
    def post_invoice(invoice: InvoiceHeader, user=None):
        """
        Post a DRAFT invoice from OMC Depot.
        Adds stock to inventory.
        Creates ledger entries via InventoryService.
        """

        if invoice.status != "DRAFT":
            raise ValidationError("Only DRAFT invoices can be posted.")

        items = list(invoice.items.select_related("product"))
        if not items:
            raise ValidationError("Invoice has no items.")

        # FETCH BUCKETS
        godown = InventoryBucket.objects.get(code="GODOWN")
        def_full = InventoryBucket.objects.get(code="DEF_FULL")
        def_empty = InventoryBucket.objects.get(code="DEF_EMPTY")

        # FETCH STATES
        full_state = InventoryState.objects.get(code="FULL")
        empty_state = InventoryState.objects.get(code="EMPTY")
        defective_state = InventoryState.objects.get(code="DEFECTIVE")

        # PROCESS EACH ITEM
        for item in items:
            p = item.product

            # FULL CYLINDERS
            if item.received_full > 0:
                InventoryService.increase_stock(
                    product=p,
                    bucket=godown,
                    state=full_state,
                    qty=item.received_full,
                    txn_type=InventoryTransaction.TxnType.OPENING,
                    reference_id=invoice.invoice_number,
                    notes="Invoice full"
                )

            # EMPTY CYLINDERS
            if item.received_empty > 0:
                InventoryService.increase_stock(
                    product=p,
                    bucket=godown,
                    state=empty_state,
                    qty=item.received_empty,
                    txn_type=InventoryTransaction.TxnType.OPENING,
                    reference_id=invoice.invoice_number,
                    notes="Invoice empty"
                )

            # DEFECTIVE CYLINDERS
            if item.received_defective > 0:
                InventoryService.increase_stock(
                    product=p,
                    bucket=def_empty,
                    state=defective_state,
                    qty=item.received_defective,
                    txn_type=InventoryTransaction.TxnType.OPENING,
                    reference_id=invoice.invoice_number,
                    notes="Invoice defective"
                )

        invoice.status = "POSTED"
        invoice.save(update_fields=["status"])
        return invoice
