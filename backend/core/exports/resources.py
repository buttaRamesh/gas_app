"""
Export Resources Configuration

Defines all exportable resources with their querysets, filters, serializers, and permissions.
"""
from rest_framework.permissions import IsAuthenticated
from django.db.models import Prefetch

from consumers.models import Consumer
from consumers.api.filters import ConsumerFilter
from consumers.api.serializers import ConsumerListSerializer
from commons.models import Address, Contact, Person
from connections.models import ConnectionDetails


def get_consumer_export_queryset(request):
    """
    Optimized queryset for exports - fetches only needed fields.
    """
    from django.db.models import Prefetch

    return Consumer.objects.only(
        'id',
        'consumer_number',
        'is_kyc_done',
        'category_id',
        'consumer_type_id',
        'person_content_type_id',
        'person_object_id',
    ).select_related(
        'category',
        'consumer_type',
    ).prefetch_related(
        # Note: person__addresses, person__contacts, person__identification
        # can't be prefetched through GenericForeignKey
        # They're loaded separately in bulk_loaders.py
        Prefetch(
            'connections',
            queryset=ConnectionDetails.objects.only('id', 'consumer_id')
        ),
    )


EXPORT_RESOURCES = {
    'consumers': {
        'queryset': get_consumer_export_queryset,
        'filterset_class': ConsumerFilter,
        'serializer_class': ConsumerListSerializer,

        # All fields from the serializer
        'allowed_fields': [
            'id',
            'consumer_number',
            'name',
            'mobile_number',
            'address_text',
            'street_road_name',
            'pin_code',
            'category',
            'consumer_type',
            'cylinders',
            'is_kyc_done',
            'ration_card_num',
            'aadhar_num',
            'pan_num',
            'email',
            'phone_number',
        ],

        'field_labels': {
            'id': 'ID',
            'consumer_number': 'Consumer Number',
            'name': 'Name',
            'mobile_number': 'Mobile Number',
            'address_text': 'Address',
            'street_road_name': 'Street/Road',
            'pin_code': 'PIN Code',
            'category': 'Category',
            'consumer_type': 'Consumer Type',
            'cylinders': 'Cylinders',
            'is_kyc_done': 'KYC Done',
            'ration_card_num': 'Ration Card',
            'aadhar_num': 'Aadhar',
            'pan_num': 'PAN',
            'email': 'Email',
            'phone_number': 'Phone Number',
        },

        'permission_classes': [IsAuthenticated],
        'ordering': ['id'],
        'use_raw_values': False,  # Use serializer
    },
}


def get_resource_config(resource_name: str) -> dict:
    """
    Get configuration for a resource

    Args:
        resource_name: Name of the resource (e.g., 'consumers', 'routes')

    Returns:
        Resource configuration dict

    Raises:
        KeyError: If resource not found
    """
    if resource_name not in EXPORT_RESOURCES:
        raise KeyError(f"Unknown resource: {resource_name}")

    return EXPORT_RESOURCES[resource_name]
