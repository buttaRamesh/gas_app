# File: address/serializers.py
from rest_framework import serializers
from .models import Address, Contact


class AddressSerializer(serializers.ModelSerializer):
    """
    Serializer for Address model.
    Handles all address fields including generic relation fields.
    """
    content_type_name = serializers.CharField(source='content_type.model', read_only=True)

    class Meta:
        model = Address
        fields = [
            'id',
            'house_no',
            'house_name_flat_number',
            'housing_complex_building',
            'street_road_name',
            'land_mark',
            'city_town_village',
            'district',
            'pin_code',
            'address_text',
            'content_type',
            'object_id',
            'content_type_name',
        ]
        read_only_fields = ['id']


class AddressListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for address list views.
    Returns only essential fields for better performance.
    """
    content_type_name = serializers.CharField(source='content_type.model', read_only=True)

    class Meta:
        model = Address
        fields = [
            'id',
            'house_no',
            'street_road_name',
            'city_town_village',
            'district',
            'pin_code',
            'address_text',
            'content_type_name',
        ]


class ContactSerializer(serializers.ModelSerializer):
    """
    Serializer for Contact model.
    Handles email, phone, and mobile number fields.
    """
    content_type_name = serializers.CharField(source='content_type.model', read_only=True)

    class Meta:
        model = Contact
        fields = [
            'id',
            'email',
            'phone_number',
            'mobile_number',
            'content_type',
            'object_id',
            'content_type_name',
        ]
        read_only_fields = ['id']


class ContactListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for contact list views.
    """
    content_type_name = serializers.CharField(source='content_type.model', read_only=True)

    class Meta:
        model = Contact
        fields = [
            'id',
            'email',
            'mobile_number',
            'phone_number',
            'content_type_name',
        ]
