import django_filters
from inventory.models import Unit

class UnitFilter(django_filters.FilterSet):
    short_name = django_filters.CharFilter(lookup_expr="icontains")
    description = django_filters.CharFilter(lookup_expr="icontains")
    is_active = django_filters.BooleanFilter()

    class Meta:
        model = Unit
        fields = ["short_name", "description", "is_active"]
