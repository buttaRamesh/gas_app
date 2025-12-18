"""
RouteArea filtering for the RouteArea API.

Provides comprehensive filtering capabilities for RouteArea model including:
- Text search across area name and route code
- Route filters
- Assignment status filters
"""
from django_filters import rest_framework as filters
from django.db.models import Q

from routes.models import RouteArea


class RouteAreaFilter(filters.FilterSet):
    """
    Filter for RouteArea model supporting:
    - Text search across area_name and route code
    - Route assignment filters
    """

    # Search filters (partial match)
    search = filters.CharFilter(method='search_filter', label='Search')
    area_name = filters.CharFilter(lookup_expr='icontains')

    # Route filters
    route = filters.NumberFilter(field_name='route__id')
    route_code = filters.CharFilter(field_name='route__area_code', lookup_expr='icontains')
    route_description = filters.CharFilter(field_name='route__area_code_description', lookup_expr='icontains')

    # Assignment status filter
    assigned = filters.BooleanFilter(method='filter_assigned')

    def filter_assigned(self, queryset, name, value):
        """
        Filter areas by assignment status.
        - assigned=true: Only areas assigned to a route
        - assigned=false: Only unassigned areas
        """
        if value is None:
            return queryset
        if value:
            return queryset.filter(route__isnull=False)
        else:
            return queryset.filter(route__isnull=True)

    def search_filter(self, queryset, name, value):
        """
        Generic search across multiple fields:
        - area_name
        - route: area_code, area_code_description
        """
        if not value:
            return queryset

        query = Q(area_name__icontains=value)

        # Search in route fields
        query |= Q(route__area_code__icontains=value)
        query |= Q(route__area_code_description__icontains=value)

        return queryset.filter(query).distinct()

    class Meta:
        model = RouteArea
        fields = [
            'search',
            'area_name',
            'route',
            'route_code',
            'route_description',
            'assigned',
        ]
