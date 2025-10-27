from rest_framework import serializers
from .models import DCTType, MarketType, ConnectionType, ConsumerCategory, ConsumerType, BPLType


class DCTTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DCTType
        fields = ['id', 'name', 'description']


class MarketTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketType
        fields = ['id', 'name']


class ConnectionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConnectionType
        fields = ['id', 'name']


class ConsumerCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsumerCategory
        fields = ['id', 'name', 'description']


class ConsumerTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsumerType
        fields = ['id', 'name', 'description']


class BPLTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BPLType
        fields = ['id', 'name', 'description']
