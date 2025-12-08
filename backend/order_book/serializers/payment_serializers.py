from rest_framework import serializers
from order_book.models import PaymentInfo


class PaymentInfoSerializer(serializers.ModelSerializer):
    """Serializer for payment information"""
    payment_option_name = serializers.CharField(source="payment_option.name", read_only=True)

    class Meta:
        model = PaymentInfo
        fields = [
            "id",
            "order",
            "payment_option",
            "payment_option_name",
            "cash_memo_no",
            "payment_date",
            "amount",
            "payment_status",
            "transaction_id",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
