"""
Generic ordering filter for Consumer-related viewsets.

This filter adds support for ordering by related fields through GenericForeignKey,
such as person name, mobile number, and address fields.
"""
from rest_framework.filters import OrderingFilter
from django.db.models import (
    OuterRef, Subquery, CharField, Value, F, Count, IntegerField
)
from django.db.models.functions import Coalesce
from django.contrib.contenttypes.models import ContentType

from commons.models import Person, Contact, Address
from connections.models import ConnectionDetails


class ConsumerOrderingFilter(OrderingFilter):
    """
    Custom ordering filter for Consumer models.

    Adds annotations for related fields accessed via GenericForeignKey:
    - name: from Person.full_name
    - mobile_number: from Contact.mobile_number
    - street_road_name: from Address.street_road_name
    - pin_code: from Address.pin_code
    - cylinders: count of connections

    Also supports ordering by related model display names:
    - category: from category.name
    - consumer_type: from consumer_type.name

    Usage:
        class ConsumerViewSet(viewsets.ModelViewSet):
            filter_backends = [DjangoFilterBackend, ConsumerOrderingFilter]
            ordering_fields = [
                'consumer_number', 'name', 'mobile_number',
                'street_road_name', 'pin_code', 'category',
                'consumer_type', 'cylinders', 'is_kyc_done'
            ]
    """

    def filter_queryset(self, request, queryset, view):
        """
        Add annotations before applying ordering.
        """
        # Get Person content type once for reuse
        person_ct = ContentType.objects.get_for_model(Person)

        # Annotate with person's full_name
        person_name_subquery = Person.objects.filter(
            id=OuterRef('person_object_id')
        ).values('full_name')[:1]

        # Annotate with primary mobile number
        mobile_subquery = Contact.objects.filter(
            content_type=person_ct,
            object_id=OuterRef('person_object_id')
        ).order_by('id').values('mobile_number')[:1]

        # Annotate with primary street/road name
        street_subquery = Address.objects.filter(
            content_type=person_ct,
            object_id=OuterRef('person_object_id')
        ).order_by('id').values('street_road_name')[:1]

        # Annotate with primary pin code
        pin_subquery = Address.objects.filter(
            content_type=person_ct,
            object_id=OuterRef('person_object_id')
        ).order_by('id').values('pin_code')[:1]

        # Add annotations to queryset
        queryset = queryset.annotate(
            name=Coalesce(
                Subquery(person_name_subquery, output_field=CharField()),
                Value(''),
                output_field=CharField()
            ),
            mobile_number=Coalesce(
                Subquery(mobile_subquery, output_field=CharField()),
                Value(''),
                output_field=CharField()
            ),
            street_road_name=Coalesce(
                Subquery(street_subquery, output_field=CharField()),
                Value(''),
                output_field=CharField()
            ),
            pin_code=Coalesce(
                Subquery(pin_subquery, output_field=CharField()),
                Value(''),
                output_field=CharField()
            ),
        )

        # Get ordering from request
        ordering = self.get_ordering(request, queryset, view)

        if ordering:
            # Separate cylinders ordering from other orderings
            # cylinders will be handled in-memory after fetching
            db_ordering = []

            for field in ordering:
                if field == 'cylinders' or field == '-cylinders':
                    # Skip cylinders - will be handled in viewset
                    continue
                elif field == 'category':
                    db_ordering.append('category__name')
                elif field == '-category':
                    db_ordering.append('-category__name')
                elif field == 'consumer_type':
                    db_ordering.append('consumer_type__name')
                elif field == '-consumer_type':
                    db_ordering.append('-consumer_type__name')
                else:
                    db_ordering.append(field)

            # Apply database-level ordering (excluding cylinders)
            if db_ordering:
                queryset = queryset.order_by(*db_ordering)

        return queryset
