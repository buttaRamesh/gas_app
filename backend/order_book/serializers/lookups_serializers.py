from rest_framework import serializers
from order_book.models import RefillType, DeliveryFlag, PaymentOption


class RefillTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RefillType
        fields = ["id", "name"]


class DeliveryFlagSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryFlag
        fields = ["id", "name"]


class PaymentOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentOption
        fields = ["id", "name"]
