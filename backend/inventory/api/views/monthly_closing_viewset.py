from rest_framework import viewsets
from rest_framework.response import Response

from inventory.api.services.monthly_closing_service import MonthlyClosingService
from inventory.api.serializers.monthly_closing_serializers import MonthlyClosingReportSerializer


class MonthlyClosingViewSet(viewsets.ViewSet):
    """
    GET /api/inventory/monthly-closing/?month=2025-02
    """

    def list(self, request):
        month = request.GET.get("month")
        if not month:
            return Response({"error": "month is required. Format YYYY-MM"}, status=400)

        data = MonthlyClosingService.generate(month)
        serializer = MonthlyClosingReportSerializer(data)
        return Response(serializer.data)
