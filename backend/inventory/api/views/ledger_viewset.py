from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

from inventory.models import InventoryTransaction
from inventory.api.serializers.ledger_serializers import InventoryTransactionSerializer
from inventory.api.filters.ledger_filters import InventoryTransactionFilter


class InventoryTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Full ledger with filters:
      - date range
      - product
      - bucket
      - state
      - txn_type
      - reference_id
      - notes
    """

    queryset = InventoryTransaction.objects.all().select_related(
        "product", "from_bucket", "to_bucket", "from_state", "to_state"
    ).order_by("-created_at")

    serializer_class = InventoryTransactionSerializer

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]

    filterset_class = InventoryTransactionFilter

    search_fields = [
        "product__product_name",
        "reference_id",
        "notes"
    ]

    ordering_fields = [
        "created_at",
        "quantity",
        "txn_type",
    ]
