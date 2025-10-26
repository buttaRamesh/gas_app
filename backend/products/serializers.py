# File: products/serializers.py
from rest_framework import serializers
from .models import Unit, Product, ProductVariant, ProductVariantPriceHistory


# ==============================================================================
# UNIT SERIALIZERS
# ==============================================================================

class UnitSerializer(serializers.ModelSerializer):
    """
    Serializer for Unit of Measurement.
    Used for both list and detail views.
    """
    class Meta:
        model = Unit
        fields = ['id', 'short_name', 'description']


# ==============================================================================
# PRODUCT SERIALIZERS
# ==============================================================================

class ProductListSerializer(serializers.ModelSerializer):
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


class ProductDetailSerializer(serializers.ModelSerializer):
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
            'size': str(variant.size),
            'unit': variant.unit.short_name,
            'variant_type': variant.variant_type,
            'variant_type_display': variant.get_variant_type_display(),
            'price': str(variant.price),
        } for variant in variants]


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating Products.
    Only includes editable fields.
    """
    class Meta:
        model = Product
        fields = ['name', 'description']
    
    def validate_name(self, value):
        """Ensure product name is unique"""
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

class PriceHistorySerializer(serializers.ModelSerializer):
    """
    Serializer for Price History records.
    """
    variant_name = serializers.CharField(source='variant.name', read_only=True)
    variant_code = serializers.CharField(source='variant.product_code', read_only=True)
    changed_by_username = serializers.CharField(source='changed_by.username', read_only=True)
    
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

class ProductVariantListSerializer(serializers.ModelSerializer):
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
            'size',
            'unit',
            'unit_name',
            'variant_type',
            'variant_type_display',
            'price',
        ]


class ProductVariantDetailSerializer(serializers.ModelSerializer):
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
            'size',
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


class ProductVariantCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating ProductVariants.
    Only includes editable fields.
    """
    class Meta:
        model = ProductVariant
        fields = [
            'product_code',
            'name',
            'product',
            'unit',
            'size',
            'variant_type',
            'price',
        ]
    
    def validate_product_code(self, value):
        """Ensure product code is unique"""
        if self.instance:  # Update case
            if ProductVariant.objects.exclude(pk=self.instance.pk).filter(product_code=value).exists():
                raise serializers.ValidationError("Product code already exists.")
        else:  # Create case
            if ProductVariant.objects.filter(product_code=value).exists():
                raise serializers.ValidationError("Product code already exists.")
        return value
    
    def validate_price(self, value):
        """Ensure price is positive"""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value
    
    def validate(self, data):
        """
        Cross-field validation to ensure unique (product, name) combination
        """
        product = data.get('product')
        name = data.get('name')
        
        if product and name:
            queryset = ProductVariant.objects.filter(product=product, name=name)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            
            if queryset.exists():
                raise serializers.ValidationError({
                    'name': 'A variant with this name already exists for this product.'
                })
        
        return data


class ProductVariantPriceUpdateSerializer(serializers.Serializer):
    """
    Serializer specifically for updating variant price.
    Includes reason and notes for the change.
    """
    price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0.01)
    reason = serializers.CharField(max_length=200, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_price(self, value):
        """Ensure price is positive"""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value


# ==============================================================================
# COMBINED SERIALIZERS
# ==============================================================================

class ProductWithVariantsSerializer(serializers.ModelSerializer):
    """
    Serializer for Product with all its variants including prices.
    Used for comprehensive product catalog views.
    """
    variants = ProductVariantListSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'variants']


class VariantWithProductSerializer(serializers.ModelSerializer):
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
            'size',
            'unit',
            'unit_name',
            'variant_type',
            'variant_type_display',
            'price',
        ]