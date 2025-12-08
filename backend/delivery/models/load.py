from django.db import models
from django.core.validators import MinValueValidator

from inventory.models import Product


class DeliveryLoad(models.Model):
    run = models.ForeignKey("delivery.DeliveryRun", on_delete=models.CASCADE, related_name="loads")
    load_number = models.PositiveIntegerField(default=1, editable=False)  # auto-generated
    loaded_at = models.DateTimeField(auto_now_add=True)
    remarks = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ("run", "load_number")
        verbose_name = "Delivery Load"
        verbose_name_plural = "Delivery Loads"

    def save(self, *args, **kwargs):
        # Auto-generate next load number only when creating new record
        if not self.pk:
            # Find highest load_number for this run
            last_number = (
                DeliveryLoad.objects.filter(run=self.run)
                .aggregate(max("load_number"))
                .get("load_number__max")
            )
            self.load_number = (last_number or 0) + 1

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Load {self.load_number} @ Run {self.run.id}"


class DeliveryLoadItem(models.Model):
    load = models.ForeignKey(DeliveryLoad, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    qty_full_loaded = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])

    class Meta:
        verbose_name = "Delivery Load Item"
        verbose_name_plural = "Delivery Load Items"

    def __str__(self):
        return f"{self.product} x {self.qty_full_loaded} (Load {self.load.load_number})"

