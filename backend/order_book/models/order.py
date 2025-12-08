from django.db import models
from django.conf import settings


class OrderBook(models.Model):
    """Order book for tracking pending deliveries"""

    class UpdateType(models.TextChoices):
        BULK = 'BULK', 'Bulk Upload'
        MANUAL = 'MANUAL', 'Manual Update'

    # Core fields
    consumer = models.ForeignKey(
        "consumers.Consumer",
        on_delete=models.DO_NOTHING,
        related_name="orders",
    )
    order_no = models.CharField(max_length=30)
    book_date = models.DateField()
    product = models.CharField(max_length=100, blank=True, default='', help_text="Product name")

    # Refill information
    refill_type = models.ForeignKey(
        'order_book.RefillType',
        on_delete=models.PROTECT,
        related_name="orders",
    )
    delivery_flag = models.ForeignKey(
        'order_book.DeliveryFlag',
        on_delete=models.PROTECT,
        related_name="orders",
    )

    # Delivery information
    delivery_date = models.DateField(
        null=True,
        blank=True,
        help_text="Actual delivery date"
    )
    last_delivery_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Last delivery date from CSV bulk upload"
    )
    delivery_person = models.ForeignKey(
        "delivery.DeliveryPerson",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="delivered_orders",
        help_text="Delivery person who delivered this order"
    )

    # Source tracking
    source_file = models.CharField(
        max_length=255,
        blank=True,
        help_text="Source file name for bulk uploads"
    )

    # Tracking fields
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order_updates",
    )
    updated_type = models.CharField(
        max_length=20,
        choices=UpdateType.choices,
        default=UpdateType.MANUAL,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["book_date", "order_no"]
        unique_together = [["consumer", "order_no", "book_date"]]
        indexes = [
            models.Index(fields=["consumer"]),
            models.Index(fields=["order_no", "book_date"]),
            models.Index(fields=["-book_date"]),
            models.Index(fields=["delivery_flag"]),
            models.Index(fields=["delivery_person"]),
        ]

    def __str__(self):
        return f"{self.order_no} - {self.consumer.person.full_name if self.consumer and self.consumer.person else 'N/A'}"

    @property
    def is_pending(self):
        """Check if order is pending (delivery_date is null or before book_date)"""
        if self.delivery_date is None:
            return True
        return self.delivery_date < self.book_date
