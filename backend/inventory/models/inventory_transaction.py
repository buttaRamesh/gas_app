from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal

from .product import Product
from .inventory import Inventory
from .inventory_bucket import InventoryBucket
from .inventory_state import InventoryState


class InventoryTransaction(models.Model):
    """
    Ledger for every stock movement.
    Each movement updates the Inventory table.

    Example txns:
    - GRN (Depot → Godown/Full)
    - Delivery Assignment (Godown/Full → CM_OUT/Full)
    - Delivery Completion (CM_OUT/Full → Godown/Empty)
    - Defective Return (Godown/Empty → DEF_EMPTY)
    """

    # ---------------------------------------------------------
    # TRANSACTION TYPES (Lookup-friendly simple string field)
    # ---------------------------------------------------------
    class TxnType(models.TextChoices):
        GRN = "GRN", "Goods Received Note"
        ASSIGN = "ASSIGN", "Delivery Assignment"
        DELIVERY = "DELIVERY", "Customer Delivery"
        RETURN = "RETURN", "Empty Cylinder Return"
        TRANSFER = "TRANSFER", "Bucket Transfer"
        ADJUSTMENT = "ADJUSTMENT", "Manual Adjustment"
        OPENING = "OPENING", "Opening Stock Load"

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="inventory_transactions"
    )

    # From → To bucket relationship
    from_bucket = models.ForeignKey(
        InventoryBucket,
        on_delete=models.PROTECT,
        related_name="txn_from_bucket",
        null=True, blank=True
    )
    to_bucket = models.ForeignKey(
        InventoryBucket,
        on_delete=models.PROTECT,
        related_name="txn_to_bucket",
        null=True, blank=True
    )

    # From → To state (FULL / EMPTY / DEFECTIVE)
    from_state = models.ForeignKey(
        InventoryState,
        on_delete=models.PROTECT,
        related_name="txn_from_state",
        null=True, blank=True
    )
    to_state = models.ForeignKey(
        InventoryState,
        on_delete=models.PROTECT,
        related_name="txn_to_state",
        null=True, blank=True
    )

    # Change in quantity (always positive)
    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)]
    )

    txn_type = models.CharField(
        max_length=20,
        choices=TxnType.choices
    )

    # Optional references (Route, GRN, Booking, etc.)
    reference_id = models.CharField(
        max_length=100,
        null=True, blank=True,
        help_text="Reference number (GRN No, Route ID, Booking ID etc.)"
    )

    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Inventory Transaction"
        verbose_name_plural = "Inventory Transactions"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["product", "txn_type"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return (
            f"{self.txn_type}: {self.product} | "
            f"{self.from_bucket}->{self.to_bucket} | {self.quantity}"
        )

