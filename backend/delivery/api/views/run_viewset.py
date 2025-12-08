from rest_framework import viewsets, status
from rest_framework.response import Response

from delivery.models import DeliveryRun
from delivery.api.serializers.run_serializers import (
    DeliveryRunSerializer,
    DeliveryRunCreateSerializer
)


class DeliveryRunViewSet(viewsets.ModelViewSet):
    """
    Provides:
      GET    /api/delivery/run/          -> list
      GET    /api/delivery/run/{id}/     -> retrieve
      POST   /api/delivery/run/          -> create (with business logic)
      PUT    /api/delivery/run/{id}/     -> update
      PATCH  /api/delivery/run/{id}/     -> partial update
      DELETE /api/delivery/run/{id}/     -> delete
    """
    queryset = DeliveryRun.objects.all().order_by("-run_date", "-id")
    serializer_class = DeliveryRunSerializer  # default for list/retrieve/update

    def get_serializer_class(self):
        if self.action == "create":
            return DeliveryRunCreateSerializer
        return DeliveryRunSerializer

    def create(self, request, *args, **kwargs):
        """Custom create response (no business logic here)."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        run = serializer.save()

        return Response({
            "run_id": run.id,
            "delivery_person": str(run.delivery_person),
            "run_date": run.run_date,
            "status": run.status,
            "auto_routes_added": run.routes.count(),
        }, status=status.HTTP_201_CREATED)
