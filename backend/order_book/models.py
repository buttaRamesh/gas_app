from django.db import models
from django.conf import settings


# Upload Type Choices (shared across models)
# Note: Upload type represents the data type, not the file format (CSV/Excel)
UPLOAD_TYPE_CHOICES = [
    ('PENDING', 'Pending Orders'),
    ('DELIVERY', 'Delivery Marking'),
]

# File Format Choices
FILE_FORMAT_CHOICES = [
    ('CSV', 'CSV File'),
    ('EXCEL', 'Excel File'),
]


# Field Configuration Model
class FieldConfiguration(models.Model):
    """Configure which OrderBook fields are visible for each upload type"""

    upload_type = models.CharField(
        max_length=20,
        choices=UPLOAD_TYPE_CHOICES,
        help_text="Type of upload this configuration applies to"
    )
    field_name = models.CharField(
        max_length=100,
        help_text="OrderBook model field name (e.g., 'consumer', 'order_no')"
    )
    is_included = models.BooleanField(
        default=True,
        help_text="Include this field in column mapping for this upload type"
    )
    is_required = models.BooleanField(
        default=False,
        help_text="Override: Is this field required for this upload type?"
    )
    display_order = models.IntegerField(
        default=0,
        help_text="Order in which field appears in mapping dialog"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['upload_type', 'display_order', 'field_name']
        unique_together = [['upload_type', 'field_name']]
        verbose_name = "Field Configuration"
        verbose_name_plural = "Field Configurations"
        indexes = [
            models.Index(fields=['upload_type']),
            models.Index(fields=['upload_type', 'is_included']),
        ]

    def __str__(self):
        status = "✓" if self.is_included else "✗"
        req = " (required)" if self.is_required else ""
        return f"{self.get_upload_type_display()}: {status} {self.field_name}{req}"


# Column Mapping Model
class ColumnMapping(models.Model):
    """Store column mapping configurations for different upload types and file formats"""

    name = models.CharField(max_length=100, help_text="Mapping configuration name")
    upload_type = models.CharField(
        max_length=20,
        choices=UPLOAD_TYPE_CHOICES,
        blank=True,
        default='',
        help_text="Type of upload this mapping is for (PENDING or DELIVERY)"
    )
    file_format = models.CharField(
        max_length=10,
        choices=FILE_FORMAT_CHOICES,
        default='CSV',
        help_text="File format this mapping is for (CSV or EXCEL)"
    )
    description = models.TextField(blank=True, help_text="Optional description")
    mappings = models.JSONField(help_text="Column mapping dictionary")
    is_active = models.BooleanField(default=True, help_text="Is this mapping active?")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="column_mappings"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["upload_type", "file_format"]
        verbose_name = "Column Mapping"
        verbose_name_plural = "Column Mappings"
        unique_together = [['upload_type', 'file_format']]

    def __str__(self):
        return f"{self.get_upload_type_display()} - {self.get_file_format_display()}"


# Lookup Models
class RefillType(models.Model):
    """Lookup table for refill types (BharatgasMApps, PayNBook Apps, JIO IVRS, etc.)"""
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        # db_table = "refill_type"
        verbose_name = "Refill Type"
        verbose_name_plural = "Refill Types"
        ordering = ["name"]


class DeliveryFlag(models.Model):
    """Lookup table for delivery flags (Booked Not Printed, Delivered, etc.)"""
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        # db_table = "delivery_flag"
        verbose_name = "Delivery Flag"
        verbose_name_plural = "Delivery Flags"
        ordering = ["name"]


class PaymentOption(models.Model):
    """Lookup table for payment options (COD, Online Payment, etc.)"""
    name = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        # db_table = "payment_option"
        verbose_name = "Payment Option"
        verbose_name_plural = "Payment Options"
        ordering = ["name"]


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
        PaymentOption,
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
        RefillType,
        on_delete=models.PROTECT,
        related_name="orders",
    )
    delivery_flag = models.ForeignKey(
        DeliveryFlag,
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
        # db_table = "order_book"
        ordering = ["book_date", "order_no"]  # Ascending by book date, then order number
        unique_together = [["consumer", "order_no", "book_date"]]
        indexes = [
            models.Index(fields=["consumer"]),
            models.Index(fields=["order_no", "book_date"]),
            models.Index(fields=["-book_date"]),
            models.Index(fields=["delivery_flag"]),
            models.Index(fields=["delivery_person"]),
        ]

    def __str__(self):
        return f"{self.order_no} – {self.consumer.full_name if self.consumer else 'N/A'}"

    @property
    def is_pending(self):
        """Check if order is pending (delivery_date is null or before book_date)"""
        if self.delivery_date is None:
            return True
        return self.delivery_date < self.book_date


class BulkUploadHistory(models.Model):
    """Track bulk upload operations for audit and monitoring"""

    STATUS_CHOICES = [
        ('SUCCESS', 'Success'),
        ('PARTIAL', 'Partial Success'),
        ('FAILED', 'Failed'),
    ]

    # File information
    file_name = models.CharField(max_length=255, help_text="Name of uploaded file")
    file_type = models.CharField(max_length=10, help_text="File type: CSV or XLSX")
    file_size = models.IntegerField(help_text="File size in bytes")

    # Upload details
    upload_type = models.CharField(
        max_length=20,
        choices=UPLOAD_TYPE_CHOICES,
        help_text="Type of upload: PENDING or DELIVERY"
    )
    row_count = models.IntegerField(help_text="Number of data rows (excluding header)")

    # Processing results
    success_count = models.IntegerField(default=0, help_text="Number of successfully processed rows")
    error_count = models.IntegerField(default=0, help_text="Number of rows with errors")
    skipped_count = models.IntegerField(default=0, null=True, blank=True, help_text="Number of skipped rows")

    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        help_text="Overall upload status"
    )

    # Metadata
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="upload_history"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    # Optional error details
    error_summary = models.TextField(blank=True, null=True, help_text="Summary of errors (max 5000 chars)")

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = "Bulk Upload History"
        verbose_name_plural = "Bulk Upload Histories"
        indexes = [
            models.Index(fields=['upload_type']),
            models.Index(fields=['status']),
            models.Index(fields=['-uploaded_at']),
        ]

    def __str__(self):
        return f"{self.file_name} - {self.get_upload_type_display()} ({self.status})"
