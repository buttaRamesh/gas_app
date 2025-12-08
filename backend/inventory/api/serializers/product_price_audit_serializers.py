from rest_framework import serializers
from inventory.models import ProductPriceLog


class ProductPriceAuditSerializer(serializers.ModelSerializer):
    changed_by_username = serializers.CharField(
        source="changed_by.username",
        read_only=True
    )
    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    class Meta:
        model = ProductPriceLog
        fields = [
            "id",
            "product",
            "product_name",
            "price",
            "old_effective_from",
            "old_effective_to",
            "new_effective_from",
            "new_effective_to",
            "action_type",
            "changed_by",
            "changed_by_username",
            "changed_at",
        ]
