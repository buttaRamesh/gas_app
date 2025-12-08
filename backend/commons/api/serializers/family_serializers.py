from rest_framework import serializers
from commons.models import FamilyDetails


class FamilyDetailsSerializer(serializers.ModelSerializer):
    """Serializer for FamilyDetails model"""

    class Meta:
        model = FamilyDetails
        fields = [
            'id',
            'father_name',
            'mother_name',
            'spouse_name',
        ]
        read_only_fields = ['id']
