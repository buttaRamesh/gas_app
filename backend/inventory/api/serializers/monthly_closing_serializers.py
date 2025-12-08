from rest_framework import serializers


class MonthlyClosingProductRowSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()

    opening_full = serializers.IntegerField()
    received_full = serializers.IntegerField()
    issued_full = serializers.IntegerField()
    delivered_full = serializers.IntegerField()
    unsold_full = serializers.IntegerField()
    closing_full = serializers.IntegerField()

    opening_empty = serializers.IntegerField()
    received_empty = serializers.IntegerField()
    empty_collected = serializers.IntegerField()
    closing_empty = serializers.IntegerField()

    opening_defective = serializers.IntegerField()
    received_defective = serializers.IntegerField()
    defective_moved = serializers.IntegerField()
    closing_defective = serializers.IntegerField()


class MonthlyClosingReportSerializer(serializers.Serializer):
    month = serializers.CharField()
    products = MonthlyClosingProductRowSerializer(many=True)
