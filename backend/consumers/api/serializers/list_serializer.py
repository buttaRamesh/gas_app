from rest_framework import serializers
from consumers.models import Consumer


class ConsumerListSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    ration_card_num = serializers.SerializerMethodField()
    aadhar_num = serializers.SerializerMethodField()
    pan_num = serializers.SerializerMethodField()

    street_road_name = serializers.SerializerMethodField()
    pin_code = serializers.SerializerMethodField()
    address_text = serializers.SerializerMethodField()

    email = serializers.SerializerMethodField()
    phone_number = serializers.SerializerMethodField()
    mobile_number = serializers.SerializerMethodField()

    category = serializers.SerializerMethodField()
    consumer_type = serializers.SerializerMethodField()

    cylinders = serializers.SerializerMethodField()

    class Meta:
        model = Consumer
        fields = [
            "id",
            "consumer_number",
            "name",

            "ration_card_num",
            "aadhar_num",
            "pan_num",

            "street_road_name",
            "pin_code",
            "address_text",

            "email",
            "phone_number",
            "mobile_number",

            "category",
            "consumer_type",

            "is_kyc_done",
            "blue_book",

            "cylinders",
        ]

    # -----------------------
    # NAME
    # -----------------------
    def get_name(self, obj) -> str | None:
        person = obj.person
        if not person:
            return None

        if person.full_name:
            return person.full_name

        return f"{person.first_name or ''} {person.last_name or ''}".strip()

    # -----------------------
    # IDENTIFICATION
    # -----------------------
    def _ident(self, obj):
        person = obj.person
        if person and person.identification:
            return person.identification
        return None

    def get_ration_card_num(self, obj) -> str | None:
        ident = self._ident(obj)
        return ident.ration_card_num if ident else None

    def get_aadhar_num(self, obj) -> str | None:
        ident = self._ident(obj)
        return ident.aadhar_num if ident else None

    def get_pan_num(self, obj) -> str | None:
        ident = self._ident(obj)
        return ident.pan_num if ident else None

    # -----------------------
    # ADDRESS (first)
    # -----------------------
    def _addr(self, obj):
        person = obj.person
        if person and person.addresses.exists():
            return person.addresses.first()
        return None

    def get_street_road_name(self, obj) -> str | None:
        a = self._addr(obj)
        return a.street_road_name if a else None

    def get_pin_code(self, obj) -> str | None:
        a = self._addr(obj)
        return a.pin_code if a else None

    def get_address_text(self, obj) -> str | None:
        a = self._addr(obj)
        return a.address_text if a else None

    # -----------------------
    # CONTACT (first)
    # -----------------------
    def _contact(self, obj):
        person = obj.person
        if person and person.contacts.exists():
            return person.contacts.first()
        return None

    def get_email(self, obj) -> str | None:
        c = self._contact(obj)
        return c.email if c else None

    def get_phone_number(self, obj) -> str | None:
        c = self._contact(obj)
        return c.phone_number if c else None

    def get_mobile_number(self, obj) -> str | None:
        c = self._contact(obj)
        return c.mobile_number if c else None

    # -----------------------
    # CATEGORY / TYPE
    # -----------------------
    def get_category(self, obj) -> str | None:
        return obj.category.name if obj.category else None

    def get_consumer_type(self, obj) -> str | None:
        return obj.consumer_type.name if obj.consumer_type else None

    # -----------------------
    # CYLINDER COUNT
    # -----------------------
    def get_cylinders(self, obj) -> int:
        return obj.connections.count()


class ConsumerKYCListSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    mobile_number = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    consumer_type = serializers.SerializerMethodField()

    class Meta:
        model = Consumer
        fields = [
            "id",
            "consumer_number",
            "name",
            "mobile_number",
            'address',
            "is_kyc_done",
            "category",
            "consumer_type",
        ]

    def get_name(self, obj) -> str | None:
        p = obj.person
        if not p:
            return None
        return p.full_name or f"{p.first_name or ''} {p.last_name or ''}".strip()

    def get_mobile_number(self, obj) -> str | None:
        p = obj.person
        if p and p.contacts.exists():
            return p.contacts.first().mobile_number
        return None
    def get_address(self, obj) -> str | None:
        p = obj.person
        print(p)
        if p and p.addresses.exists():
            return p.addresses.first().address_text
        return None

    def get_category(self, obj) -> str | None:
        return obj.category.name if obj.category else None

    def get_consumer_type(self, obj) -> str | None:
        return obj.consumer_type.name if obj.consumer_type else None
