import django_filters
from inventory.models import Inventory


class InventoryStockSummaryFilter(django_filters.FilterSet):

    product_id = django_filters.NumberFilter(
        field_name="product__id", lookup_expr="exact"
    )
    bucket = django_filters.CharFilter(
        field_name="bucket__code", lookup_expr="iexact"
    )
    state = django_filters.CharFilter(
        field_name="state__code", lookup_expr="iexact"
    )

    class Meta:
        model = Inventory
        fields = ["product_id", "bucket", "state"]
