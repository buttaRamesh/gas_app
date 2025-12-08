from decimal import Decimal


from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator

from inventory.models import Product
# -----------------------------
# Product Price (history)
# -----------------------------
class ProductPrice(models.Model):
    """
    Price history table. Create rows with effective_date.
    Mark the current active price with is_active=True (optional, but handy).
    """
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="prices"
    )
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))]
    )
    effective_date = models.DateField(help_text="Date when this price becomes effective")
    is_active = models.BooleanField(default=True)
    remarks = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Product Price"
        verbose_name_plural = "Product Prices"
        ordering = ["-effective_date"]
        indexes = [
            models.Index(fields=["-effective_date"]),
            models.Index(fields=["product", "effective_date"]),
        ]

    def __str__(self):
        return f"{self.product.name} — ₹{self.price} (from {self.effective_date})"
    
