"""
Generic ordering filter for Route-related viewsets.

This filter adds support for ordering by related fields and annotated counts.
"""
from rest_framework.filters import OrderingFilter
from django.db.models import Count, OuterRef, Subquery, CharField, Value, IntegerField
from django.db.models.functions import Coalesce


class RouteOrderingFilter(OrderingFilter):
    """
    Custom ordering filter for Route models.

    Adds annotations for:
    - delivery_person_name: from delivery_assignment.delivery_person.person.full_name
    - area_count: count of areas
    - consumer_count: count of consumer_assignments

    Usage:
        class RouteViewSet(viewsets.ModelViewSet):
            filter_backends = [DjangoFilterBackend, RouteOrderingFilter]
            ordering_fields = [
                'area_code', 'area_code_description',
                'delivery_person_name', 'area_count', 'consumer_count'
            ]
    """

    def filter_queryset(self, request, queryset, view):
        """
        Add annotations before applying ordering.
        """
        # Get ordering from request FIRST
        ordering = self.get_ordering(request, queryset, view)

        # Only add expensive annotations if ordering is requested
        if ordering:
            from delivery.models import DeliveryPerson, DeliveryRouteAssignment
            from commons.models import Person

            # Step 1: Get delivery_person_id from DeliveryRouteAssignment
            queryset = queryset.annotate(
                dp_id=Subquery(
                    DeliveryRouteAssignment.objects.filter(
                        route_id=OuterRef('id')
                    ).values('delivery_person_id')[:1],
                    output_field=IntegerField()
                )
            )

            # Step 2: Get person_object_id from DeliveryPerson
            queryset = queryset.annotate(
                dp_person_id=Subquery(
                    DeliveryPerson.objects.filter(
                        id=OuterRef('dp_id')
                    ).values('person_object_id')[:1],
                    output_field=IntegerField()
                )
            )

            # Step 3: Get person full_name using the dp_person_id
            queryset = queryset.annotate(
                delivery_person_name=Coalesce(
                    Subquery(
                        Person.objects.filter(
                            id=OuterRef('dp_person_id')
                        ).values('full_name')[:1],
                        output_field=CharField()
                    ),
                    Value(''),
                    output_field=CharField()
                ),
                area_count=Count('areas', distinct=True),
                consumer_count=Count('consumer_assignments', distinct=True),
            )

            queryset = queryset.order_by(*ordering)

        return queryset
