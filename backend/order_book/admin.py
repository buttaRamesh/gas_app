from django.contrib import admin
from .models import RefillType, DeliveryFlag, PaymentOption, OrderBook, ColumnMapping, PaymentInfo, BulkUploadHistory


@admin.register(RefillType)
class RefillTypeAdmin(admin.ModelAdmin):
    list_display = ["name", "created_at"]
    search_fields = ["name"]


@admin.register(DeliveryFlag)
class DeliveryFlagAdmin(admin.ModelAdmin):
    list_display = ["name", "created_at"]
    search_fields = ["name"]


@admin.register(PaymentOption)
class PaymentOptionAdmin(admin.ModelAdmin):
    list_display = ["name", "created_at"]
    search_fields = ["name"]


@admin.register(OrderBook)
class OrderBookAdmin(admin.ModelAdmin):
    list_display = [
        "order_no",
        "book_date",
        "get_consumer_name",
        "get_mobile_number",
        "product",
        "delivery_flag",
        "delivery_date",
        "delivery_person",
        "updated_type",
        "updated_by",
    ]
    list_filter = ["delivery_flag", "refill_type", "delivery_person", "updated_type", "book_date"]
    search_fields = ["order_no", "product", "consumer__consumer_number", "consumer__person__person_name"]
    readonly_fields = ["created_at", "updated_at"]
    date_hierarchy = "book_date"
    raw_id_fields = ["consumer", "delivery_person"]

    def get_consumer_name(self, obj):
        return obj.consumer.full_name if obj.consumer else "N/A"
    get_consumer_name.short_description = "Consumer Name"
    get_consumer_name.admin_order_field = "consumer__full_name"

    def get_mobile_number(self, obj):
        return obj.consumer.mobile if obj.consumer else "N/A"
    get_mobile_number.short_description = "Mobile"
    get_mobile_number.admin_order_field = "consumer__mobile"


@admin.register(ColumnMapping)
class ColumnMappingAdmin(admin.ModelAdmin):
    list_display = ["name", "upload_type", "is_active", "created_by", "created_at", "updated_at"]
    list_filter = ["upload_type", "is_active", "created_at"]
    search_fields = ["name", "description"]
    readonly_fields = ["created_at", "updated_at"]
    fieldsets = (
        (None, {
            "fields": ("name", "upload_type", "description", "is_active")
        }),
        ("Mappings", {
            "fields": ("mappings",)
        }),
        ("Metadata", {
            "fields": ("created_by", "created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )


@admin.register(PaymentInfo)
class PaymentInfoAdmin(admin.ModelAdmin):
    list_display = ["order", "payment_option", "cash_memo_no", "payment_status", "payment_date", "created_at"]
    list_filter = ["payment_status", "payment_option", "created_at"]
    search_fields = ["order__order_no", "cash_memo_no", "transaction_id"]
    readonly_fields = ["created_at", "updated_at"]
    raw_id_fields = ["order"]


@admin.register(BulkUploadHistory)
class BulkUploadHistoryAdmin(admin.ModelAdmin):
    list_display = [
        "file_name",
        "file_type",
        "upload_type",
        "row_count",
        "success_count",
        "error_count",
        "status",
        "uploaded_by",
        "uploaded_at",
    ]
    list_filter = ["upload_type", "status", "file_type", "uploaded_at"]
    search_fields = ["file_name", "uploaded_by__username"]
    readonly_fields = ["uploaded_at"]
    ordering = ["-uploaded_at"]
    date_hierarchy = "uploaded_at"

    def has_add_permission(self, request):
        """Disable manual creation of history records"""
        return False

    def has_change_permission(self, request, obj=None):
        """Make history records read-only"""
        return False
