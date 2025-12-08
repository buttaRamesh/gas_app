from django.db import models
from django.core.exceptions import ValidationError
from inventory.models import Product


class InvoiceHeader(models.Model):

    INVOICE_STATUS = (
        ("DRAFT", "Draft"),
        ("POSTED", "Posted"),
        ("CANCELLED", "Cancelled"),
    )

    invoice_number = models.CharField(max_length=50, unique=True)
    challan_number = models.CharField(max_length=100, blank=True, null=True)
    vehicle_number = models.CharField(max_length=50, blank=True, null=True)
    depot_name = models.CharField(max_length=200, blank=True, null=True)
    received_by = models.CharField(max_length=200, blank=True, null=True)

    received_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=INVOICE_STATUS, default="DRAFT")
    remarks = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Invoice"
        verbose_name_plural = "Invoices"
        ordering = ["-received_at"]

    def __str__(self):
        return f"Invoice {self.invoice_number} [{self.status}]"



class InvoiceItem(models.Model):
    header = models.ForeignKey(
        InvoiceHeader,
        on_delete=models.CASCADE,
        related_name="items"
    )
    product = models.ForeignKey(Product, on_delete=models.PROTECT)

    received_full = models.PositiveIntegerField(default=0)
    received_empty = models.PositiveIntegerField(default=0)
    received_defective = models.PositiveIntegerField(default=0)

    notes = models.CharField(max_length=200, blank=True, null=True)

    def clean(self):
        if (
            self.received_full +
            self.received_empty +
            self.received_defective
        ) <= 0:
            raise ValidationError("Invoice item must have at least one quantity.")

    def __str__(self):
        return f"{self.product} — F:{self.received_full} E:{self.received_empty} D:{self.received_defective}"
