from django.contrib import admin
from .models import Route, RouteArea


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('area_code', 'area_code_description')
    search_fields = ('area_code', 'area_code_description')
    ordering = ('area_code',)


@admin.register(RouteArea)
class RouteAreaAdmin(admin.ModelAdmin):
    list_display = ('area_name', 'route')
    list_filter = ('route',)
    search_fields = ('area_name', 'route__area_code')
    ordering = ('area_name',)