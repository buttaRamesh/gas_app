"""
Consumer filtering for the Consumer API.

Provides comprehensive filtering capabilities for Consumer model including:
- Text search across consumer_number, person name, and mobile
- Exact and range filters for IDs
- Status and category filters
"""
from django_filters import rest_framework as filters
from django.db.models import Q
from django.contrib.contenttypes.models import ContentType

from consumers.models import Consumer
from commons.models import Person, Contact, Address


class ConsumerFilter(filters.FilterSet):
    """
    Filter for Consumer model supporting:
    - Text search across consumer_number, person name, and mobile
    - Exact and range filters for IDs
    - Status and category filters

    Note: Uses custom filter methods to handle GenericForeignKey relationships
    """

    # Search filters (partial match) - all use custom methods for GenericFK
    search = filters.CharFilter(method='search_filter', label='Search')
    consumer_number = filters.CharFilter(lookup_expr='icontains')
    name = filters.CharFilter(method='filter_by_name')
    first_name = filters.CharFilter(method='filter_by_first_name')
    last_name = filters.CharFilter(method='filter_by_last_name')
    mobile = filters.CharFilter(method='filter_by_mobile')

    # Exact match filters
    lpg_id = filters.NumberFilter()
    blue_book = filters.NumberFilter()

    # Foreign key filters
    category = filters.NumberFilter(field_name='category__id')
    consumer_type = filters.NumberFilter(field_name='consumer_type__id')
    bpl_type = filters.NumberFilter(field_name='bpl_type__id')
    dct_type = filters.NumberFilter(field_name='dct_type__id')
    scheme = filters.NumberFilter(field_name='scheme__id')

    # Status filters
    status = filters.ChoiceFilter(choices=Consumer.Status.choices)
    opting_status = filters.ChoiceFilter(choices=Consumer.OptingStatus.choices)
    is_kyc_done = filters.BooleanFilter()

    def filter_by_name(self, queryset, name, value):
        """Filter by person full_name (case-insensitive partial match)"""
        if not value:
            return queryset
        person_ids = Person.objects.filter(
            full_name__icontains=value
        ).values_list('id', flat=True)
        person_ct = ContentType.objects.get_for_model(Person)
        return queryset.filter(
            person_content_type=person_ct,
            person_object_id__in=person_ids
        )

    def filter_by_first_name(self, queryset, name, value):
        """Filter by person first_name (case-insensitive partial match)"""
        if not value:
            return queryset
        person_ids = Person.objects.filter(
            first_name__icontains=value
        ).values_list('id', flat=True)
        person_ct = ContentType.objects.get_for_model(Person)
        return queryset.filter(
            person_content_type=person_ct,
            person_object_id__in=person_ids
        )

    def filter_by_last_name(self, queryset, name, value):
        """Filter by person last_name (case-insensitive partial match)"""
        if not value:
            return queryset
        person_ids = Person.objects.filter(
            last_name__icontains=value
        ).values_list('id', flat=True)
        person_ct = ContentType.objects.get_for_model(Person)
        return queryset.filter(
            person_content_type=person_ct,
            person_object_id__in=person_ids
        )

    def filter_by_mobile(self, queryset, name, value):
        """Filter by mobile_number from person's contacts (case-insensitive partial match)"""
        if not value:
            return queryset
        # Get person IDs that have contacts with matching mobile numbers
        person_ct = ContentType.objects.get_for_model(Person)
        person_ids = Contact.objects.filter(
            content_type=person_ct,
            mobile_number__icontains=value
        ).values_list('object_id', flat=True)
        return queryset.filter(
            person_content_type=person_ct,
            person_object_id__in=person_ids
        )

    def search_filter(self, queryset, name, value):
        """
        Generic search across multiple fields:
        - consumer_number, lpg_id, blue_book
        - person: full_name, first_name, last_name
        - contact: mobile_number, phone_number, email
        - address: street, city, district, pin_code, landmark, address_text
        """
        if not value:
            return queryset

        # Get Person content type once
        person_ct = ContentType.objects.get_for_model(Person)

        # Search in Person names
        person_ids = Person.objects.filter(
            Q(full_name__icontains=value) |
            Q(first_name__icontains=value) |
            Q(last_name__icontains=value)
        ).values_list('id', flat=True)

        # Search in Contact fields (mobile, phone, email)
        contact_person_ids = Contact.objects.filter(
            content_type=person_ct
        ).filter(
            Q(mobile_number__icontains=value) |
            Q(phone_number__icontains=value) |
            Q(email__icontains=value)
        ).values_list('object_id', flat=True)

        # Search in Address fields
        address_person_ids = Address.objects.filter(
            content_type=person_ct
        ).filter(
            Q(address_text__icontains=value) |
            Q(street_road_name__icontains=value) |
            Q(city_town_village__icontains=value) |
            Q(district__icontains=value) |
            Q(pin_code__icontains=value) |
            Q(land_mark__icontains=value) |
            Q(house_no__icontains=value) |
            Q(house_name_flat_number__icontains=value) |
            Q(housing_complex_building__icontains=value)
        ).values_list('object_id', flat=True)

        # Combine person IDs from all sources
        all_person_ids = set(person_ids) | set(contact_person_ids) | set(address_person_ids)

        # Build the query
        query = Q(consumer_number__icontains=value)

        # Add person-based filters
        if all_person_ids:
            query |= Q(
                person_content_type=person_ct,
                person_object_id__in=all_person_ids
            )

        # Try to parse as number for lpg_id/blue_book
        try:
            numeric_value = int(value)
            query |= Q(lpg_id=numeric_value) | Q(blue_book=numeric_value)
        except ValueError:
            pass

        return queryset.filter(query).distinct()

    class Meta:
        model = Consumer
        fields = [
            'search',
            'consumer_number',
            'name',
            'first_name',
            'last_name',
            'mobile',
            'lpg_id',
            'blue_book',
            'category',
            'consumer_type',
            'bpl_type',
            'dct_type',
            'scheme',
            'status',
            'opting_status',
            'is_kyc_done',
        ]
