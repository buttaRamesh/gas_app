# File: address/views.py
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count

from .models import Address, Contact
from .serializers import (
    AddressSerializer,
    AddressListSerializer,
    ContactSerializer,
    ContactListSerializer
)
from .utils import get_content_type_for_model, get_all_content_types


class AddressViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Address operations.

    Provides:
    - list: Get all addresses with pagination and filtering
    - retrieve: Get single address with full details
    - create: Create new address
    - update: Update address (PUT)
    - partial_update: Partial update address (PATCH)
    - destroy: Delete address

    Filtering:
    - By content_type, city, district, pin_code

    Search:
    - By address text, street name, city, landmark
    """

    queryset = Address.objects.select_related('content_type').all()

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['content_type', 'city_town_village', 'district', 'pin_code']
    search_fields = ['address_text', 'street_road_name', 'city_town_village', 'land_mark', 'house_no']
    ordering_fields = ['id', 'city_town_village', 'district', 'pin_code']
    ordering = ['-id']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return AddressListSerializer
        else:
            return AddressSerializer

    def get_queryset(self):
        """
        Optionally restricts the returned addresses,
        by filtering against query parameters in the URL.
        """
        queryset = super().get_queryset()

        # Filter by object_id if provided
        object_id = self.request.query_params.get('object_id', None)
        if object_id:
            queryset = queryset.filter(object_id=object_id)

        # Filter by content type model name
        content_type_model = self.request.query_params.get('content_type_model', None)
        if content_type_model:
            queryset = queryset.filter(content_type__model=content_type_model)

        return queryset

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get address statistics.
        Returns counts by city, district, and total addresses.
        """
        total_addresses = self.get_queryset().count()

        # Count by city
        by_city = self.get_queryset().values('city_town_village').annotate(
            count=Count('id')
        ).order_by('-count')[:10]

        # Count by district
        by_district = self.get_queryset().values('district').annotate(
            count=Count('id')
        ).order_by('-count')[:10]

        # Count by pin code
        by_pincode = self.get_queryset().values('pin_code').annotate(
            count=Count('id')
        ).order_by('-count')[:10]

        return Response({
            'total_addresses': total_addresses,
            'by_city': list(by_city),
            'by_district': list(by_district),
            'by_pincode': list(by_pincode),
        })


class ContactViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Contact operations.

    Provides:
    - list: Get all contacts with pagination and filtering
    - retrieve: Get single contact with full details
    - create: Create new contact
    - update: Update contact (PUT)
    - partial_update: Partial update contact (PATCH)
    - destroy: Delete contact

    Filtering:
    - By content_type

    Search:
    - By email, mobile number, phone number
    """

    queryset = Contact.objects.select_related('content_type').all()

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['content_type']
    search_fields = ['email', 'mobile_number', 'phone_number']
    ordering_fields = ['id', 'email']
    ordering = ['-id']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return ContactListSerializer
        else:
            return ContactSerializer

    def get_queryset(self):
        """
        Optionally restricts the returned contacts,
        by filtering against query parameters in the URL.
        """
        queryset = super().get_queryset()

        # Filter by object_id if provided
        object_id = self.request.query_params.get('object_id', None)
        if object_id:
            queryset = queryset.filter(object_id=object_id)

        # Filter by content type model name
        content_type_model = self.request.query_params.get('content_type_model', None)
        if content_type_model:
            queryset = queryset.filter(content_type__model=content_type_model)

        return queryset

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get contact statistics.
        Returns total contacts and breakdown by content type.
        """
        total_contacts = self.get_queryset().count()

        # Contacts with email
        with_email = self.get_queryset().exclude(email__isnull=True).exclude(email='').count()

        # Contacts with mobile
        with_mobile = self.get_queryset().exclude(mobile_number__isnull=True).exclude(mobile_number='').count()

        # Contacts with phone
        with_phone = self.get_queryset().exclude(phone_number__isnull=True).exclude(phone_number='').count()

        # Count by content type
        by_content_type = self.get_queryset().values('content_type__model').annotate(
            count=Count('id')
        ).order_by('-count')

        return Response({
            'total_contacts': total_contacts,
            'with_email': with_email,
            'with_mobile': with_mobile,
            'with_phone': with_phone,
            'by_content_type': list(by_content_type),
        })


@api_view(['GET'])
def get_content_types(request):
    """
    Get all content types or specific content type by model name.

    Query Parameters:
    - model: Filter by model name (e.g., 'consumer', 'deliveryperson')

    Returns:
    - List of content types or single content type details
    """
    model_name = request.query_params.get('model', None)

    if model_name:
        try:
            content_type_id = get_content_type_for_model(model_name)
            return Response({
                'model': model_name.lower(),
                'content_type_id': content_type_id
            })
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )

    # Return all content types
    all_content_types = get_all_content_types()
    return Response(all_content_types)
