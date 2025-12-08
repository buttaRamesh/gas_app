from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from consumers.models import Consumer
from commons.models import Person, Contact
from delivery.models import DeliveryPerson
from order_book.models import OrderBook
from .payment_serializers import PaymentInfoSerializer
from .lookups_serializers import RefillTypeSerializer, DeliveryFlagSerializer

# OrderBook Serializers
class OrderBookListSerializer(serializers.ModelSerializer):
    """Serializer for listing orders with nested lookup values"""
    consumer_number = serializers.CharField(source="consumer.consumer_number", read_only=True)
    consumer_name = serializers.SerializerMethodField()
    mobile_number = serializers.SerializerMethodField()
    refill_type_name = serializers.CharField(source="refill_type.name", read_only=True)
    delivery_flag_name = serializers.CharField(source="delivery_flag.name", read_only=True)
    delivery_person_name = serializers.SerializerMethodField()
    payment_info = PaymentInfoSerializer(read_only=True)
    updated_by_username = serializers.CharField(source="updated_by.employee_id", read_only=True)
    is_pending = serializers.BooleanField(read_only=True)

    def get_consumer_name(self, obj):
        """Get consumer name from person"""
        if obj.consumer and obj.consumer.person:
            return obj.consumer.person.person_name
        return ""

    def get_mobile_number(self, obj):
        """Get first mobile number from consumer's contacts"""
        if not obj.consumer:
            return None

        # Try consumer's contacts first
        consumer_ct = ContentType.objects.get_for_model(Consumer)
        contact = Contact.objects.filter(
            content_type=consumer_ct,
            object_id=obj.consumer.id
        ).first()

        # If not found, try person's contacts
        if not contact and obj.consumer.person:
            person_ct = ContentType.objects.get_for_model(Person)
            contact = Contact.objects.filter(
                content_type=person_ct,
                object_id=obj.consumer.person.id
            ).first()

        return contact.mobile_number if contact else None

    def get_delivery_person_name(self, obj):
        """Get delivery person name"""
        if obj.delivery_person:
            return obj.delivery_person.name
        return None

    def get_consumer_assigned_delivery_person(self, obj):
        """Get delivery person assigned to consumer's route"""
        if not obj.consumer:
            return None

        # Get consumer's route assignment
        try:
            route_assignment = obj.consumer.route_assignment
            # Get delivery person assigned to this route (OneToOneField, so access directly)
            delivery_route_assignment = route_assignment.route.delivery_assignment
            if delivery_route_assignment:
                return delivery_route_assignment.delivery_person.id
        except Exception as e:
            # Log the exception for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.debug(f"Could not get consumer assigned delivery person: {e}")
            pass

        return None

    consumer_assigned_delivery_person = serializers.SerializerMethodField()

    class Meta:
        model = OrderBook
        fields = [
            "id",
            "consumer",
            "consumer_number",
            "consumer_name",
            "mobile_number",
            "order_no",
            "book_date",
            "product",
            "refill_type",
            "refill_type_name",
            "delivery_flag",
            "delivery_flag_name",
            "delivery_date",
            "last_delivery_date",
            "delivery_person",
            "delivery_person_name",
            "consumer_assigned_delivery_person",
            "source_file",
            "payment_info",
            "updated_by",
            "updated_by_username",
            "updated_type",
            "is_pending",
            "created_at",
            "updated_at",
        ]


class OrderBookDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with nested objects"""
    refill_type = RefillTypeSerializer(read_only=True)
    delivery_flag = DeliveryFlagSerializer(read_only=True)
    payment_info = PaymentInfoSerializer(read_only=True)
    consumer_number = serializers.CharField(source="consumer.consumer_number", read_only=True)
    consumer_name = serializers.SerializerMethodField()
    mobile_number = serializers.SerializerMethodField()
    delivery_person_name = serializers.SerializerMethodField()
    updated_by_username = serializers.CharField(source="updated_by.employee_id", read_only=True)
    is_pending = serializers.BooleanField(read_only=True)

    def get_consumer_name(self, obj):
        """Get consumer name from person"""
        if obj.consumer and obj.consumer.person:
            return obj.consumer.person.person_name
        return ""

    def get_mobile_number(self, obj):
        """Get first mobile number from consumer's contacts"""
        if not obj.consumer:
            return None

        # Try consumer's contacts first
        consumer_ct = ContentType.objects.get_for_model(Consumer)
        contact = Contact.objects.filter(
            content_type=consumer_ct,
            object_id=obj.consumer.id
        ).first()

        # If not found, try person's contacts
        if not contact and obj.consumer.person:
            person_ct = ContentType.objects.get_for_model(Person)
            contact = Contact.objects.filter(
                content_type=person_ct,
                object_id=obj.consumer.person.id
            ).first()

        return contact.mobile_number if contact else None

    def get_delivery_person_name(self, obj):
        """Get delivery person name"""
        if obj.delivery_person:
            return obj.delivery_person.name
        return None

    class Meta:
        model = OrderBook
        fields = "__all__"


class OrderBookWriteSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating orders"""

    class Meta:
        model = OrderBook
        fields = [
            "id",
            "consumer",
            "order_no",
            "book_date",
            "product",
            "refill_type",
            "delivery_flag",
            "delivery_date",
            "last_delivery_date",
            "delivery_person",
            "source_file",
            "updated_by",
            "updated_type",
        ]
        read_only_fields = ["id"]


class MarkDeliveredSerializer(serializers.Serializer):
    """Serializer for marking an order as delivered with payment info"""
    delivery_date = serializers.DateField(
        required=True,
        help_text="Delivery date. Must be on or after the booking date."
    )
    delivery_person = serializers.IntegerField(
        required=True,
        help_text="ID of the delivery person who delivered the order"
    )
    payment_option = serializers.CharField(
        required=True,
        max_length=100,
        help_text="Payment method used"
    )
    cash_memo_no = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=100,
        help_text="Cash memo number"
    )
    payment_date = serializers.DateField(
        required=True,
        help_text="Date of payment"
    )
    amount = serializers.DecimalField(
        required=True,
        max_digits=10,
        decimal_places=2,
        help_text="Payment amount"
    )
    payment_status = serializers.ChoiceField(
        required=True,
        choices=['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
        help_text="Payment status"
    )
    transaction_id = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        max_length=200,
        help_text="Transaction ID for online payments"
    )
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        help_text="Additional notes"
    )
    confirm = serializers.BooleanField(
        required=True,
        help_text="Confirmation flag - must be true to proceed"
    )

    def validate_confirm(self, value):
        """Ensure confirm is True"""
        if not value:
            raise serializers.ValidationError("You must confirm the delivery marking.")
        return value

    def validate_delivery_date(self, value):
        """Ensure delivery date is not in the future"""
        from datetime import date
        if value and value > date.today():
            raise serializers.ValidationError("Delivery date cannot be in the future.")
        return value

    def validate_amount(self, value):
        """Ensure amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value

    def validate(self, data):
        """Cross-field validation"""
        # Check if delivery_person exists
        from delivery.models import DeliveryPerson
        try:
            DeliveryPerson.objects.get(id=data['delivery_person'])
        except DeliveryPerson.DoesNotExist:
            raise serializers.ValidationError({
                'delivery_person': 'Delivery person does not exist.'
            })

        # Note: book_date validation will be done in the view where we have access to the order
        return data
