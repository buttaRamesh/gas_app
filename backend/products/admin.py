from django.contrib import admin
from .models import Unit, Product, ProductVariant, ProductVariantPriceHistory


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    """Admin interface for Unit of Measurement"""
    list_display = ['short_name', 'description']
    search_fields = ['short_name', 'description']
    ordering = ['short_name']


class ProductVariantInline(admin.TabularInline):
    """Inline admin for ProductVariant within Product"""
    model = ProductVariant
    extra = 1
    fields = ['product_code', 'name', 'unit', 'size', 'variant_type', 'price']
    autocomplete_fields = ['unit']
    readonly_fields = []


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin interface for Product with inline variants"""
    list_display = ['name', 'description', 'variant_count']
    search_fields = ['name', 'description']
    ordering = ['name']
    inlines = [ProductVariantInline]

    def variant_count(self, obj):
        """Display the number of variants"""
        return obj.variants.count()
    variant_count.short_description = 'Variants'


class PriceHistoryInline(admin.TabularInline):
    """Inline admin for Price History within ProductVariant"""
    model = ProductVariantPriceHistory
    extra = 0
    fields = ['old_price', 'new_price', 'price_change', 'price_change_percentage', 'effective_date', 'reason']
    readonly_fields = ['old_price', 'new_price', 'price_change', 'price_change_percentage', 'effective_date']
    can_delete = False
    ordering = ['-effective_date']
    
    def has_add_permission(self, request, obj=None):
        """Disable adding price history manually - it's auto-created"""
        return False


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    """Admin interface for ProductVariant with price tracking"""
    list_display = [
        'product_code', 'name', 'product', 'size',
        'unit', 'variant_type', 'price', 'formatted_price'
    ]
    list_filter = ['variant_type', 'product', 'unit']
    search_fields = ['product_code', 'name', 'product__name']
    ordering = ['product__name', 'size']
    autocomplete_fields = ['product', 'unit']
    inlines = [PriceHistoryInline]

    fieldsets = (
        ('Basic Information', {
            'fields': ('product_code', 'name', 'product')
        }),
        ('Specifications', {
            'fields': ('size', 'unit', 'variant_type')
        }),
        ('Pricing', {
            'fields': ('price',),
            'description': 'Price changes are automatically tracked in history'
        }),
    )
    
    def formatted_price(self, obj):
        """Display formatted price with currency"""
        return f"₹{obj.price}"
    formatted_price.short_description = 'Price (Formatted)'


@admin.register(ProductVariantPriceHistory)
class ProductVariantPriceHistoryAdmin(admin.ModelAdmin):
    """Admin interface for Price History (Read-only)"""
    list_display = [
        'variant', 'old_price', 'new_price', 
        'price_change', 'price_change_percentage', 
        'effective_date', 'reason'
    ]
    list_filter = ['effective_date', 'variant__product', 'variant__variant_type']
    search_fields = ['variant__name', 'variant__product_code', 'reason', 'notes']
    ordering = ['-effective_date']
    readonly_fields = [
        'variant', 'old_price', 'new_price', 'price_change', 
        'price_change_percentage', 'effective_date', 'changed_by'
    ]
    
    fieldsets = (
        ('Price Change', {
            'fields': ('variant', 'old_price', 'new_price', 'price_change', 'price_change_percentage')
        }),
        ('Details', {
            'fields': ('effective_date', 'changed_by', 'reason', 'notes')
        }),
    )
    
    def has_add_permission(self, request):
        """Disable adding price history manually - it's auto-created"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Disable deleting price history - keep audit trail"""
        return False