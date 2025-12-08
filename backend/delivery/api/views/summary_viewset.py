from rest_framework import viewsets, status
from rest_framework.response import Response

from delivery.models import DeliveryRun
from delivery.api.serializers.summary_serializers import (
    DeliverySummaryCreateSerializer,
    DeliverySummaryReadSerializer,
)


class DeliverySummaryViewSet(viewsets.ViewSet):
    """
    API:
      GET  /api/delivery/run/<run_id>/summary/    -> read summary (ModelSerializer)
      POST /api/delivery/run/<run_id>/summary/    -> create summary (CustomSerializer)
    """

    # -----------------------------
    # Helper: get run object
    # -----------------------------
    def get_run(self, run_id):
        try:
            return DeliveryRun.objects.get(id=run_id)
        except DeliveryRun.DoesNotExist:
            return None

    # -----------------------------
    # READ SUMMARY (ModelSerializer)
    # -----------------------------
    def list(self, request, run_id=None):
        run = self.get_run(run_id)
        if not run:
            return Response({"error": "Invalid run_id"}, status=404)

        summary = getattr(run, "summary", None)

        if not summary:
            # No summary exists yet → return empty list (expected)
            return Response([], status=200)

        serializer = DeliverySummaryReadSerializer(summary)
        return Response(serializer.data, status=200)

    # -----------------------------
    # CREATE SUMMARY (CustomSerializer)
    # -----------------------------
    def create(self, request, run_id=None):
        run = self.get_run(run_id)
        if not run:
            return Response({"error": "Invalid run_id"}, status=404)

        serializer = DeliverySummaryCreateSerializer(
            data=request.data,
            run=run,
            user=request.user
        )
        serializer.is_valid(raise_exception=True)
        summary = serializer.save()   # Inventory logic executed here

        return Response(
            {
                "summary_id": summary.id,
                "run_id": summary.run.id,
                "status": "posted"
            },
            status=status.HTTP_201_CREATED,
        )
