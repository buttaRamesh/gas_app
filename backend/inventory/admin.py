from django.contrib import admin

from inventory.models import (
    ProductCategory,
    Unit,
    CylinderCategory,
    Product,
    CylinderDetails,
    ProductPrice,
    InventoryBucket,
    InventoryState,
    Inventory,
    InventoryTransaction,
    InvoiceHeader,
    InvoiceItem,
)

# ============================================================
# PRODUCT LOOKUP MODELS
# ============================================================

@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ("short_name", "description", "is_active")
    list_filter = ("is_active",)
    search_fields = ("short_name",)


@admin.register(CylinderCategory)
class CylinderCategoryAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "is_active")
    list_filter = ("is_active",)
    search_fields = ("code", "name")


# ============================================================
# PRODUCT + CYLINDER DETAILS + PRICE ADMIN
# ============================================================

class CylinderDetailsInline(admin.StackedInline):
    model = CylinderDetails
    extra = 0
    max_num = 1
    can_delete = False


class ProductPriceInline(admin.TabularInline):
    model = ProductPrice
    extra = 0
    ordering = ("-effective_date",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "product_code",
        "category",
        "unit",
        "is_cylinder",
        "is_active",
    )
    list_filter = ("is_cylinder", "category", "unit", "is_active")
    search_fields = ("name", "product_code")
    inlines = [CylinderDetailsInline, ProductPriceInline]
    ordering = ("name",)


@admin.register(ProductPrice)
class ProductPriceAdmin(admin.ModelAdmin):
    list_display = ("product", "price", "effective_date", "is_active")
    list_filter = ("is_active", "effective_date")
    search_fields = ("product__name",)
    ordering = ("-effective_date",)


# ============================================================
# INVENTORY LOOKUP MODELS
# ============================================================

@admin.register(InventoryBucket)
class InventoryBucketAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "is_active")
    list_filter = ("is_active",)
    search_fields = ("code", "name")


@admin.register(InventoryState)
class InventoryStateAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "is_active")
    list_filter = ("is_active",)
    search_fields = ("code", "name")


# ============================================================
# INVENTORY SUMMARY + TRANSACTION LEDGER
# ============================================================

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "bucket",
        "state",
        "quantity",
        "updated_at",
    )
    list_filter = ("bucket", "state")
    search_fields = ("product__name", "product__product_code")
    ordering = ("product__name",)


@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "txn_type",
        "product",
        "from_bucket",
        "to_bucket",
        "quantity",
        "created_at",
        "reference_id",
    )
    list_filter = ("txn_type", "from_bucket", "to_bucket")
    search_fields = ("product__name", "product__product_code", "reference_id")
    readonly_fields = ("created_at",)


class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 0


@admin.register(InvoiceHeader)
class InvoiceHeaderAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "challan_number", "received_at", "status")
    list_filter = ("status", "received_at")
    search_fields = ("invoice_number", "challan_number")
    inlines = [InvoiceItemInline]
    readonly_fields = ("received_at",)

