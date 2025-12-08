from django.db import models


class ConnectionDetails(models.Model):
    """
    Connection details for a consumer.
    Each consumer can have multiple connections.
    """
    consumer = models.ForeignKey(
        'consumers.Consumer',
        on_delete=models.CASCADE,
        related_name='connections'
    )

    sv_number = models.CharField("Service number", max_length=50, blank=True, null=True)
    sv_date = models.DateField("Service initiation date", blank=True, null=True)
    hist_code_description = models.CharField(
        "History/category description",
        max_length=150,
        blank=True,
        null=True
    )

    connection_type = models.ForeignKey(
        'lookups.ConnectionType',
        verbose_name="Connection Type",
        on_delete=models.PROTECT
    )

    product = models.ForeignKey(
        'inventory.Product',
        verbose_name="Product",
        on_delete=models.PROTECT
    )

    num_of_regulators = models.PositiveIntegerField(
        "Number of Regulators",
        default=1
    )

    def __str__(self):
        try:
            return f"{self.sv_number} ({self.product.name})"
        except (AttributeError, self.product.DoesNotExist):
            return self.sv_number

    class Meta:
        verbose_name = "Connection Details"
        verbose_name_plural = "Connection Details"
        indexes = [
            models.Index(fields=['consumer', 'connection_type']),
            models.Index(fields=['sv_date']),
            models.Index(fields=['product']),
        ]
