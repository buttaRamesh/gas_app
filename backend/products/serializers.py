# File: products/serializers.py
from decimal import Decimal
from rest_framework import serializers
from core.serializers import (
    BaseModelSerializer,
    RequiredFieldsMixin,
    UniqueTogetherValidationMixin,
    PositiveNumberValidationMixin
)
from core.validators import validate_price
from .models import Unit, Product, ProductVariant, ProductVariantPriceHistory


# ==============================================================================
# UNIT SERIALIZERS
# ==============================================================================

class UnitSerializer(RequiredFieldsMixin, BaseModelSerializer):
    """
    Serializer for Unit of Measurement.
    Used for both list and detail views.
    """
    required_fields = ['short_name']

    class Meta:
        model = Unit
        fields = ['id', 'short_name', 'description']

    def validate_short_name(self, value):
        """Ensure unit name is valid and not too long"""
        if not value or not value.strip():
            raise serializers.ValidationError("Unit name cannot be empty.")
        if len(value) > 50:
            raise serializers.ValidationError("Unit name cannot exceed 50 characters.")
        return value.strip()


# ==============================================================================
# PRODUCT SERIALIZERS
# ==============================================================================

class ProductListSerializer(BaseModelSerializer):
    """
    Lightweight serializer for Product list views.
    Shows basic info with variant count.
    """
    variants_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'variants_count']

    def get_variants_count(self, obj):
        """Get the number of variants for this product"""
        return obj.variants.count()


class ProductDetailSerializer(BaseModelSerializer):
    """
    Detailed serializer for single Product view.
    Includes all variants with prices.
    """
    variants = serializers.SerializerMethodField()
    variant_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'variant_count', 'variants']

    def get_variant_count(self, obj):
        """Get the number of variants for this product"""
        return obj.variants.count()

    def get_variants(self, obj):
        """Get all variants for this product"""
        variants = obj.variants.all()
        return [{
            'id': variant.id,
            'product_code': variant.product_code,
            'name': variant.name,
            'quantity': str(variant.quantity),
            'unit': variant.unit.short_name,
            'variant_type': variant.variant_type,
            'variant_type_display': variant.get_variant_type_display(),
            'price': str(variant.price),
        } for variant in variants]


class ProductCreateUpdateSerializer(RequiredFieldsMixin, BaseModelSerializer):
    """
    Serializer for creating and updating Products.
    Only includes editable fields.
    """
    required_fields = ['name']

    class Meta:
        model = Product
        fields = ['name', 'description']

    def validate_name(self, value):
        """Ensure product name is unique and valid"""
        if not value or not value.strip():
            raise serializers.ValidationError("Product name cannot be empty.")

        value = value.strip()

        # Check uniqueness
        if self.instance:  # Update case
            if Product.objects.exclude(pk=self.instance.pk).filter(name=value).exists():
                raise serializers.ValidationError("Product with this name already exists.")
        else:  # Create case
            if Product.objects.filter(name=value).exists():
                raise serializers.ValidationError("Product with this name already exists.")
        return value


# ==============================================================================
# PRICE HISTORY SERIALIZERS
# ==============================================================================

class PriceHistorySerializer(BaseModelSerializer):
    """
    Serializer for Price History records.
    """
    variant_name = serializers.CharField(source='variant.name', read_only=True)
    variant_code = serializers.CharField(source='variant.product_code', read_only=True)
    changed_by_username = serializers.CharField(source='changed_by.employee_id', read_only=True)

    class Meta:
        model = ProductVariantPriceHistory
        fields = [
            'id',
            'variant',
            'variant_name',
            'variant_code',
            'old_price',
            'new_price',
            'price_change',
            'price_change_percentage',
            'effective_date',
            'changed_by',
            'changed_by_username',
            'reason',
            'notes',
        ]
        read_only_fields = ['effective_date', 'price_change', 'price_change_percentage']


# ==============================================================================
# PRODUCT VARIANT SERIALIZERS
# ==============================================================================

