from rest_framework import serializers
from django.db import transaction

from delivery.models import DeliveryRun, DeliveryLoad, DeliveryLoadItem
from delivery.services.delivery_service import DeliveryService
from inventory.models import Product


class DeliveryLoadItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    qty_full_loaded = serializers.IntegerField(min_value=0)

    def validate_product_id(self, value):
        if not Product.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid product_id")
        return value


class DeliveryLoadCreateSerializer(serializers.Serializer):
    items = DeliveryLoadItemInputSerializer(many=True)
    remarks = serializers.CharField(required=False, allow_blank=True)

    def __init__(self, *args, **kwargs):
        self.run = kwargs.pop("run", None)
        super().__init__(*args, **kwargs)

    def validate(self, attrs):
        if not self.run:
            raise serializers.ValidationError("DeliveryRun not provided")

        if self.run.status != "OPEN":
            raise serializers.ValidationError("Cannot add load to a closed run")

        if len(attrs["items"]) == 0:
            raise serializers.ValidationError("No load items provided")

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        items = validated_data["items"]
        remarks = validated_data.get("remarks", "")

        # Create DeliveryLoad (auto load_number)
        load = DeliveryLoad.objects.create(run=self.run, remarks=remarks)

        # Add items
        for item in items:
            product = Product.objects.get(id=item["product_id"])
            DeliveryLoadItem.objects.create(
                load=load,
                product=product,
                qty_full_loaded=item["qty_full_loaded"],
            )

        # BUSINESS LOGIC: move inventory
        DeliveryService.post_load(load)

        return load
