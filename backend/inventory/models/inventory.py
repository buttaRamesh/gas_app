from django.db import models

from inventory.models import Product
from inventory.models import InventoryBucket
from inventory.models import InventoryState


class Inventory(models.Model):
    """
    Summary table: product × bucket × state = quantity
    """

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="inventory_rows"
    )

    bucket = models.ForeignKey(
        InventoryBucket,
        on_delete=models.PROTECT,
        related_name="inventory_rows"
    )

    state = models.ForeignKey(
        InventoryState,
        on_delete=models.PROTECT,
        related_name="inventory_rows"
    )

    quantity = models.PositiveIntegerField(default=0)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Inventory"
        verbose_name_plural = "Inventory"
        unique_together = ("product", "bucket", "state")
        indexes = [
            models.Index(fields=["product", "bucket"]),
            models.Index(fields=["bucket"]),
        ]

    def __str__(self):
        return f"{self.product} | {self.bucket.code} | {self.state.code} = {self.quantity}"
    
