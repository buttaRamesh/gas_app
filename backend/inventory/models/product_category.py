from django.db import models

# -----------------------------
# LOOKUP: Product Category
# -----------------------------
class ProductCategory(models.Model):
    """
    High-level product grouping (Cylinder, Regulator, Stove, Accessory, etc.)
    Admin can add / modify / remove rows without code changes.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Product Category"
        verbose_name_plural = "Product Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name
