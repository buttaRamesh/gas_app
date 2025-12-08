from rest_framework import viewsets
from rest_framework.response import Response
from datetime import datetime

from inventory.api.services.movement_service import ProductMovementService
from inventory.api.serializers.movement_serializers import ProductMovementResponseSerializer


class ProductMovementViewSet(viewsets.ViewSet):
    """
    GET /api/inventory/movement/?product_id=1&from=YYYY-MM-DD&to=YYYY-MM-DD
    """

    def list(self, request):
        product_id = request.GET.get("product_id")
        from_date = request.GET.get("from")
        to_date = request.GET.get("to")

        if not product_id:
            return Response({"error": "product_id is required"}, status=400)

        if not from_date or not to_date:
            return Response({"error": "from and to dates are required"}, status=400)

        start = datetime.strptime(from_date, "%Y-%m-%d").date()
        end = datetime.strptime(to_date, "%Y-%m-%d").date()

        data = ProductMovementService.generate_movement(product_id, start, end)

        serializer = ProductMovementResponseSerializer(data)
        return Response(serializer.data, status=200)
