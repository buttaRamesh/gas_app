from rest_framework import serializers


class ProductDSRSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()

    opening_full = serializers.IntegerField()
    opening_empty = serializers.IntegerField()
    opening_defective = serializers.IntegerField()

    received_full = serializers.IntegerField()
    received_empty = serializers.IntegerField()
    received_defective = serializers.IntegerField()

    load_assigned = serializers.IntegerField()
    delivered_full = serializers.IntegerField()
    empty_collected = serializers.IntegerField()
    unsold_full = serializers.IntegerField()
    defective_returned = serializers.IntegerField()

    closing_full = serializers.IntegerField()
    closing_empty = serializers.IntegerField()
    closing_defective = serializers.IntegerField()


class DSRResponseSerializer(serializers.Serializer):
    date = serializers.DateField()
    products = ProductDSRSerializer(many=True)
