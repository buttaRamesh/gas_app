from django.db import models
from django.conf import settings

class DeliverySummary(models.Model):
    run = models.OneToOneField("delivery.DeliveryRun", on_delete=models.CASCADE, related_name="summary")
    recorded_at = models.DateTimeField(auto_now_add=True)
    entered_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Delivery Summary"
        verbose_name_plural = "Delivery Summaries"

    def __str__(self):
        return f"Summary for Run {self.run.id}"


class DeliverySummaryItem(models.Model):
    summary = models.ForeignKey(DeliverySummary, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("inventory.Product", on_delete=models.PROTECT)

    # Per-product totals (Option A - authoritative)
    total_full_loaded = models.PositiveIntegerField(default=0)
    total_full_delivered = models.PositiveIntegerField(default=0)
    total_empty_collected = models.PositiveIntegerField(default=0)
    total_unsold_full = models.PositiveIntegerField(default=0)
    total_defective = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Delivery Summary Item"
        verbose_name_plural = "Delivery Summary Items"

    def __str__(self):
        return f"{self.product} summary (Run {self.summary.run.id})"
