from django.db import models

class InventoryBucket(models.Model):
    """
    Logical stock buckets (Godown, CM_OUT, SBC, DBC, etc.)
    Fully dynamic: can add/remove without code changes.
    """
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Inventory Bucket"
        verbose_name_plural = "Inventory Buckets"
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} — {self.name}"

    