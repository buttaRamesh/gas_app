import django_filters
from inventory.models import ProductCategory

class ProductCategoryFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr="icontains")
    description = django_filters.CharFilter(lookup_expr="icontains")
    is_active = django_filters.BooleanFilter()

    class Meta:
        model = ProductCategory
        fields = ["name", "description", "is_active"]
