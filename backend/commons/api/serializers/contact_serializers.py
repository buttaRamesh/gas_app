from rest_framework import serializers
from commons.models import Contact


class ContactSerializer(serializers.ModelSerializer):
    """Serializer for Contact model with generic relation support"""

    class Meta:
        model = Contact
        fields = [
            'id',
            'email',
            'phone_number',
            'mobile_number',
            'content_type',
            'object_id',
        ]
        read_only_fields = ['id', 'content_type', 'object_id']  # GenericFK fields set automatically
