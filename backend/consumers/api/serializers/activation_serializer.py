from rest_framework import serializers
from consumers.models import Consumer
from commons.api.serializers import PersonSerializer


class ConsumerNewActivationSerializer(serializers.ModelSerializer):
    """
    Activation serializer with nested person data and completion status.
    Frontend receives complete data structure for activation workflow.
    """
    person = PersonSerializer(read_only=True)
    completion_info = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Consumer
        fields = [
            'id',
            'consumer_number',
            'person',
            'status',
            'status_display',
            'completion_info',
        ]

    def get_completion_info(self, obj):
        """
        Check if all required details are present.
        Returns structured status information.
        """
        missing = []
        details = {
            'has_person': bool(obj.person),
            'has_address': False,
            'has_contact': False,
            'has_identification': False,
            'has_category': bool(obj.category),
            'has_consumer_type': bool(obj.consumer_type),
        }

        if not obj.person:
            return {
                'status': 'INCOMPLETE',
                'message': 'Missing person information',
                'missing_fields': ['person'],
                'details': details
            }

        # Check address
        details['has_address'] = obj.person.addresses.exists()
        if not details['has_address']:
            missing.append('address')

        # Check contact
        details['has_contact'] = obj.person.contacts.exists()
        if not details['has_contact']:
            missing.append('contact')

        # Check identification
        details['has_identification'] = bool(obj.person.identification)
        if not details['has_identification']:
            missing.append('identification')

        # Check category and type
        if not obj.category:
            missing.append('category')
        if not obj.consumer_type:
            missing.append('consumer_type')

        if missing:
            return {
                'status': 'INCOMPLETE',
                'message': f'Missing {", ".join(missing)}',
                'missing_fields': missing,
                'details': details
            }
        else:
            return {
                'status': 'COMPLETED',
                'message': 'All required information provided',
                'missing_fields': [],
                'details': details
            }
