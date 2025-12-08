from rest_framework import serializers
from django.db import transaction
from datetime import date

from delivery.models import (
    DeliveryRun,
    DeliveryRunRoute,
    DeliveryPerson,
    DeliveryRouteAssignment
)

class DeliveryRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryRun
        fields = ["id", "delivery_person", "run_date", "status", "started_at", "notes"]


class DeliveryRunCreateSerializer(serializers.Serializer):
    delivery_person_id = serializers.IntegerField()
    run_date = serializers.DateField(required=False)

    def validate_delivery_person_id(self, value):
        if not DeliveryPerson.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Invalid or inactive delivery_person_id")
        return value

    def validate(self, attrs):
        attrs["run_date"] = attrs.get("run_date") or date.today()
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        dp = DeliveryPerson.objects.get(id=validated_data["delivery_person_id"])
        run_date = validated_data["run_date"]

        # Create run
        run = DeliveryRun.objects.create(
            delivery_person=dp,
            run_date=run_date,
            status="OPEN",
        )

        # Auto-attach all DP routes
        assignments = DeliveryRouteAssignment.objects.filter(
            delivery_person=dp,
            is_active=True
        ).select_related("route")

        for idx, assign in enumerate(assignments, start=1):
            DeliveryRunRoute.objects.create(
                run=run,
                route=assign.route,
                order=idx,
            )

        return run
