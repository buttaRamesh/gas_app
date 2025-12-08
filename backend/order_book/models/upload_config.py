from django.db import models
from django.conf import settings
from .mappings import UPLOAD_TYPE_CHOICES


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
