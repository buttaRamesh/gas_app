from rest_framework import mixins, viewsets
from rest_framework.response import Response
from rest_framework import status

from delivery.models import DeliveryRun, DeliveryLoad
from delivery.api.serializers.load_serializers import DeliveryLoadCreateSerializer


class DeliveryLoadViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet
):
    """
    Handles:
      GET  /api/delivery/run/<run_id>/load/   -> list loads
      POST /api/delivery/run/<run_id>/load/   -> create load (+ business logic)
    """

    serializer_class = DeliveryLoadCreateSerializer

    # ------------------------------------------
    # INTERNAL HELPERS
    # ------------------------------------------

    def get_run(self):
        """Get DeliveryRun from URL parameter."""
        run_id = self.kwargs.get("run_id")
        try:
            return DeliveryRun.objects.get(id=run_id)
        except DeliveryRun.DoesNotExist:
            return None

    def get_queryset(self):
        """List loads only for this specific run."""
        run = self.get_run()
        if run:
            return DeliveryLoad.objects.filter(run=run).order_by("load_number")
        return DeliveryLoad.objects.none()

    def get_serializer(self, *args, **kwargs):
        """
        Pass `run` into serializer so all business logic
        stays inside serializer + services.
        """
        kwargs["run"] = self.get_run()
        return super().get_serializer(*args, **kwargs)

    # ------------------------------------------
    # Optional — Customize Create Response Format
    # ------------------------------------------
    def create(self, request, *args, **kwargs):
        """Override response shape, not logic."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        load = serializer.save()

        return Response(
            {
                "run_id": load.run.id,
                "load_id": load.id,
                "load_number": load.load_number,
                "status": "posted"
            },
            status=status.HTTP_201_CREATED,
        )
