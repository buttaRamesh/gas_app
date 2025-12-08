from rest_framework import serializers
from inventory.models import Inventory


class InventoryStockSummarySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.product_name")
    bucket = serializers.CharField(source="bucket.code")
    state = serializers.CharField(source="state.code")

    class Meta:
        model = Inventory
        fields = [
            "product",
            "product_name",
            "bucket",
            "state",
            "quantity",
        ]
