"""
Route filtering for the Route API.

Provides comprehensive filtering capabilities for Route model including:
- Text search across route code and description
- Area and consumer count filters
"""
from django_filters import rest_framework as filters
from django.db.models import Q

from routes.models import Route


class RouteFilter(filters.FilterSet):
    """
    Filter for Route model supporting:
    - Text search across area_code and area_code_description
    - Count filters
    """

    # Search filters (partial match)
    search = filters.CharFilter(method='search_filter', label='Search')
    area_code = filters.CharFilter(lookup_expr='icontains')
    area_code_description = filters.CharFilter(lookup_expr='icontains')

    # Count filters
    min_area_count = filters.NumberFilter(method='filter_min_area_count')
    max_area_count = filters.NumberFilter(method='filter_max_area_count')
    min_consumer_count = filters.NumberFilter(method='filter_min_consumer_count')
    max_consumer_count = filters.NumberFilter(method='filter_max_consumer_count')

    # Has delivery person filter
    has_delivery_assignment = filters.BooleanFilter(method='filter_has_delivery_assignment')
    delivery_person = filters.NumberFilter(field_name='delivery_assignment__delivery_person__id')

    def filter_min_area_count(self, queryset, name, value):
        """Filter routes with at least N areas"""
        if value is None:
            return queryset
        from django.db.models import Count
        return queryset.annotate(
            area_count=Count('areas')
        ).filter(area_count__gte=value)

    def filter_max_area_count(self, queryset, name, value):
        """Filter routes with at most N areas"""
        if value is None:
            return queryset
        from django.db.models import Count
        return queryset.annotate(
            area_count=Count('areas')
        ).filter(area_count__lte=value)

    def filter_min_consumer_count(self, queryset, name, value):
        """Filter routes with at least N consumers"""
        if value is None:
            return queryset
        from django.db.models import Count
        return queryset.annotate(
            consumer_count=Count('areas__consumers')
        ).filter(consumer_count__gte=value)

    def filter_max_consumer_count(self, queryset, name, value):
        """Filter routes with at most N consumers"""
        if value is None:
            return queryset
        from django.db.models import Count
        return queryset.annotate(
            consumer_count=Count('areas__consumers')
        ).filter(consumer_count__lte=value)

    def filter_has_delivery_assignment(self, queryset, name, value):
        """Filter routes that have or don't have a delivery assignment"""
        if value is None:
            return queryset
        if value:
            return queryset.filter(delivery_assignment__isnull=False)
        else:
            return queryset.filter(delivery_assignment__isnull=True)

    def search_filter(self, queryset, name, value):
        """
        Generic search across multiple fields:
        - area_code, area_code_description
        """
        if not value:
            return queryset

        query = Q(area_code__icontains=value) | Q(area_code_description__icontains=value)

        return queryset.filter(query).distinct()

    class Meta:
        model = Route
        fields = [
            'search',
            'area_code',
            'area_code_description',
            'min_area_count',
            'max_area_count',
            'min_consumer_count',
            'max_consumer_count',
            'has_delivery_assignment',
        ]
