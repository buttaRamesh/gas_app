from decimal import Decimal

from django.db import models
from django.core.validators import MinValueValidator

from inventory.models import CylinderCategory
from inventory.models import Product

# -----------------------------
# Cylinder details (one-to-one)
# -----------------------------
class CylinderDetails(models.Model):
    """
    Cylinder-specific attributes (only for products that represent cylinders).
    Use a one-to-one relation so accessory products do not carry these columns.
    """
    product = models.OneToOneField(
        Product, on_delete=models.CASCADE, related_name="cylinder_details"
    )
    # weight in KG (14.2, 19, 5.0, etc.)
    weight = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Cylinder weight in KG (e.g., 14.2, 19.0, 5.0)"
    )

    cylinder_category = models.ForeignKey(
        CylinderCategory, on_delete=models.PROTECT, related_name="cylinder_products",
        help_text="Logical cylinder group (S-DOM / NS-DOM / BCAP / COM / ...)"
    )

    remarks = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Cylinder Details"
        verbose_name_plural = "Cylinder Details"

    def __str__(self):
        return f"{self.product.name} — {self.weight} KG ({self.cylinder_category.code})"
