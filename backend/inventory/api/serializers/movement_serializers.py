from rest_framework import serializers


class ProductMovementDaySerializer(serializers.Serializer):
    date = serializers.DateField()

    opening_full = serializers.IntegerField()
    opening_empty = serializers.IntegerField()
    opening_defective = serializers.IntegerField()

    received_full = serializers.IntegerField()
    received_empty = serializers.IntegerField()
    received_defective = serializers.IntegerField()

    issued_full = serializers.IntegerField()
    delivered_full = serializers.IntegerField()
    empty_collected = serializers.IntegerField()
    unsold_full = serializers.IntegerField()
    defective_moved = serializers.IntegerField()

    closing_full = serializers.IntegerField()
    closing_empty = serializers.IntegerField()
    closing_defective = serializers.IntegerField()


class ProductMovementResponseSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    days = ProductMovementDaySerializer(many=True)
