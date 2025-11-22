"""
Base serializers with common functionality
"""
from rest_framework import serializers
from django.utils import timezone
from typing import Dict, Any


class BaseModelSerializer(serializers.ModelSerializer):
    """
    Base serializer with common fields and functionality
    """

    # Add these as read-only fields if they exist in the model
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    created_by = serializers.StringRelatedField(read_only=True)
    updated_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        abstract = True

    def validate(self, attrs):
        """
        Common validation logic
        """
        # Remove None values from attrs
        attrs = {k: v for k, v in attrs.items() if v is not None}

        # Call parent validation
        return super().validate(attrs)

    def to_representation(self, instance):
        """
        Customize output representation
        """
        data = super().to_representation(instance)

        # Format datetime fields consistently
        for field_name, field in self.fields.items():
            if isinstance(field, serializers.DateTimeField) and data.get(field_name):
                # Already in ISO format, just ensure consistency
                pass

        return data


class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    """
    A ModelSerializer that allows you to dynamically select fields via query params

    Usage: ?fields=field1,field2,field3
    """

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop('fields', None)

        # Instantiate the superclass normally
        super().__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class TimestampedModelSerializer(BaseModelSerializer):
    """
    Serializer for models with timestamp fields
    """

    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        abstract = True


class AuditedModelSerializer(TimestampedModelSerializer):
    """
    Serializer for models with full audit trail
    """

    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.full_name', read_only=True)

    class Meta:
        abstract = True


class BulkCreateSerializer(serializers.Serializer):
    """
    Serializer for bulk create operations
    """

    objects = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=False,
        help_text="List of objects to create"
    )


class BulkUpdateSerializer(serializers.Serializer):
    """
    Serializer for bulk update operations
    """

    updates = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=False,
        help_text="List of objects to update with their IDs"
    )


class BulkDeleteSerializer(serializers.Serializer):
    """
    Serializer for bulk delete operations
    """

    ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
        help_text="List of IDs to delete"
    )


class StatusUpdateSerializer(serializers.Serializer):
    """
    Serializer for status update operations
    """

    is_active = serializers.BooleanField(required=True)
    reason = serializers.CharField(required=False, allow_blank=True)


class AddressSerializer(serializers.Serializer):
    """
    Reusable address serializer
    """

    address_line1 = serializers.CharField(max_length=255)
    address_line2 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    pincode = serializers.CharField(max_length=6)
    country = serializers.CharField(max_length=100, default='India')


class ContactSerializer(serializers.Serializer):
    """
    Reusable contact information serializer
    """

    phone = serializers.CharField(max_length=15)
    alternate_phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)


class PaginationSerializer(serializers.Serializer):
    """
    Serializer for paginated responses
    """

    count = serializers.IntegerField()
    next = serializers.URLField(allow_null=True)
    previous = serializers.URLField(allow_null=True)
    results = serializers.ListField()


class ErrorSerializer(serializers.Serializer):
    """
    Serializer for error responses
    """

    success = serializers.BooleanField(default=False)
    message = serializers.CharField()
    errors = serializers.DictField(required=False)


class SuccessSerializer(serializers.Serializer):
    """
    Serializer for success responses
    """

    success = serializers.BooleanField(default=True)
    message = serializers.CharField()
    data = serializers.DictField(required=False)


# Common validation mixins

class RequiredFieldsMixin:
    """
    Mixin to enforce required fields
    """

    required_fields = []

    def validate(self, attrs):
        """
        Validate required fields are present
        """
        missing_fields = []
        for field in self.required_fields:
            if field not in attrs or not attrs[field]:
                missing_fields.append(field)

        if missing_fields:
            raise serializers.ValidationError({
                field: f"{field} is required" for field in missing_fields
            })

        return super().validate(attrs)


class UniqueTogetherValidationMixin:
    """
    Mixin to validate unique_together constraints
    """

    unique_together_fields = []

    def validate(self, attrs):
        """
        Validate unique_together constraints
        """
        if self.unique_together_fields and hasattr(self.Meta, 'model'):
            model = self.Meta.model
            filters = {}

            for field in self.unique_together_fields:
                if field in attrs:
                    filters[field] = attrs[field]

            if filters:
                queryset = model.objects.filter(**filters)

                # Exclude current instance if updating
                if self.instance:
                    queryset = queryset.exclude(pk=self.instance.pk)

                if queryset.exists():
                    raise serializers.ValidationError(
                        f"Object with these {', '.join(filters.keys())} already exists"
                    )

        return super().validate(attrs)


class PositiveNumberValidationMixin:
    """
    Mixin to validate positive numbers
    """

    positive_number_fields = []

    def validate(self, attrs):
        """
        Validate positive number fields
        """
        for field in self.positive_number_fields:
            if field in attrs and attrs[field] is not None:
                if attrs[field] <= 0:
                    raise serializers.ValidationError({
                        field: f"{field} must be a positive number"
                    })

        return super().validate(attrs)
