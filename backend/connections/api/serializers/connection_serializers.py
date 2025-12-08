# File: connections/api/serializers/connection_serializers.py
from rest_framework import serializers
from connections.models import ConnectionDetails


class ConnectionListCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for LIST and CREATE operations.
    - Returns nested data for listing
    - Accepts IDs for creating new connections
    """
    # Read-only fields for listing
    consumer_number = serializers.CharField(source='consumer.consumer_number', read_only=True)
    consumer_name = serializers.SerializerMethodField(read_only=True)
    connection_type_name = serializers.CharField(source='connection_type.name', read_only=True)
    product_display = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ConnectionDetails
        fields = [
            'id',
            'consumer',
            'consumer_number',
            'consumer_name',
            'sv_number',
            'sv_date',
            'connection_type',
            'connection_type_name',
            'product',
            'product_display',
            'num_of_regulators',
            'hist_code_description',
        ]

    def get_consumer_name(self, obj):
        """Get consumer name"""
        if obj.consumer and obj.consumer.person:
            return obj.consumer.person.full_name
        return None

    def get_product_display(self, obj):
        """Get product formatted string"""
        if not obj.product:
            return None
        return f'{obj.product.product_code} {obj.product.name}'

    def validate(self, data):
        """
        Validation:
        - Consumer cannot have duplicate sv_number
        - Same sv_number can exist for different consumers
        """
        sv_number = data.get('sv_number')
        consumer = data.get('consumer')

        if sv_number and consumer:
            # Check if this consumer already has a connection with this sv_number
            existing = ConnectionDetails.objects.filter(
                consumer=consumer,
                sv_number=sv_number
            )

            if existing.exists():
                raise serializers.ValidationError({
                    'sv_number': f'Consumer {consumer.consumer_number} already has a connection with SV number {sv_number}'
                })

        return data


class ConnectionDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for RETRIEVE, UPDATE, PATCH, DELETE operations.
    - Returns detailed nested data
    - sv_number and consumer are read-only (cannot be updated)
    """
    # Read-only fields (display nested data)
    consumer_number = serializers.CharField(source='consumer.consumer_number', read_only=True)
    consumer_name = serializers.SerializerMethodField(read_only=True)
    connection_type_name = serializers.CharField(source='connection_type.name', read_only=True)
    product_display = serializers.SerializerMethodField(read_only=True)
    product_code = serializers.CharField(source='product.product_code', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = ConnectionDetails
        fields = [
            'id',
            'consumer',
            'consumer_number',
            'consumer_name',
            'sv_number',
            'sv_date',
            'connection_type',
            'connection_type_name',
            'product',
            'product_code',
            'product_name',
            'product_display',
            'num_of_regulators',
            'hist_code_description',
        ]
        # sv_number and consumer cannot be updated
        read_only_fields = ['id', 'consumer', 'sv_number']

    def get_consumer_name(self, obj):
        """Get consumer name"""
        if obj.consumer and obj.consumer.person:
            return obj.consumer.person.full_name
        return None

    def get_product_display(self, obj):
        """Get product formatted string"""
        if not obj.product:
            return None
        return f'{obj.product.product_code} {obj.product.name}'