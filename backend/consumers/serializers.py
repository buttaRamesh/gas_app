# File: consumers/serializers.py
from rest_framework import serializers
from .models import Consumer


class ConsumerListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for list views.
    Returns only essential fields for better performance.
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    type_name = serializers.CharField(source='consumer_type.name', read_only=True)
    opting_status_display = serializers.CharField(source='get_opting_status_display', read_only=True)
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
            'is_kyc_done',
            'mobile_number',
        ]
    
    def get_mobile_number(self, obj):
        """Get first mobile number from contacts"""
        contact = obj.contacts.first()
        return contact.mobile_number if contact else None


class ConsumerDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for single consumer view.
    Includes all fields and nested relationships.
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    type_name = serializers.CharField(source='consumer_type.name', read_only=True)
    bpl_type_name = serializers.CharField(source='bpl_type.name', read_only=True, allow_null=True)
    dct_type_name = serializers.CharField(source='dct_type.name', read_only=True, allow_null=True)
    scheme_name = serializers.CharField(source='scheme.name', read_only=True, allow_null=True)
    opting_status_display = serializers.CharField(source='get_opting_status_display', read_only=True)
    
    # We'll add nested serializers later when we do those apps
    addresses = serializers.SerializerMethodField()
    contacts = serializers.SerializerMethodField()
    
    class Meta:
        model = Consumer
        fields = [
            'id',
            'consumer_number',
            'consumer_name',
            'father_name',
            'mother_name',
            'spouse_name',
            'ration_card_num',
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
            'scheme',
            'scheme_name',
            'addresses',
            'contacts',
        ]
    
    def get_addresses(self, obj):
        """Get all addresses for this consumer"""
        addresses = obj.addresses.all()
        return [{
            'id': addr.id,
            'address_text': addr.address_text,
            'city': addr.city_town_village,
            'pin_code': addr.pin_code,
        } for addr in addresses]
    
    def get_contacts(self, obj):
        """Get all contacts for this consumer"""
        contacts = obj.contacts.all()
        return [{
            'id': contact.id,
            'email': contact.email,
            'mobile_number': contact.mobile_number,
            'phone_number': contact.phone_number,
        } for contact in contacts]


class ConsumerCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating consumers.
    Only includes editable fields.
    """
    class Meta:
        model = Consumer
        fields = [
            'consumer_number',
            'consumer_name',
            'father_name',
            'mother_name',
            'spouse_name',
            'ration_card_num',
            'blue_book',
            'lpg_id',
            'is_kyc_done',
            'category',
            'consumer_type',
            'bpl_type',
            'dct_type',
            'opting_status',
            'scheme',
        ]
    
    def validate_consumer_number(self, value):
        """Ensure consumer number is unique"""
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
