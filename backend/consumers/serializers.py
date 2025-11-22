# File: consumers/serializers.py
from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import Consumer, Person, Identification
from address.models import Address, Contact


class PersonSerializer(serializers.ModelSerializer):
    """Serializer for Person model"""
    class Meta:
        model = Person
        fields = [
            'id',
            'person_name',
            'father_name',
            'mother_name',
            'spouse_name',
            'dob',
        ]
        extra_kwargs = {
            'id': {'read_only': False, 'required': False},
        }


class AddressSerializer(serializers.ModelSerializer):
    """Nested serializer for Address"""
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
        ]
        extra_kwargs = {
            'id': {'read_only': False, 'required': False},
        }


class ContactSerializer(serializers.ModelSerializer):
    """Nested serializer for Contact"""
    class Meta:
        model = Contact
        fields = [
            'id',
            'email',
            'phone_number',
            'mobile_number',
        ]
        extra_kwargs = {
            'id': {'read_only': False, 'required': False},
        }


class IdentificationSerializer(serializers.ModelSerializer):
    """Serializer for Identification"""
    class Meta:
        model = Identification
        fields = [
            'id',
            'ration_card_num',
            'aadhar_num',
            'pan_num',
        ]
        extra_kwargs = {
            'id': {'read_only': False, 'required': False},
        }


class ConsumerListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for list views.
    Returns only essential fields for better performance.
    """
    consumer_name = serializers.CharField(source='person.person_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    type_name = serializers.CharField(source='consumer_type.name', read_only=True)
    opting_status_display = serializers.CharField(source='get_opting_status_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    mobile_number = serializers.SerializerMethodField()

    class Meta:
        model = Consumer
        fields = [
            'id',
            'consumer_number',
            'consumer_name',
            'category',
            'category_name',
            'consumer_type',
            'type_name',
            'opting_status',
            'opting_status_display',
            'status',
            'status_display',
            'is_kyc_done',
            'mobile_number',
        ]

    def get_mobile_number(self, obj):
        """Get first mobile number from consumer's contacts"""
        # Try consumer's contacts first, then person's contacts
        consumer_ct = ContentType.objects.get_for_model(Consumer)
        contact = Contact.objects.filter(content_type=consumer_ct, object_id=obj.id).first()

        if not contact and obj.person:
            person_ct = ContentType.objects.get_for_model(Person)
            contact = Contact.objects.filter(content_type=person_ct, object_id=obj.person.id).first()

        return contact.mobile_number if contact else None


class ConsumerNewActivationSerializer(serializers.ModelSerializer):
    """
    Serializer for NEW consumers with activation info.
    Shows completion status and missing details.
    """
    consumer_name = serializers.CharField(source='person.person_name', read_only=True)
    mobile_number = serializers.SerializerMethodField()
    completion_info = serializers.SerializerMethodField()

    class Meta:
        model = Consumer
        fields = [
            'id',
            'consumer_number',
            'consumer_name',
            'mobile_number',
            'status',
            'completion_info',
        ]

    def get_mobile_number(self, obj):
        """Get first mobile number from consumer's contacts"""
        # Try consumer's contacts first, then person's contacts
        consumer_ct = ContentType.objects.get_for_model(Consumer)
        contact = Contact.objects.filter(content_type=consumer_ct, object_id=obj.id).first()

        if not contact and obj.person:
            person_ct = ContentType.objects.get_for_model(Person)
            contact = Contact.objects.filter(content_type=person_ct, object_id=obj.person.id).first()

        return contact.mobile_number if contact else None

    def get_completion_info(self, obj):
        """
        Check if all required details are present.
        Returns status and list of missing details.
        """
        missing = []

        if not obj.person:
            missing.append('person')
            return {
                'status': 'INCOMPLETE',
                'message': 'INCOMPLETE - Missing person information'
            }

        # Check address (consumer or person)
        consumer_ct = ContentType.objects.get_for_model(Consumer)
        has_address = Address.objects.filter(content_type=consumer_ct, object_id=obj.id).exists()
        if not has_address and obj.person:
            person_ct = ContentType.objects.get_for_model(Person)
            has_address = Address.objects.filter(content_type=person_ct, object_id=obj.person.id).exists()
        if not has_address:
            missing.append('address')

        # Check contact (consumer or person)
        has_contact = Contact.objects.filter(content_type=consumer_ct, object_id=obj.id).exists()
        if not has_contact and obj.person:
            person_ct = ContentType.objects.get_for_model(Person)
            has_contact = Contact.objects.filter(content_type=person_ct, object_id=obj.person.id).exists()
        if not has_contact:
            missing.append('contact')

        # Check identification
        try:
            if not obj.identification:
                missing.append('identification')
        except Identification.DoesNotExist:
            missing.append('identification')

        # Check additional details (category, consumer_type)
        if not obj.category or not obj.consumer_type:
            missing.append('additional details')

        if missing:
            return {
                'status': 'INCOMPLETE',
                'message': f'INCOMPLETE - Missing {", ".join(missing)}'
            }
        else:
            return {
                'status': 'COMPLETED',
                'message': 'COMPLETED'
            }


class ConsumerDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for single consumer view.
    Includes all fields and nested relationships.
    """
    consumer_name = serializers.CharField(source='person.person_name', read_only=True)
    father_name = serializers.CharField(source='person.father_name', read_only=True)
    mother_name = serializers.CharField(source='person.mother_name', read_only=True)
    spouse_name = serializers.CharField(source='person.spouse_name', read_only=True)
    dob = serializers.DateField(source='person.dob', read_only=True, allow_null=True)
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    type_name = serializers.CharField(source='consumer_type.name', read_only=True, allow_null=True)
    bpl_type_name = serializers.CharField(source='bpl_type.name', read_only=True, allow_null=True)
    dct_type_name = serializers.CharField(source='dct_type.name', read_only=True, allow_null=True)
    scheme_name = serializers.CharField(source='scheme.name', read_only=True, allow_null=True)
    opting_status_display = serializers.CharField(source='get_opting_status_display', read_only=True)

    # Nested serializers
    addresses = serializers.SerializerMethodField()
    contacts = serializers.SerializerMethodField()
    identification = serializers.SerializerMethodField()

    class Meta:
        model = Consumer
        fields = [
            'id',
            'consumer_number',
            'consumer_name',
            'father_name',
            'mother_name',
            'spouse_name',
            'dob',
            'blue_book',
            'lpg_id',
            'is_kyc_done',
            'category',
            'category_name',
            'consumer_type',
            'type_name',
            'bpl_type',
            'bpl_type_name',
            'dct_type',
            'dct_type_name',
            'opting_status',
            'opting_status_display',
            'status',
            'scheme',
            'scheme_name',
            'addresses',
            'contacts',
            'identification',
        ]

    def get_addresses(self, obj):
        """Get all addresses for this consumer (linked via generic relation)"""
        # Addresses can be linked to either Consumer or Person
        # First try Consumer, then fall back to Person
        consumer_ct = ContentType.objects.get_for_model(Consumer)
        addresses = Address.objects.filter(content_type=consumer_ct, object_id=obj.id)

        if not addresses.exists() and obj.person:
            # Fall back to person's addresses if no direct consumer addresses
            person_ct = ContentType.objects.get_for_model(Person)
            addresses = Address.objects.filter(content_type=person_ct, object_id=obj.person.id)

        return [{
            'id': addr.id,
            'house_no': addr.house_no,
            'house_name_flat_number': addr.house_name_flat_number,
            'housing_complex_building': addr.housing_complex_building,
            'street_road_name': addr.street_road_name,
            'land_mark': addr.land_mark,
            'city_town_village': addr.city_town_village,
            'district': addr.district,
            'pin_code': addr.pin_code,
            'address_text': addr.address_text,
        } for addr in addresses]

    def get_contacts(self, obj):
        """Get all contacts for this consumer (linked via generic relation)"""
        # Contacts can be linked to either Consumer or Person
        # First try Consumer, then fall back to Person
        consumer_ct = ContentType.objects.get_for_model(Consumer)
        contacts = Contact.objects.filter(content_type=consumer_ct, object_id=obj.id)

        if not contacts.exists() and obj.person:
            # Fall back to person's contacts if no direct consumer contacts
            person_ct = ContentType.objects.get_for_model(Person)
            contacts = Contact.objects.filter(content_type=person_ct, object_id=obj.person.id)

        return [{
            'id': contact.id,
            'email': contact.email,
            'mobile_number': contact.mobile_number,
            'phone_number': contact.phone_number,
        } for contact in contacts]

    def get_identification(self, obj):
        """Get identification for this consumer"""
        try:
            identification = obj.identification
            return {
                'id': identification.id,
                'ration_card_num': identification.ration_card_num,
                'aadhar_num': identification.aadhar_num,
                'pan_num': identification.pan_num,
            }
        except Identification.DoesNotExist:
            return None


class ConsumersByRouteSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for consumers by route/delivery person views.
    Includes all essential consumer information with related data.
    """
    consumer_id = serializers.IntegerField(source='id', read_only=True)
    consumer_name = serializers.CharField(source='person.person_name', read_only=True)
    category = serializers.CharField(source='category.name', read_only=True)
    consumer_type = serializers.CharField(source='consumer_type.name', read_only=True)
    mobile = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    route_code = serializers.SerializerMethodField()
    cylinders = serializers.SerializerMethodField()

    class Meta:
        model = Consumer
        fields = [
            'consumer_id',
            'consumer_number',
            'consumer_name',
            'mobile',
            'address',
            'route_code',
            'category',
            'consumer_type',
            'cylinders',
        ]

    def get_mobile(self, obj):
        """Get first mobile number from consumer's contacts"""
        # Try consumer's contacts first, then person's contacts
        consumer_ct = ContentType.objects.get_for_model(Consumer)
        contact = Contact.objects.filter(content_type=consumer_ct, object_id=obj.id).first()

        if not contact and obj.person:
            person_ct = ContentType.objects.get_for_model(Person)
            contact = Contact.objects.filter(content_type=person_ct, object_id=obj.person.id).first()

        return contact.mobile_number if contact else None

    def get_address(self, obj):
        """Get first address text from consumer's addresses"""
        # Try consumer's addresses first, then person's addresses
        consumer_ct = ContentType.objects.get_for_model(Consumer)
        address = Address.objects.filter(content_type=consumer_ct, object_id=obj.id).first()

        if not address and obj.person:
            person_ct = ContentType.objects.get_for_model(Person)
            address = Address.objects.filter(content_type=person_ct, object_id=obj.person.id).first()

        if address:
            # Return formatted address
            parts = []
            if address.address_text:
                parts.append(address.address_text)
            if address.city_town_village:
                parts.append(address.city_town_village)
            if address.pin_code:
                parts.append(f"PIN: {address.pin_code}")
            return ", ".join(parts) if parts else None
        return None

    def get_route_code(self, obj):
        """Get route code from route assignment"""
        try:
            return obj.route_assignment.route.area_code
        except AttributeError:
            return None

    def get_cylinders(self, obj):
        """Get count of connections (cylinders) the consumer holds"""
        # Count connections related to this consumer
        return obj.connections.count()


class ConsumerCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating consumers.
    Supports nested person, address, contact, and identification creation/update.
    """
    # Person fields (will be used to create/update Person)
    person_name = serializers.CharField(write_only=True)
    father_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    mother_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    spouse_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    dob = serializers.DateField(write_only=True, required=False, allow_null=True)

    # Nested serializers
    address = AddressSerializer(required=False, allow_null=True)
    contact = ContactSerializer(required=False, allow_null=True)
    identification = IdentificationSerializer(required=False, allow_null=True)

    class Meta:
        model = Consumer
        fields = [
            'consumer_number',
            'person_name',
            'father_name',
            'mother_name',
            'spouse_name',
            'dob',
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
            'address',
            'contact',
            'identification',
        ]

    def validate_consumer_number(self, value):
        """Ensure consumer number is unique"""
        # Skip validation if consumer_number is empty (will be added later from vendor)
        if not value:
            return value

        if self.instance:  # Update case
            if Consumer.objects.exclude(pk=self.instance.pk).filter(consumer_number=value).exists():
                raise serializers.ValidationError("Consumer number already exists.")
        else:  # Create case
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
        """Create consumer with nested person, address, contact, and identification"""
        # Extract person data
        person_name = validated_data.pop('person_name')
        father_name = validated_data.pop('father_name', '')
        mother_name = validated_data.pop('mother_name', '')
        spouse_name = validated_data.pop('spouse_name', '')
        dob = validated_data.pop('dob', None)

        # Extract nested data
        address_data = validated_data.pop('address', None)
        contact_data = validated_data.pop('contact', None)
        identification_data = validated_data.pop('identification', None)

        # Create Person
        person = Person.objects.create(
            person_name=person_name,
            father_name=father_name or None,
            mother_name=mother_name or None,
            spouse_name=spouse_name or None,
            dob=dob,
        )

        # Create the consumer
        consumer = Consumer.objects.create(person=person, **validated_data)

        # Get content type for person (addresses and contacts belong to person now)
        content_type = ContentType.objects.get_for_model(Person)

        # Create address if provided
        if address_data:
            Address.objects.create(
                content_type=content_type,
                object_id=person.id,
                **address_data
            )

        # Create contact if provided
        if contact_data:
            Contact.objects.create(
                content_type=content_type,
                object_id=person.id,
                **contact_data
            )

        # Create identification if provided
        if identification_data:
            Identification.objects.create(
                consumer=consumer,
                **identification_data
            )

        return consumer

    def update(self, instance, validated_data):
        """Update consumer with nested person, address, contact, and identification"""
        # Extract person data
        person_name = validated_data.pop('person_name', None)
        father_name = validated_data.pop('father_name', None)
        mother_name = validated_data.pop('mother_name', None)
        spouse_name = validated_data.pop('spouse_name', None)
        dob = validated_data.pop('dob', None)

        # Extract nested data
        address_data = validated_data.pop('address', None)
        contact_data = validated_data.pop('contact', None)
        identification_data = validated_data.pop('identification', None)

        # Update person if person fields provided
        if person_name is not None or father_name is not None or mother_name is not None or spouse_name is not None or dob is not None:
            if not instance.person:
                # Create person if doesn't exist
                instance.person = Person.objects.create(
                    person_name=person_name or 'Unknown',
                    father_name=father_name or None,
                    mother_name=mother_name or None,
                    spouse_name=spouse_name or None,
                    dob=dob,
                )
                instance.save()
            else:
                # Update existing person
                if person_name is not None:
                    instance.person.person_name = person_name
                if father_name is not None:
                    instance.person.father_name = father_name or None
                if mother_name is not None:
                    instance.person.mother_name = mother_name or None
                if spouse_name is not None:
                    instance.person.spouse_name = spouse_name or None
                if dob is not None:
                    instance.person.dob = dob
                instance.person.save()

        # Update consumer fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Get content type for person
        if instance.person:
            content_type = ContentType.objects.get_for_model(Person)

            # Update or create address
            if address_data is not None:
                address_id = address_data.pop('id', None)
                if address_id:
                    # Update existing address
                    Address.objects.filter(id=address_id).update(**address_data)
                else:
                    # Try to get existing address or create new one
                    existing_address = instance.person.addresses.first()
                    if existing_address:
                        for attr, value in address_data.items():
                            setattr(existing_address, attr, value)
                        existing_address.save()
                    else:
                        Address.objects.create(
                            content_type=content_type,
                            object_id=instance.person.id,
                            **address_data
                        )

            # Update or create contact
            if contact_data is not None:
                contact_id = contact_data.pop('id', None)
                if contact_id:
                    # Update existing contact
                    Contact.objects.filter(id=contact_id).update(**contact_data)
                else:
                    # Try to get existing contact or create new one
                    existing_contact = instance.person.contacts.first()
                    if existing_contact:
                        for attr, value in contact_data.items():
                            setattr(existing_contact, attr, value)
                        existing_contact.save()
                    else:
                        Contact.objects.create(
                            content_type=content_type,
                            object_id=instance.person.id,
                            **contact_data
                        )

        # Update or create identification
        if identification_data is not None:
            identification_id = identification_data.pop('id', None)
            try:
                # Try to get existing identification
                existing_identification = instance.identification
                for attr, value in identification_data.items():
                    setattr(existing_identification, attr, value)
                existing_identification.save()
            except Identification.DoesNotExist:
                # Create new identification
                Identification.objects.create(
                    consumer=instance,
                    **identification_data
                )

        return instance
