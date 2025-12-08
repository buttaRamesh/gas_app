"""
Shared serializers for lookup tables and common patterns.
These are reusable across ALL apps to avoid duplication.
"""
from rest_framework import serializers


class LookupSerializer(serializers.Serializer):
    """
    Generic serializer for lookup tables (Category, Type, etc.)
    Use this for any model with id and name fields.
    """
    id = serializers.IntegerField()
    name = serializers.CharField()


class RouteSerializer(serializers.Serializer):
    """Serializer for Route basic info"""
    id = serializers.IntegerField()
    area_code = serializers.CharField()
    area_code_description = serializers.CharField()


class SchemeSerializer(serializers.Serializer):
    """Serializer for Scheme"""
    id = serializers.IntegerField()
    name = serializers.CharField()
    description = serializers.CharField(required=False, allow_null=True)
