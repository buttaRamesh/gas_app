from rest_framework import serializers
from commons.models import Identification


class IdentificationSerializer(serializers.ModelSerializer):
    """Serializer for Identification model"""

    class Meta:
        model = Identification
        fields = [
            'id',
            'ration_card_num',
            'aadhar_num',
            'pan_num',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
