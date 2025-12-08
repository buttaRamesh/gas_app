from rest_framework import viewsets
from rest_framework.response import Response
from datetime import datetime

from inventory.api.services.bucket_movement_service import BucketMovementService
from inventory.api.serializers.bucket_movement_serializers import BucketMovementReportSerializer


class BucketMovementViewSet(viewsets.ViewSet):
    """
    GET /api/inventory/bucket-report/?date=YYYY-MM-DD
    or
    GET /api/inventory/bucket-report/?from=YYYY-MM-DD&to=YYYY-MM-DD
    """

    def list(self, request):
        date_str = request.GET.get("date")
        from_str = request.GET.get("from")
        to_str = request.GET.get("to")

        # Single-day report
        if date_str:
            day = datetime.strptime(date_str, "%Y-%m-%d").date()
            data = BucketMovementService.generate(day, day)
            return Response(BucketMovementReportSerializer(data).data)

        # Range report
        if not (from_str and to_str):
            return Response({"error": "Either date OR (from,to) is required"}, status=400)

        from_date = datetime.strptime(from_str, "%Y-%m-%d").date()
        to_date = datetime.strptime(to_str, "%Y-%m-%d").date()

        data = BucketMovementService.generate(from_date, to_date)
        return Response(BucketMovementReportSerializer(data).data)
