from rest_framework import serializers
from .models import Scheme, SubsidyDetails


class SchemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scheme
        fields = ['id', 'name', 'description']


class SubsidyDetailsSerializer(serializers.ModelSerializer):
    remaining_quota = serializers.SerializerMethodField()

    class Meta:
        model = SubsidyDetails
        fields = ['id', 'year', 'quota', 'delivered', 'remaining_quota']

    def get_remaining_quota(self, obj):
        return obj.quota - obj.delivered
