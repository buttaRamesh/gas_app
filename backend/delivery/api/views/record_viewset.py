from rest_framework import viewsets, status
from rest_framework.response import Response

from delivery.models import DeliveryRun, DeliveryRecord
from delivery.api.serializers.record_serializers import (
    DeliveryRecordReadSerializer,
    DeliveryRecordCreateSerializer,
)


class DeliveryRecordViewSet(viewsets.ModelViewSet):
    """
    GET  /api/delivery/run/<run_id>/record/     -> list
    POST /api/delivery/run/<run_id>/record/     -> create
    GET  /api/delivery/record/<id>/             -> retrieve
    """

    queryset = DeliveryRecord.objects.all().order_by("-created_at")

    def get_serializer_class(self):
        if self.action == "create":
            return DeliveryRecordCreateSerializer
        return DeliveryRecordReadSerializer

    def get_run(self):
        run_id = self.kwargs.get("run_id")
        try:
            return DeliveryRun.objects.get(id=run_id)
        except DeliveryRun.DoesNotExist:
            return None

    def get_queryset(self):
        run = self.get_run()
        if run:
            return DeliveryRecord.objects.filter(run=run).order_by("-created_at")
        return super().get_queryset()

    def get_serializer(self, *args, **kwargs):
        if self.action == "create":
            kwargs["run"] = self.get_run()
            kwargs["user"] = self.request.user
        return super().get_serializer(*args, **kwargs)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        record = serializer.save()

        return Response(
            {
                "record_id": record.id,
                "run_id": record.run.id,
                "status": "created"
            },
            status=status.HTTP_201_CREATED,
        )
