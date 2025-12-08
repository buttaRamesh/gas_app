from rest_framework import serializers
from commons.models import Person, Address, Contact, FamilyDetails, Identification
from .address_serializers import AddressSerializer
from .contact_serializers import ContactSerializer
from .family_serializers import FamilyDetailsSerializer
from .identification_serializers import IdentificationSerializer
 

class PersonSerializer(serializers.ModelSerializer):
    identification = IdentificationSerializer(read_only=True)
    addresses = AddressSerializer(many=True, read_only=True)
    contacts = ContactSerializer(many=True, read_only=True)

    class Meta:
        model = Person
        fields = [
            "id",
            "first_name",
            "last_name",
            "full_name",
            "dob",
            "identification",
            "addresses",
            "contacts",
        ]





# class PersonSerializer(serializers.ModelSerializer):
#     """Serializer for Person model with nested relations"""

#     # Nested serializers for related data (read-only)
#     addresses = AddressSerializer(many=True, read_only=True)
#     contacts = ContactSerializer(many=True, read_only=True)
#     identification_details = IdentificationSerializer(source='identification', read_only=True)
#     family = FamilyDetailsSerializer(source='family_details', read_only=True)

#     # Write fields for FK relations
#     identification_id = serializers.PrimaryKeyRelatedField(
#         queryset=Identification.objects.all(),
#         source='identification',
#         required=False,
#         allow_null=True
#     )
#     family_details_id = serializers.PrimaryKeyRelatedField(
#         queryset=FamilyDetails.objects.all(),
#         source='family_details',
#         required=False,
#         allow_null=True
#     )

#     class Meta:
#         model = Person
#         fields = [
#             'id',
#             'first_name',
#             'last_name',
#             'full_name',
#             'dob',
#             'identification_id',
#             'identification_details',
#             'family_details_id',
#             'family',
#             'addresses',
#             'contacts',
#         ]
#         read_only_fields = ['id']


class PersonCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating Person with embedded related data"""

    identification = IdentificationSerializer(required=False, allow_null=True)
    family_details = FamilyDetailsSerializer(required=False, allow_null=True)
    addresses = AddressSerializer(many=True, required=False)
    contacts = ContactSerializer(many=True, required=False)

    class Meta:
        model = Person
        fields = [
            'id',
            'first_name',
            'last_name',
            'full_name',
            'dob',
            'identification',
            'family_details',
            'addresses',
            'contacts',
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        # Extract nested data
        identification_data = validated_data.pop('identification', None)
        family_details_data = validated_data.pop('family_details', None)
        addresses_data = validated_data.pop('addresses', [])
        contacts_data = validated_data.pop('contacts', [])

        # Create related objects first
        if identification_data:
            identification = Identification.objects.create(**identification_data)
            validated_data['identification'] = identification

        if family_details_data:
            family_details = FamilyDetails.objects.create(**family_details_data)
            validated_data['family_details'] = family_details

        # Create person
        person = Person.objects.create(**validated_data)

        # Create addresses with generic relation to person
        for address_data in addresses_data:
            Address.objects.create(related_object=person, **address_data)

        # Create contacts with generic relation to person
        for contact_data in contacts_data:
            Contact.objects.create(related_object=person, **contact_data)

        return person

    def update(self, instance, validated_data):
        # Extract nested data
        identification_data = validated_data.pop('identification', None)
        family_details_data = validated_data.pop('family_details', None)
        addresses_data = validated_data.pop('addresses', None)
        contacts_data = validated_data.pop('contacts', None)

        # Update identification
        if identification_data is not None:
            if instance.identification:
                for key, value in identification_data.items():
                    setattr(instance.identification, key, value)
                instance.identification.save()
            else:
                identification = Identification.objects.create(**identification_data)
                instance.identification = identification

        # Update family details
        if family_details_data is not None:
            if instance.family_details:
                for key, value in family_details_data.items():
                    setattr(instance.family_details, key, value)
                instance.family_details.save()
            else:
                family_details = FamilyDetails.objects.create(**family_details_data)
                instance.family_details = family_details

        # Update addresses (replace all)
        if addresses_data is not None:
            instance.addresses.all().delete()
            for address_data in addresses_data:
                Address.objects.create(related_object=instance, **address_data)

        # Update contacts (replace all)
        if contacts_data is not None:
            instance.contacts.all().delete()
            for contact_data in contacts_data:
                Contact.objects.create(related_object=instance, **contact_data)

        # Update person fields
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()

        return instance
