from rest_framework import serializers
from inventory.models import InventoryTransaction


class InventoryTransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.product_name")
    from_bucket = serializers.CharField(source="from_bucket.code", allow_null=True)
    to_bucket = serializers.CharField(source="to_bucket.code", allow_null=True)
    from_state = serializers.CharField(source="from_state.code", allow_null=True)
    to_state = serializers.CharField(source="to_state.code", allow_null=True)

    class Meta:
        model = InventoryTransaction
        fields = [
            "id",
            "product",
            "product_name",
            "quantity",
            "txn_type",
            "reference_id",
            "notes",
            "created_at",
            "from_bucket",
            "to_bucket",
            "from_state",
            "to_state"
        ]
