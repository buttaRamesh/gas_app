from django.contrib import admin
from .models import ConnectionDetails


@admin.register(ConnectionDetails)
class ConnectionDetailsAdmin(admin.ModelAdmin):
    list_display = ('sv_number', 'consumer', 'connection_type', 'product', 'sv_date', 'num_of_regulators')
    list_filter = ('connection_type', 'sv_date', 'product')
    search_fields = ('sv_number', 'consumer__consumer_name', 'consumer__consumer_number', 'hist_code_description')
    readonly_fields = ('sv_number',)
    date_hierarchy = 'sv_date'

    fieldsets = (
        ('Basic Information', {
            'fields': ('sv_number', 'sv_date', 'consumer')
        }),
        ('Connection Details', {
            'fields': ('connection_type', 'product', 'num_of_regulators')
        }),
        ('Additional Information', {
            'fields': ('hist_code_description',),
            'classes': ('collapse',)
        }),
    )
