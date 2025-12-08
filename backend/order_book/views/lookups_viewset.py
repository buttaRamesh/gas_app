from rest_framework import viewsets, permissions
from order_book.models import RefillType, DeliveryFlag, PaymentOption
from order_book.serializers import (
    RefillTypeSerializer,
    DeliveryFlagSerializer,
    PaymentOptionSerializer,
)


class RefillTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for RefillType lookup"""
    queryset = RefillType.objects.all()
    serializer_class = RefillTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class DeliveryFlagViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for DeliveryFlag lookup"""
    queryset = DeliveryFlag.objects.all()
    serializer_class = DeliveryFlagSerializer
    permission_classes = [permissions.IsAuthenticated]


class PaymentOptionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for PaymentOption lookup"""
    queryset = PaymentOption.objects.all()
    serializer_class = PaymentOptionSerializer
    permission_classes = [permissions.IsAuthenticated]
