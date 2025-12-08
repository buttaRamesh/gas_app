from rest_framework import serializers
from delivery.models import DeliveryRun
from delivery.services.delivery_service import DeliveryService


class ReconcileResultSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    summary_full_delivered = serializers.IntegerField()
    record_full_delivered = serializers.IntegerField()
    delivered_diff = serializers.IntegerField()

    summary_empty_collected = serializers.IntegerField()
    record_empty_collected = serializers.IntegerField()
    empty_diff = serializers.IntegerField()


class ReconcileResponseSerializer(serializers.Serializer):
    run_id = serializers.IntegerField()
    is_reconciled = serializers.BooleanField()
    items = ReconcileResultSerializer(many=True)


class ReconcileRunCreateSerializer(serializers.Serializer):
    auto_adjust = serializers.BooleanField(default=False)

    def __init__(self, *args, **kwargs):
        self.run = kwargs.pop("run", None)
        super().__init__(*args, **kwargs)

    def validate(self, attrs):
        if not self.run:
            raise serializers.ValidationError("Invalid run")

        if not hasattr(self.run, "summary"):
            raise serializers.ValidationError("Run does not have a summary yet")

        return attrs

    def create(self, validated_data):
        auto_adjust = validated_data.get("auto_adjust", False)
        result = DeliveryService.reconcile_run(self.run, auto_adjust=auto_adjust)
        return result
