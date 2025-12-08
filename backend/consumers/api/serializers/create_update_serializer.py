from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from consumers.models import Consumer
from commons.models import Person, Address, Contact, FamilyDetails, Identification
from commons.api.serializers import PersonCreateUpdateSerializer


class ConsumerCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating consumers.
    Uses nested person object for consistent API structure.
    INPUT and OUTPUT both use the same nested format!
    """
    # Nested person object (includes addresses, contacts, identification, family)
    person = PersonCreateUpdateSerializer(required=False, allow_null=True)

    class Meta:
        model = Consumer
        fields = [
            'consumer_number',
            'person',
            'blue_book',
            'lpg_id',
            'is_kyc_done',
            'category',
            'consumer_type',
            'bpl_type',
            'dct_type',
            'opting_status',
            'status',
            'scheme',
        ]

    def validate_consumer_number(self, value):
        """Ensure consumer number is unique"""
        if not value:
            return value

        if self.instance:
            if Consumer.objects.exclude(pk=self.instance.pk).filter(consumer_number=value).exists():
                raise serializers.ValidationError("Consumer number already exists.")
        else:
            if Consumer.objects.filter(consumer_number=value).exists():
                raise serializers.ValidationError("Consumer number already exists.")
        return value

    def validate_lpg_id(self, value):
        """Ensure LPG ID is unique if provided"""
        if value:
            if self.instance:
                if Consumer.objects.exclude(pk=self.instance.pk).filter(lpg_id=value).exists():
                    raise serializers.ValidationError("LPG ID already exists.")
            else:
                if Consumer.objects.filter(lpg_id=value).exists():
                    raise serializers.ValidationError("LPG ID already exists.")
        return value

    def create(self, validated_data):
        """Create consumer with nested person object"""
        # Extract person data
        person_data = validated_data.pop('person', None)

        # Create Person using PersonCreateUpdateSerializer
        person = None
        if person_data:
            person_serializer = PersonCreateUpdateSerializer(data=person_data)
            person_serializer.is_valid(raise_exception=True)
            person = person_serializer.save()

        # Get content type for person (for generic FK)
        person_ct = ContentType.objects.get_for_model(Person)

        # Create the consumer with generic FK to person
        consumer = Consumer.objects.create(
            person_content_type=person_ct if person else None,
            person_object_id=person.id if person else None,
            **validated_data
        )

        return consumer

    def update(self, instance, validated_data):
        """Update consumer with nested person object"""
        # Extract person data
        person_data = validated_data.pop('person', None)

        # Update or create Person using PersonCreateUpdateSerializer
        if person_data is not None:
            if instance.person:
                # Update existing person
                person_serializer = PersonCreateUpdateSerializer(
                    instance.person,
                    data=person_data,
                    partial=True
                )
                person_serializer.is_valid(raise_exception=True)
                person_serializer.save()
            else:
                # Create new person
                person_serializer = PersonCreateUpdateSerializer(data=person_data)
                person_serializer.is_valid(raise_exception=True)
                person = person_serializer.save()

                # Link to consumer
                person_ct = ContentType.objects.get_for_model(Person)
                instance.person_content_type = person_ct
                instance.person_object_id = person.id

        # Update consumer fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
