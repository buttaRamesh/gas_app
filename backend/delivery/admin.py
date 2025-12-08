from django.contrib import admin
from delivery.models import (
    DeliveryPerson,
    DeliveryRouteAssignment,
    DeliveryRouteAssignmentHistory,
    DeliveryRun,
    DeliveryRunRoute,
    DeliveryLoad,
    DeliveryLoadItem,
    DeliverySummary,
    DeliverySummaryItem,
    DeliveryRecord,
)

# --------------------------------------------------------------------
# DELIVERY PERSON + ROUTE ASSIGNMENT
# --------------------------------------------------------------------

@admin.register(DeliveryPerson)
class DeliveryPersonAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("person__full_name", "person__first_name", "person__last_name")


@admin.register(DeliveryRouteAssignment)
class DeliveryRouteAssignmentAdmin(admin.ModelAdmin):
    list_display = ("delivery_person", "route")
    search_fields = ("delivery_person__person__full_name", "route__area_code")


@admin.register(DeliveryRouteAssignmentHistory)
class DeliveryRouteAssignmentHistoryAdmin(admin.ModelAdmin):
    list_display = ("delivery_person_name", "route_code", "action_type", "timestamp")
    list_filter = ("action_type", "timestamp")
    search_fields = ("delivery_person_name", "route_code")


# --------------------------------------------------------------------
# INLINE DEFINITIONS
# --------------------------------------------------------------------

class DeliveryRunRouteInline(admin.TabularInline):
    model = DeliveryRunRoute
    extra = 0
    autocomplete_fields = ("route",)


class DeliveryLoadItemInline(admin.TabularInline):
    model = DeliveryLoadItem
    extra = 0
    autocomplete_fields = ("product",)


class DeliveryLoadInline(admin.StackedInline):
    model = DeliveryLoad
    extra = 0
    inlines = [DeliveryLoadItemInline]
    show_change_link = True


class DeliverySummaryItemInline(admin.TabularInline):
    model = DeliverySummaryItem
    extra = 0
    autocomplete_fields = ("product",)


# --------------------------------------------------------------------
# DELIVERY RUN ADMIN
# --------------------------------------------------------------------

@admin.register(DeliveryRun)
class DeliveryRunAdmin(admin.ModelAdmin):
    list_display = ("id", "delivery_person", "run_date", "status", "started_at")
    list_filter = ("status", "run_date", "delivery_person")
    search_fields = ("delivery_person__name",)
    date_hierarchy = "run_date"

    inlines = [DeliveryRunRouteInline, DeliveryLoadInline]

    ordering = ("-run_date", "-started_at")


# --------------------------------------------------------------------
# DELIVERY LOAD ADMIN
# (internal - usually reached from DeliveryRun)
# --------------------------------------------------------------------

@admin.register(DeliveryLoad)
class DeliveryLoadAdmin(admin.ModelAdmin):
    list_display = ("id", "run", "load_number", "loaded_at")
    list_filter = ("loaded_at",)
    search_fields = ("run__id", "load_number")
    inlines = [DeliveryLoadItemInline]


# --------------------------------------------------------------------
# DELIVERY SUMMARY ADMIN
# --------------------------------------------------------------------

@admin.register(DeliverySummary)
class DeliverySummaryAdmin(admin.ModelAdmin):
    list_display = ("run", "recorded_at", "entered_by")
    list_filter = ("recorded_at", "entered_by")
    search_fields = ("run__id", "entered_by__username")
    inlines = [DeliverySummaryItemInline]


# --------------------------------------------------------------------
# DELIVERY RECORD ADMIN (detailed per-customer)
# --------------------------------------------------------------------

@admin.register(DeliveryRecord)
class DeliveryRecordAdmin(admin.ModelAdmin):
    list_display = (
        "run",
        "consumer_name",
        "product",
        "qty_full_delivered",
        "qty_empty_collected",
        "qty_empty_not_collected",
        "created_at",
        "entered_by",
    )
    list_filter = ("product", "created_at")
    search_fields = ("consumer_name", "consumer_code", "booking_reference")
    autocomplete_fields = ("product",)
