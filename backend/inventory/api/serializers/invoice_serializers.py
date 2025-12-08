from django.db import transaction
from rest_framework import serializers
from inventory.models import InvoiceHeader, InvoiceItem
from inventory.services.invoice_service import InvoiceService
from inventory.models import Product

class InvoiceItemReadSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.product_name")

    class Meta:
        model = InvoiceItem
        fields = [
            "product",
            "product_name",
            "received_full",
            "received_empty",
            "received_defective"
        ]


class InvoiceReadSerializer(serializers.ModelSerializer):
    items = InvoiceItemReadSerializer(many=True, read_only=True)

    class Meta:
        model = InvoiceHeader
        fields = [
            "id",
            "invoice_number",
            "challan_number",
            "vehicle_number",
            "depot_name",
            "received_by",
            "received_at",
            "status",
            "remarks",
            "items"
        ]


class InvoiceItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    received_full = serializers.IntegerField(min_value=0)
    received_empty = serializers.IntegerField(min_value=0)
    received_defective = serializers.IntegerField(min_value=0)

    def validate_product_id(self, value):
        if not Product.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid product_id")
        return value


class InvoiceCreateSerializer(serializers.Serializer):
    invoice_number = serializers.CharField()
    challan_number = serializers.CharField(required=False, allow_blank=True)
    vehicle_number = serializers.CharField(required=False, allow_blank=True)
    depot_name = serializers.CharField(required=False, allow_blank=True)
    received_by = serializers.CharField(required=False, allow_blank=True)
    remarks = serializers.CharField(required=False, allow_blank=True)
    items = InvoiceItemInputSerializer(many=True)

    @transaction.atomic
    def create(self, validated_data):
        items = validated_data.pop("items")

        # 1) Create header
        header = InvoiceHeader.objects.create(
            invoice_number=validated_data["invoice_number"],
            challan_number=validated_data.get("challan_number", ""),
            vehicle_number=validated_data.get("vehicle_number", ""),
            depot_name=validated_data.get("depot_name", ""),
            received_by=validated_data.get("received_by", ""),
            remarks=validated_data.get("remarks", ""),
            status="DRAFT"
        )

        # 2) Create invoice items
        for item in items:
            InvoiceItem.objects.create(
                header=header,
                product=Product.objects.get(id=item["product_id"]),
                received_full=item["received_full"],
                received_empty=item["received_empty"],
                received_defective=item["received_defective"]
            )

        # 3) BUSINESS LOGIC — inventory movement
        InvoiceService.post_invoice(header)

        return header


