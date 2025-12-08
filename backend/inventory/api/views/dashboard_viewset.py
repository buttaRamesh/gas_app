from rest_framework import viewsets
from rest_framework.response import Response

from inventory.api.services.dashboard_service import InventoryDashboardService
from inventory.api.serializers.dashboard_serializers import InventoryDashboardSerializer


class InventoryDashboardViewSet(viewsets.ViewSet):
    """
    GET /api/inventory/dashboard/?date=YYYY-MM-DD
    """

    def list(self, request):
        date_str = request.GET.get("date")
        data = InventoryDashboardService.generate_dashboard(date_str=date_str)
        serializer = InventoryDashboardSerializer(data)
        return Response(serializer.data)
