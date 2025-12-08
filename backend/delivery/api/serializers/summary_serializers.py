from rest_framework import serializers
from django.db import transaction

from delivery.models import (
    DeliverySummary,
    DeliverySummaryItem,
    DeliveryRun
)
from inventory.models import Product
from delivery.services.delivery_service import DeliveryService

class DeliverySummaryItemReadSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.product_name")

    class Meta:
        model = DeliverySummaryItem
        fields = [
            "product",
            "product_name",
            "total_full_loaded",
            "total_full_delivered",
            "total_empty_collected",
            "total_unsold_full",
            "total_defective",
        ]


class DeliverySummaryReadSerializer(serializers.ModelSerializer):
    items = DeliverySummaryItemReadSerializer(many=True, read_only=True)
    run_id = serializers.IntegerField(source="run.id")

    class Meta:
        model = DeliverySummary
        fields = [
            "id",
            "run_id",
            "notes",
            "recorded_at",
            "entered_by",
            "items",
        ]

class SummaryItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    total_full_loaded = serializers.IntegerField(min_value=0)
    total_full_delivered = serializers.IntegerField(min_value=0)
    total_empty_collected = serializers.IntegerField(min_value=0)
    total_unsold_full = serializers.IntegerField(min_value=0)
    total_defective = serializers.IntegerField(min_value=0)

    def validate_product_id(self, value):
        if not Product.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid product_id")
        return value

class DeliverySummaryCreateSerializer(serializers.Serializer):
    """
    Custom serializer: this handles the POST request.
    Creates:
        - DeliverySummary (header)
        - DeliverySummaryItem rows
    And calls:
        - DeliveryService.post_summary(summary)  (inventory movements)
    """

    items = SummaryItemInputSerializer(many=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def __init__(self, *args, **kwargs):
        self.run = kwargs.pop("run", None)
        self.user = kwargs.pop("user", None)
        super().__init__(*args, **kwargs)

    # -----------------------------
    # VALIDATION
    # -----------------------------
    def validate(self, attrs):
        if not self.run:
            raise serializers.ValidationError("DeliveryRun not found")

        if self.run.status != "OPEN":
            raise serializers.ValidationError("Summary can only be posted for an OPEN run")

        if len(attrs["items"]) == 0:
            raise serializers.ValidationError("At least one summary item is required")

        return attrs

    # -----------------------------
    # CREATE METHOD (BUSINESS LOGIC)
    # -----------------------------
    @transaction.atomic
    def create(self, validated_data):
        notes = validated_data.get("notes", "")
        items = validated_data["items"]

        # 1) Create DeliverySummary header
        summary = DeliverySummary.objects.create(
            run=self.run,
            entered_by=self.user,
            notes=notes,
        )

        # 2) Create DeliverySummaryItem rows
        for row in items:
            product = Product.objects.get(id=row["product_id"])
            DeliverySummaryItem.objects.create(
                summary=summary,
                product=product,
                total_full_loaded=row["total_full_loaded"],
                total_full_delivered=row["total_full_delivered"],
                total_empty_collected=row["total_empty_collected"],
                total_unsold_full=row["total_unsold_full"],
                total_defective=row["total_defective"],
            )

        # 3) BUSINESS LOGIC: Inventory Movement
        # — CM_OUT → GODOWN/EMPTY
        # — CM_OUT → GODOWN/FULL (unsold)
        # — CM_OUT → DEF
        DeliveryService.post_summary(summary)

        return summary
