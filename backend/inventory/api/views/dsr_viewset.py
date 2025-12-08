from rest_framework import viewsets
from rest_framework.response import Response
from datetime import datetime

from inventory.api.serializers.dsr_serializers import DSRResponseSerializer
from inventory.api.services.dsr_service import DSRService


class DSRViewSet(viewsets.ViewSet):
    """
    GET /api/inventory/dsr/?date=YYYY-MM-DD
    """

    def list(self, request):
        date_str = request.GET.get("date")
        if date_str:
            day = datetime.strptime(date_str, "%Y-%m-%d").date()
        else:
            day = datetime.today().date()

        data = DSRService.generate_dsr(day)

        serializer = DSRResponseSerializer({
            "date": day,
            "products": data
        })

        return Response(serializer.data)
