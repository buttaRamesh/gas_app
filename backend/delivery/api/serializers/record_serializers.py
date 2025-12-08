from rest_framework import serializers
from delivery.models import DeliveryRecord
from inventory.models import Product


class DeliveryRecordReadSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.product_name")
    run_id = serializers.IntegerField(source="run.id")

    class Meta:
        model = DeliveryRecord
        fields = [
            "id",
            "run_id",
            "consumer_name",
            "consumer_code",
            "booking_reference",
            "product",
            "product_name",
            "qty_full_delivered",
            "qty_empty_collected",
            "qty_empty_not_collected",
            "remarks",
            "created_at",
            "entered_by",
        ]

from delivery.services.delivery_service import DeliveryService


class DeliveryRecordCreateSerializer(serializers.Serializer):
    consumer_name = serializers.CharField()
    consumer_code = serializers.CharField(required=False, allow_blank=True)
    booking_reference = serializers.CharField(required=False, allow_blank=True)
    product_id = serializers.IntegerField()
    qty_full_delivered = serializers.IntegerField(min_value=0)
    qty_empty_collected = serializers.IntegerField(min_value=0)
    qty_empty_not_collected = serializers.IntegerField(min_value=0)
    remarks = serializers.CharField(required=False, allow_blank=True)

    def __init__(self, *args, **kwargs):
        self.run = kwargs.pop("run", None)
        self.user = kwargs.pop("user", None)
        super().__init__(*args, **kwargs)

    # -----------------------------
    # VALIDATION
    # -----------------------------
    def validate_product_id(self, value):
        if not Product.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid product_id")
        return value

    def validate(self, attrs):
        if not self.run:
            raise serializers.ValidationError("DeliveryRun missing")

        if self.run.status not in ["OPEN", "RETURNED"]:
            raise serializers.ValidationError(
                "DeliveryRecord can only be added when run is OPEN or RETURNED"
            )

        return attrs

    # -----------------------------
    # CREATE LOGIC
    # -----------------------------
    def create(self, validated_data):
        return DeliveryService.create_delivery_record(
            run=self.run,
            entered_by=self.user,
            consumer_name=validated_data["consumer_name"],
            consumer_code=validated_data.get("consumer_code", ""),
            booking_reference=validated_data.get("booking_reference", ""),
            product=Product.objects.get(id=validated_data["product_id"]),
            qty_full_delivered=validated_data["qty_full_delivered"],
            qty_empty_collected=validated_data["qty_empty_collected"],
            qty_empty_not_collected=validated_data["qty_empty_not_collected"],
            remarks=validated_data.get("remarks", ""),
        )
