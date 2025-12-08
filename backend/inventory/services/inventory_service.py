# inventory/services/inventory_service.py

from django.db import transaction
from django.core.exceptions import ValidationError

from inventory.models import (
    Product,
    Inventory,
    InventoryBucket,
    InventoryState,
    InventoryTransaction
)


class InventoryService:
    """
    Centralized service to update stock + create ledger transactions.

    Use cases:
    - GRN (goods received)
    - Delivery assignment
    - Delivery to customer
    - Empty return
    - Defective movement
    - Admin adjustments
    - Opening stock load
    """

    # ============================================================
    # PUBLIC API
    # ============================================================

    @staticmethod
    @transaction.atomic
    def increase_stock(product, bucket, state, qty, txn_type, reference_id=None, notes=None):
        """
        Increase stock in a specific bucket & state.
        Creates a ledger entry.
        """
        if qty <= 0:
            raise ValidationError("Quantity must be > 0")

        inv, _ = Inventory.objects.get_or_create(
            product=product,
            bucket=bucket,
            state=state,
            defaults={"quantity": 0}
        )

        inv.quantity += qty
        inv.save()

        InventoryService._create_txn(
            product=product,
            from_bucket=None,
            to_bucket=bucket,
            from_state=None,
            to_state=state,
            qty=qty,
            txn_type=txn_type,
            reference_id=reference_id,
            notes=notes
        )

        return inv

    @staticmethod
    @transaction.atomic
    def decrease_stock(product, bucket, state, qty, txn_type, reference_id=None, notes=None):
        """
        Reduce stock from a specific bucket/state.

        Automatically prevents negative stock.
        """
        if qty <= 0:
            raise ValidationError("Quantity must be > 0")

        try:
            inv = Inventory.objects.get(product=product, bucket=bucket, state=state)
        except Inventory.DoesNotExist:
            raise ValidationError(f"No inventory found for {product} in {bucket} / {state}")

        if inv.quantity < qty:
            raise ValidationError(
                f"Insufficient stock for {product} in bucket={bucket.code}, state={state.code}"
            )

        inv.quantity -= qty
        inv.save()

        InventoryService._create_txn(
            product=product,
            from_bucket=bucket,
            to_bucket=None,
            from_state=state,
            to_state=None,
            qty=qty,
            txn_type=txn_type,
            reference_id=reference_id,
            notes=notes
        )

        return inv

    @staticmethod
    @transaction.atomic
    def move(product, from_bucket, from_state, to_bucket, to_state, qty, txn_type, reference_id=None, notes=None):
        """
        Move stock from one bucket/state → another bucket/state.
        Example:  
        Godown/Full → CM_OUT/Full  
        CM_OUT/Full → Godown/Empty  
        Godown/Empty → DEF_EMPTY  
        """

        # Step 1: Decrease from source
        InventoryService.decrease_stock(
            product=product,
            bucket=from_bucket,
            state=from_state,
            qty=qty,
            txn_type=txn_type,
            reference_id=reference_id,
            notes=notes
        )

        # Step 2: Increase in destination
        InventoryService.increase_stock(
            product=product,
            bucket=to_bucket,
            state=to_state,
            qty=qty,
            txn_type=txn_type,
            reference_id=reference_id,
            notes=notes
        )

        # Step 3: Create a combined movement ledger entry
        InventoryService._create_txn(
            product=product,
            from_bucket=from_bucket,
            to_bucket=to_bucket,
            from_state=from_state,
            to_state=to_state,
            qty=qty,
            txn_type=txn_type,
            reference_id=reference_id,
            notes=notes
        )

    # ============================================================
    # INTERNAL UTILITY
    # ============================================================

    @staticmethod
    def _create_txn(product, from_bucket, to_bucket, from_state, to_state, qty, txn_type, reference_id=None, notes=None):
        """Internal helper to write transaction ledger."""
        InventoryTransaction.objects.create(
            product=product,
            from_bucket=from_bucket,
            to_bucket=to_bucket,
            from_state=from_state,
            to_state=to_state,
            quantity=qty,
            txn_type=txn_type,
            reference_id=reference_id,
            notes=notes
        )
