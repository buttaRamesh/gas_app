from django.db import models
from django.conf import settings

# Upload Type Choices (shared across models)
UPLOAD_TYPE_CHOICES = [
    ('PENDING', 'Pending Orders'),
    ('DELIVERY', 'Delivery Marking'),
]

# File Format Choices
FILE_FORMAT_CHOICES = [
    ('CSV', 'CSV File'),
    ('EXCEL', 'Excel File'),
]


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
