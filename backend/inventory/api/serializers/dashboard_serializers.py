from rest_framework import serializers

# lightweight serializers for nested pieces

class ProductStockSummarySerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    bucket = serializers.CharField()
    state = serializers.CharField()
    quantity = serializers.IntegerField()


class KPIItemSerializer(serializers.Serializer):
    key = serializers.CharField()
    label = serializers.CharField()
    value = serializers.IntegerField()


class RecentTxnSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    quantity = serializers.IntegerField()
    txn_type = serializers.CharField()
    reference_id = serializers.CharField(allow_null=True)
    notes = serializers.CharField(allow_null=True)
    created_at = serializers.DateTimeField()
    from_bucket = serializers.CharField(allow_null=True)
    to_bucket = serializers.CharField(allow_null=True)


class TopMoverSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    moved_qty = serializers.IntegerField()


class InventoryDashboardSerializer(serializers.Serializer):
    date = serializers.DateField()
    kpis = KPIItemSerializer(many=True)
    stock_summary = ProductStockSummarySerializer(many=True)
    low_stock = ProductStockSummarySerializer(many=True)
    recent_txns = RecentTxnSerializer(many=True)
    top_movers = TopMoverSerializer(many=True)
