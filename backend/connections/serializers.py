# File: connections/serializers.py
from rest_framework import serializers
from .models import ConnectionDetails


class ConnectionDetailsListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for list views.
    Returns only essential fields for better performance.
    """
    connection_type_name = serializers.CharField(source='connection_type.name', read_only=True)
    product_code = serializers.CharField(source='product.product_code', read_only=True)
    product_category_name = serializers.CharField(source='product.product.name', read_only=True)
    product_variant_name = serializers.CharField(source='product.name', read_only=True)
    product_quantity = serializers.FloatField(source='product.quantity', read_only=True)
    product_unit = serializers.CharField(source='product.unit.short_name', read_only=True)
    consumer_name = serializers.CharField(source='consumer.person.person_name', read_only=True)
    consumer_number = serializers.CharField(source='consumer.consumer_number', read_only=True)

    class Meta:
        model = ConnectionDetails
        fields = [
            'id',
            'sv_number',
            'sv_date',
            'hist_code_description',
            'consumer',
            'consumer_name',
            'consumer_number',
            'connection_type',
            'connection_type_name',
            'product',
            'product_code',
            'product_category_name',
            'product_variant_name',
            'product_quantity',
            'product_unit',
            'num_of_regulators',
        ]


class ConnectionDetailsSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for single connection view.
    Includes all fields and nested relationships.
    """
    connection_type_name = serializers.CharField(source='connection_type.name', read_only=True)
    product_code = serializers.CharField(source='product.product_code', read_only=True)
    product_category_name = serializers.CharField(source='product.product.name', read_only=True)
    product_variant_name = serializers.CharField(source='product.name', read_only=True)
    product_quantity = serializers.FloatField(source='product.quantity', read_only=True)
    product_unit = serializers.CharField(source='product.unit.short_name', read_only=True)
    consumer_name = serializers.CharField(source='consumer.person.person_name', read_only=True)
    consumer_number = serializers.CharField(source='consumer.consumer_number', read_only=True)

    class Meta:
        model = ConnectionDetails
        fields = [
            'id',
            'sv_number',
            'sv_date',
            'hist_code_description',
            'consumer',
            'consumer_name',
            'consumer_number',
            'connection_type',
            'connection_type_name',
            'product',
            'product_code',
            'product_category_name',
            'product_variant_name',
            'product_quantity',
            'product_unit',
            'num_of_regulators',
        ]


class ConnectionDetailsCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating connections.
    """
    class Meta:
        model = ConnectionDetails
        fields = [
            'sv_number',
            'sv_date',
            'hist_code_description',
            'consumer',
            'connection_type',
            'product',
            'num_of_regulators',
        ]

    def validate_sv_number(self, value):
        """Ensure service number is unique"""
        instance = self.instance
        if instance and instance.sv_number == value:
            return value

        if ConnectionDetails.objects.filter(sv_number=value).exists():
            raise serializers.ValidationError("Service number already exists")
        return value
