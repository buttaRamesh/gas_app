from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator

class DeliveryRecord(models.Model):
    run = models.ForeignKey("delivery.DeliveryRun", on_delete=models.CASCADE, related_name="records")
    created_at = models.DateTimeField(auto_now_add=True)
    entered_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    # consumer/booking fields (flexible)
    consumer_name = models.CharField(max_length=255)
    consumer_code = models.CharField(max_length=100, blank=True, null=True)
    booking_reference = models.CharField(max_length=100, blank=True, null=True)

    product = models.ForeignKey("inventory.Product", on_delete=models.PROTECT)
    qty_full_delivered = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    qty_empty_collected = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    qty_empty_not_collected = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)],
                                                        help_text="Empties not collected from consumer (pending)")

    remarks = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Delivery Record"
        verbose_name_plural = "Delivery Records"
        indexes = [
            models.Index(fields=["consumer_code"]),
            models.Index(fields=["booking_reference"]),
        ]

    def __str__(self):
        return f"Delivery {self.id} | {self.consumer_name} | {self.product}"