class ProductVariantListSerializer(BaseModelSerializer):
    """
    Lightweight serializer for ProductVariant list views.
    Shows essential info with related names and price.
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    unit_name = serializers.CharField(source='unit.short_name', read_only=True)
    variant_type_display = serializers.CharField(source='get_variant_type_display', read_only=True)

    class Meta:
        model = ProductVariant
        fields = [
            'id',
            'product_code',
            'name',
            'product',
            'product_name',
            'quantity',
            'unit',
            'unit_name',
            'variant_type',
            'variant_type_display',
            'price',
        ]


class ProductVariantDetailSerializer(BaseModelSerializer):
    """
    Detailed serializer for single ProductVariant view.
    Includes full related object details and recent price history.
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_description = serializers.CharField(source='product.description', read_only=True)
    unit_name = serializers.CharField(source='unit.short_name', read_only=True)
    unit_description = serializers.CharField(source='unit.description', read_only=True)
    variant_type_display = serializers.CharField(source='get_variant_type_display', read_only=True)
    price_history = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = [
            'id',
            'product_code',
            'name',
            'product',
            'product_name',
            'product_description',
            'quantity',
            'unit',
            'unit_name',
            'unit_description',
            'variant_type',
            'variant_type_display',
            'price',
            'price_history',
        ]

    def get_price_history(self, obj):
        """Get recent price history (last 5 changes)"""
        history = obj.price_history.all()[:5]
        return [{
            'id': h.id,
            'old_price': str(h.old_price) if h.old_price else None,
            'new_price': str(h.new_price),
            'price_change': str(h.price_change),
            'price_change_percentage': str(h.price_change_percentage) if h.price_change_percentage else None,
            'effective_date': h.effective_date,
            'reason': h.reason,
        } for h in history]


class ProductVariantCreateUpdateSerializer(
    RequiredFieldsMixin,
    UniqueTogetherValidationMixin,
    PositiveNumberValidationMixin,
    BaseModelSerializer
):
    """
    Serializer for creating and updating ProductVariants.
    Only includes editable fields with comprehensive validation.
    """
    required_fields = ['product_code', 'name', 'product', 'unit', 'quantity', 'variant_type', 'price']
    positive_number_fields = ['price', 'quantity']
    unique_together_fields = [('product', 'name')]

    class Meta:
        model = ProductVariant
        fields = [
            'product_code',
            'name',
            'product',
            'unit',
            'quantity',
            'variant_type',
            'price',
        ]

    def validate_product_code(self, value):
        """Ensure product code is unique and properly formatted"""
        if not value or not value.strip():
            raise serializers.ValidationError("Product code cannot be empty.")

        value = value.strip().upper()

        # Check uniqueness
        if self.instance:  # Update case
            if ProductVariant.objects.exclude(pk=self.instance.pk).filter(product_code=value).exists():
                raise serializers.ValidationError("Product code already exists.")
        else:  # Create case
            if ProductVariant.objects.filter(product_code=value).exists():
                raise serializers.ValidationError("Product code already exists.")
        return value

    def validate_name(self, value):
        """Ensure variant name is valid"""
        if not value or not value.strip():
            raise serializers.ValidationError("Variant name cannot be empty.")
        return value.strip()

    def validate_price(self, value):
        """Validate price using core validator"""
        validate_price(value)
        return value

    def validate_quantity(self, value):
        """Ensure quantity is positive"""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value


class ProductVariantPriceUpdateSerializer(PositiveNumberValidationMixin, serializers.Serializer):
    """
    Serializer specifically for updating variant price.
    Includes reason and notes for the change with comprehensive validation.
    """
    positive_number_fields = ['price']

    price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.01'))
    reason = serializers.CharField(max_length=200, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_price(self, value):
        """Validate price using core validator"""
        validate_price(value)
        return value


# ==============================================================================
# COMBINED SERIALIZERS
# ==============================================================================

class ProductWithVariantsSerializer(BaseModelSerializer):
    """
    Serializer for Product with all its variants including prices.
    Used for comprehensive product catalog views.
    """
    variants = ProductVariantListSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'variants']


class VariantWithProductSerializer(BaseModelSerializer):
    """
    Serializer for ProductVariant with full product details.
    Useful for catalog displays with pricing.
    """
    product_details = ProductListSerializer(source='product', read_only=True)
    unit_name = serializers.CharField(source='unit.short_name', read_only=True)
    variant_type_display = serializers.CharField(source='get_variant_type_display', read_only=True)

    class Meta:
        model = ProductVariant
        fields = [
            'id',
            'product_code',
            'name',
            'product_details',
            'quantity',
            'unit',
            'unit_name',
            'variant_type',
            'variant_type_display',
            'price',
        ]