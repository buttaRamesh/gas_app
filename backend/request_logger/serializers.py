from rest_framework import serializers
from .models import APILog, APIErrorLog


class APILogSerializer(serializers.ModelSerializer):
    class Meta:
        model = APILog
        fields = "__all__"


class APIErrorLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = APIErrorLog
        fields = "__all__"
