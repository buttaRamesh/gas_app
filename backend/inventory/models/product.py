from django.db import models#  
from django.core.exceptions import ValidationError

from inventory.models.product_category import ProductCategory
from inventory.models.unit import Unit

# -----------------------------
# MASTER: Product
# -----------------------------
class Product(models.Model):
    """
    Master product table for every stockable/sellable item.
    - For cylinders: set is_cylinder=True and provide product_code (OMC).
    - For accessories/etc: is_cylinder=False and product_code should be empty.
    """
    name = models.CharField(max_length=200)
    product_code = models.CharField(
        max_length=20, unique=True, null=True, blank=True,
        help_text="OMC product code (required for cylinder products). Unique when present."
    )

    category = models.ForeignKey(
        ProductCategory, on_delete=models.PROTECT, related_name="products"
    )

    unit = models.ForeignKey(
        Unit, on_delete=models.PROTECT, related_name="products",
        help_text="Unit of measurement (pcs, cyl, etc.)"
    )

    is_cylinder = models.BooleanField(default=False)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"
        ordering = ["name"]
        indexes = [
            models.Index(fields=["product_code"]),
            models.Index(fields=["is_cylinder"]),
        ]

    def __str__(self):
        code = f" [{self.product_code}]" if self.product_code else ""
        return f"{self.name}{code}"

    def clean(self):
        """
        Enforce the rule:
        - If is_cylinder -> product_code must be provided.
        - If not a cylinder -> product_code should be empty (recommended).
        This is application-level validation; migrations still allow null product_code.
        """
        if self.is_cylinder and not self.product_code:
            raise ValidationError({"product_code": "product_code is required for cylinder products."})

        # optional: guard against assigning a product_code to a non-cylinder
        if not self.is_cylinder and self.product_code:
            raise ValidationError({"product_code": "Non-cylinder products should not have a product_code."})
