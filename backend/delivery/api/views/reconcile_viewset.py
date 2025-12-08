from rest_framework import viewsets, status
from rest_framework.response import Response

from delivery.models import DeliveryRun
from delivery.services import DeliveryService
from delivery.api.serializers.reconcile_serializers import (
    ReconcileResponseSerializer,
    ReconcileRunCreateSerializer
)


class DeliveryReconcileViewSet(viewsets.ViewSet):
    """
    GET  /api/delivery/run/<run_id>/reconcile/     -> view reconciliation
    POST /api/delivery/run/<run_id>/reconcile/     -> perform reconciliation
    """

    def get_run(self, run_id):
        try:
            return DeliveryRun.objects.get(id=run_id)
        except DeliveryRun.DoesNotExist:
            return None

    # ------------------------
    # GET — JUST SHOW VARIANCES
    # ------------------------
    def list(self, request, run_id=None):
        run = self.get_run(run_id)
        if not run:
            return Response({"error": "Invalid run_id"}, status=404)

        if not hasattr(run, "summary"):
            return Response({"error": "Summary not posted for this run"}, status=400)

        # compute differences (no auto adjust)
        result = DeliveryService.reconcile_run(run, auto_adjust=False)

        # prepare formatted response
        items = []
        for pid, row in result["result"].items():
            diff = row["diff"]
            items.append({
                "product_id": pid,
                "product_name": row["product"].product_name,
                "summary_full_delivered": row["summary"]["summary_full_delivered"],
                "record_full_delivered": row["records"]["record_full_delivered"],
                "delivered_diff": diff["delivered_diff"],
                "summary_empty_collected": row["summary"]["summary_empty_collected"],
                "record_empty_collected": row["records"]["record_empty_collected"],
                "empty_diff": diff["empty_diff"],
            })

        response = {
            "run_id": run.id,
            "is_reconciled": (run.status == "RECONCILED"),
            "items": items
        }

        return Response(response, status=200)

    # ------------------------
    # POST — PERFORM RECONCILIATION
    # ------------------------
    def create(self, request, run_id=None):
        run = self.get_run(run_id)
        if not run:
            return Response({"error": "Invalid run_id"}, status=404)

        serializer = ReconcileRunCreateSerializer(
            data=request.data,
            run=run,
        )
        serializer.is_valid(raise_exception=True)
        result = serializer.save()

        # format result same as GET response
        items = []
        for pid, row in result["result"].items():
            diff = row["diff"]
            items.append({
                "product_id": pid,
                "product_name": row["product"].product_name,
                "summary_full_delivered": row["summary"]["summary_full_delivered"],
                "record_full_delivered": row["records"]["record_full_delivered"],
                "delivered_diff": diff["delivered_diff"],
                "summary_empty_collected": row["summary"]["summary_empty_collected"],
                "record_empty_collected": row["records"]["record_empty_collected"],
                "empty_diff": diff["empty_diff"],
            })

        return Response({
            "run_id": run.id,
            "status": "reconciled",
            "auto_adjusted": request.data.get("auto_adjust", False),
            "items": items
        }, status=status.HTTP_200_OK)
