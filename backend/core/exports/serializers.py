"""
Optimized serializers for export functionality.
These serializers are designed for maximum performance by avoiding N+1 queries.
"""
from rest_framework import serializers
from consumers.models import Consumer


class ConsumerExportSerializer(serializers.ModelSerializer):
    """
    Optimized serializer for consumer exports.
    Avoids N+1 queries by using list comprehensions on prefetched data.
    """
    name = serializers.SerializerMethodField()
    mobile_number = serializers.SerializerMethodField()
    address_text = serializers.SerializerMethodField()
    street_road_name = serializers.SerializerMethodField()
    pin_code = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    phone_number = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    consumer_type = serializers.SerializerMethodField()
    cylinders = serializers.SerializerMethodField()
    ration_card_num = serializers.SerializerMethodField()
    aadhar_num = serializers.SerializerMethodField()
    pan_num = serializers.SerializerMethodField()

    class Meta:
        model = Consumer
        fields = [
            'id',
            'consumer_number',
            'name',
            'mobile_number',
            'address_text',
            'street_road_name',
            'pin_code',
            'email',
            'phone_number',
            'category',
            'consumer_type',
            'cylinders',
            'is_kyc_done',
            'ration_card_num',
            'aadhar_num',
            'pan_num',
        ]

    def get_name(self, obj):
        """Get name from person - uses prefetched data"""
        if not obj.person:
            return None
        return obj.person.full_name or f"{obj.person.first_name or ''} {obj.person.last_name or ''}".strip()

    def get_ration_card_num(self, obj):
        """Get ration card from identification - uses select_related data"""
        if obj.person and obj.person.identification:
            return obj.person.identification.ration_card_num
        return None

    def get_aadhar_num(self, obj):
        """Get aadhar from identification - uses select_related data"""
        if obj.person and obj.person.identification:
            return obj.person.identification.aadhar_num
        return None

    def get_pan_num(self, obj):
        """Get PAN from identification - uses select_related data"""
        if obj.person and obj.person.identification:
            return obj.person.identification.pan_num
        return None

    def get_address_text(self, obj):
        """Get address text from first address - uses prefetched data (no extra query)"""
        if not obj.person:
            return None
        # Access prefetched addresses - this does NOT trigger a query
        addresses = list(obj.person.addresses.all())
        return addresses[0].address_text if addresses else None

    def get_street_road_name(self, obj):
        """Get street from first address - uses prefetched data (no extra query)"""
        if not obj.person:
            return None
        addresses = list(obj.person.addresses.all())
        return addresses[0].street_road_name if addresses else None

    def get_pin_code(self, obj):
        """Get pin code from first address - uses prefetched data (no extra query)"""
        if not obj.person:
            return None
        addresses = list(obj.person.addresses.all())
        return addresses[0].pin_code if addresses else None

    def get_email(self, obj):
        """Get email from first contact - uses prefetched data (no extra query)"""
        if not obj.person:
            return None
        contacts = list(obj.person.contacts.all())
        return contacts[0].email if contacts else None

    def get_phone_number(self, obj):
        """Get phone from first contact - uses prefetched data (no extra query)"""
        if not obj.person:
            return None
        contacts = list(obj.person.contacts.all())
        return contacts[0].phone_number if contacts else None

    def get_mobile_number(self, obj):
        """Get mobile from first contact - uses prefetched data (no extra query)"""
        if not obj.person:
            return None
        contacts = list(obj.person.contacts.all())
        return contacts[0].mobile_number if contacts else None

    def get_category(self, obj):
        """Get category name - uses select_related data"""
        return obj.category.name if obj.category else None

    def get_consumer_type(self, obj):
        """Get consumer type name - uses select_related data"""
        return obj.consumer_type.name if obj.consumer_type else None

    def get_cylinders(self, obj):
        """Get cylinder count - uses prefetched data (no extra query)"""
        # Access prefetched connections - this does NOT trigger a query
        return len(list(obj.connections.all()))
