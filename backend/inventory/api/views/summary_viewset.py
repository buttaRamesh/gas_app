from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend

from inventory.models import Inventory
from inventory.api.serializers.summary_serializers import InventoryStockSummarySerializer
from inventory.api.filters.summary_filters import InventoryStockSummaryFilter


class InventoryStockSummaryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/inventory/stock/
    GET /api/inventory/stock/?product_id=1
    GET /api/inventory/stock/?bucket=GODOWN
    GET /api/inventory/stock/?state=FULL
    """
    queryset = Inventory.objects.all().select_related(
        "product", "bucket", "state"
    ).order_by("product__product_name")

    serializer_class = InventoryStockSummarySerializer

    filter_backends = [DjangoFilterBackend]
    filterset_class = InventoryStockSummaryFilter
