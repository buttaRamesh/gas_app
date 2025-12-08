from rest_framework import serializers
from order_book.models import BulkUploadHistory


class BulkUploadSerializer(serializers.Serializer):
    """Serializer for bulk upload CSV or Excel file"""
    file = serializers.FileField(
        help_text="CSV (.csv) or Excel (.xlsx) file for bulk upload"
    )

    def validate_file(self, value):
        """Validate that the file is a CSV or Excel file"""
        if not (value.name.endswith('.csv') or value.name.endswith('.xlsx')):
            raise serializers.ValidationError("File must be a CSV (.csv) or Excel (.xlsx) file.")
        return value


class BulkUploadHistoryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bulk upload history records"""

    class Meta:
        model = BulkUploadHistory
        fields = [
            'file_name',
            'file_type',
            'file_size',
            'upload_type',
            'row_count',
            'success_count',
            'error_count',
            'skipped_count',
            'status',
            'uploaded_by',
            'error_summary',
        ]


class BulkUploadHistorySerializer(serializers.ModelSerializer):
    """Serializer for reading/displaying bulk upload history"""

    uploaded_by_name = serializers.SerializerMethodField()
    upload_type_display = serializers.CharField(source='get_upload_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    file_size_mb = serializers.SerializerMethodField()

    def get_uploaded_by_name(self, obj):
        """Get username or return 'System' if null"""
        return obj.uploaded_by.employee_id if obj.uploaded_by else 'System'

    def get_file_size_mb(self, obj):
        """Convert file size from bytes to MB"""
        return round(obj.file_size / (1024 * 1024), 2)

    class Meta:
        model = BulkUploadHistory
        fields = [
            'id',
            'file_name',
            'file_type',
            'file_size',
            'file_size_mb',
            'upload_type',
            'upload_type_display',
            'row_count',
            'success_count',
            'error_count',
            'skipped_count',
            'status',
            'status_display',
            'uploaded_by',
            'uploaded_by_name',
            'uploaded_at',
            'error_summary',
        ]
        read_only_fields = ['id', 'uploaded_at']
