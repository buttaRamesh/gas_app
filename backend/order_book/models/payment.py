from django.db import models
from django.conf import settings


class PaymentInfo(models.Model):
    """Payment information for orders"""

    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]

    order = models.OneToOneField(
        'OrderBook',
        on_delete=models.CASCADE,
        related_name='payment_info',
        help_text="Related order"
    )
    payment_option = models.ForeignKey(
        'order_book.PaymentOption',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='payment_records',
        help_text="Payment method (Cash, Online, etc.)"
    )
    cash_memo_no = models.CharField(
        max_length=50,
        blank=True,
        help_text="Cash memo number from delivery"
    )
    payment_date = models.DateField(
        null=True,
        blank=True,
        help_text="Date of payment"
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Payment amount"
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='PENDING'
    )
    transaction_id = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        default=None,
        help_text="Transaction ID for online payments"
    )
    notes = models.TextField(blank=True, null=True, default=None)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Payment Info"
        verbose_name_plural = "Payment Info"
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment for Order {self.order.order_no}"
