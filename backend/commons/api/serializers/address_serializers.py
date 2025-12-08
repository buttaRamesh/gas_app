from rest_framework import serializers
from commons.models import Address


class AddressSerializer(serializers.ModelSerializer):
    """Serializer for Address model with generic relation support"""

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
        ]
        read_only_fields = ['id', 'content_type', 'object_id']  # GenericFK fields set automatically
