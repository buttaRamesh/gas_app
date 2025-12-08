from django.db import models

class InventoryState(models.Model):
    """
    Physical state classification:
    FULL / EMPTY / DEFECTIVE / NEW / BROKEN / DAMAGED etc.
    Can be freely extended.
    """
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Inventory State"
        verbose_name_plural = "Inventory States"
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} — {self.name}"