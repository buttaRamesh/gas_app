from django.db import models

# Use string references to avoid circular imports with routes app
# DeliveryPerson and Route are assumed to be in app 'routes'
# If your app names differ, change 'routes.DeliveryPerson' accordingly.

class DeliveryRun(models.Model):
    STATUS_CHOICES = [
        ("OPEN", "Open"),
        ("RETURNED", "Returned"),
        ("RECONCILED", "Reconciled"),
        ("CANCELLED", "Cancelled"),
    ]

    delivery_person = models.ForeignKey(
        "delivery.DeliveryPerson", on_delete=models.PROTECT, related_name="runs"
    )
    run_date = models.DateField()
    started_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="OPEN")
    notes = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Delivery Run"
        verbose_name_plural = "Delivery Runs"
        indexes = [
            models.Index(fields=["delivery_person", "run_date"]),
        ]

    def __str__(self):
        return f"Run {self.id} | {self.delivery_person} | {self.run_date}"


class DeliveryRunRoute(models.Model):
    run = models.ForeignKey(DeliveryRun, on_delete=models.CASCADE, related_name="routes")
    route = models.ForeignKey("routes.Route", on_delete=models.PROTECT)
    order = models.PositiveIntegerField(default=0, help_text="Sequence order for route visits")

    class Meta:
        verbose_name = "Delivery Run Route"
        verbose_name_plural = "Delivery Run Routes"
        ordering = ["order"]

    def __str__(self):
        return f"Run {self.run.id} -> {self.route}"
