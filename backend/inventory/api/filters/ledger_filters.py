import django_filters
from inventory.models import InventoryTransaction


class InventoryTransactionFilter(django_filters.FilterSet):

    # Date range filters
    from_date = django_filters.DateTimeFilter(
        field_name="created_at", lookup_expr="gte"
    )
    to_date = django_filters.DateTimeFilter(
        field_name="created_at", lookup_expr="lte"
    )

    # Product
    product_id = django_filters.NumberFilter(
        field_name="product__id", lookup_expr="exact"
    )

    # Bucket filters
    from_bucket = django_filters.CharFilter(
        field_name="from_bucket__code", lookup_expr="iexact"
    )
    to_bucket = django_filters.CharFilter(
        field_name="to_bucket__code", lookup_expr="iexact"
    )

    # State filters
    from_state = django_filters.CharFilter(
        field_name="from_state__code", lookup_expr="iexact"
    )
    to_state = django_filters.CharFilter(
        field_name="to_state__code", lookup_expr="iexact"
    )

    # Transaction type
    txn_type = django_filters.CharFilter(
        field_name="txn_type", lookup_expr="iexact"
    )

    # Reference ID partial search
    reference_id = django_filters.CharFilter(
        field_name="reference_id", lookup_expr="icontains"
    )

    # Notes search
    notes = django_filters.CharFilter(
        field_name="notes", lookup_expr="icontains"
    )

    class Meta:
        model = InventoryTransaction
        fields = [
            "product_id",
            "txn_type",
            "from_bucket",
            "to_bucket",
            "from_state",
            "to_state",
            "reference_id",
            "notes",
        ]
