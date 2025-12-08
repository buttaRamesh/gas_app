from rest_framework import serializers
from order_book.models import FieldConfiguration, ColumnMapping


class FieldConfigurationSerializer(serializers.ModelSerializer):
    upload_type_display = serializers.CharField(source='get_upload_type_display', read_only=True)

    class Meta:
        model = FieldConfiguration
        fields = [
            'id',
            'upload_type',
            'upload_type_display',
            'field_name',
            'is_included',
            'is_required',
            'display_order',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class ColumnMappingSerializer(serializers.ModelSerializer):
    """Serializer for column mapping configurations"""
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True)
    upload_type_display = serializers.CharField(source="get_upload_type_display", read_only=True)
    file_format_display = serializers.CharField(source="get_file_format_display", read_only=True)

    class Meta:
        model = ColumnMapping
        fields = [
            "id",
            "name",
            "upload_type",
            "upload_type_display",
            "file_format",
            "file_format_display",
            "description",
            "mappings",
            "is_active",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]
