import django_filters
from inventory.models import Product

class ProductFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr="icontains")
    product_code = django_filters.CharFilter(lookup_expr="icontains")
    category = django_filters.CharFilter(field_name="category__name", lookup_expr="icontains")
    unit = django_filters.CharFilter(field_name="unit__short_name", lookup_expr="icontains")
    
    # ID based filters (if needed by other components)
    category_id = django_filters.NumberFilter(field_name="category__id")
    unit_id = django_filters.NumberFilter(field_name="unit__id")
    
    is_cylinder = django_filters.BooleanFilter()
    is_active = django_filters.BooleanFilter()

    class Meta:
        model = Product
        fields = ["category", "unit", "is_cylinder", "is_active", "name", "product_code", "category_id", "unit_id"]
