"""
Generic ordering mixin for Consumer-related viewsets.

This mixin adds support for ordering by related fields through GenericForeignKey,
such as person name, mobile number, and address fields.
"""
from django.db.models import (
    OuterRef, Subquery, CharField, Value, F,
    Q, Case, When
)
from django.db.models.functions import Coalesce, Concat
from django.contrib.contenttypes.models import ContentType

from commons.models import Person, Contact, Address


class ConsumerOrderingMixin:
    """
    Mixin to add ordering support for Consumer-related models.

    Adds annotations for related fields accessed via GenericForeignKey:
    - name: from Person.full_name
    - mobile_number: from Contact.mobile_number
    - street_road_name: from Address.street_road_name
    - pin_code: from Address.pin_code

    Also supports ordering by related model display names:
    - category: from category.name
    - consumer_type: from consumer_type.name

    Usage:
        class MyConsumerViewSet(ConsumerOrderingMixin, viewsets.ModelViewSet):
            queryset = Consumer.objects.all()
            ordering_fields = ['consumer_number', 'name', 'mobile_number', ...]
    """

    def get_queryset(self):
        """
        Override to add annotations for related fields.
        Call super() first if you need to add additional filtering.
        """
        queryset = super().get_queryset()

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

        # Add annotations
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
            # Add category and consumer_type names for sorting
            category_name=F('category__name'),
            consumer_type_name=F('consumer_type__name'),
        )

        return queryset
