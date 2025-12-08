from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError

from inventory.models import Product  # via inventory.models/__init__.py


class GRNHeader(models.Model):
    """
    Goods Received Note header (one per truck/challan).
    """
    GRN_STATUS = (
        ("DRAFT", "Draft"),
        ("POSTED", "Posted"),
        ("CANCELLED", "Cancelled"),
    )

    grn_number = models.CharField(max_length=50, unique=True)
    challan_number = models.CharField(max_length=100, blank=True, null=True)
    vehicle_number = models.CharField(max_length=50, blank=True, null=True)
    supplier_name = models.CharField(max_length=200, blank=True, null=True)
    received_by = models.CharField(max_length=200, blank=True, null=True)
    received_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=GRN_STATUS, default="DRAFT")
    remarks = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "GRN Header"
        verbose_name_plural = "GRN Headers"
        ordering = ["-received_at"]

    def __str__(self):
        return f"GRN {self.grn_number} [{self.status}]"

    def clean(self):
        # small guard: drafted GRN must have at least one item (checked in service)
        pass


class GRNItem(models.Model):
    """
    Line item: product-wise quantities received in the GRN.
    (We store separate counts for full/empty/defective.)
    """
    header = models.ForeignKey(GRNHeader, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="grn_items")

    # these are integers (counts)
    received_full = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    received_empty = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    received_defective = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])

    notes = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        verbose_name = "GRN Item"
        verbose_name_plural = "GRN Items"

    def clean(self):
        if (self.received_full + self.received_empty + self.received_defective) <= 0:
            raise ValidationError("At least one of received_full/received_empty/received_defective must be > 0")

    def __str__(self):
        return f"{self.product} — F:{self.received_full} E:{self.received_empty} D:{self.received_defective}"
