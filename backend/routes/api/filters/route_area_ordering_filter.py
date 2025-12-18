"""
Generic ordering filter for RouteArea-related viewsets.

This filter adds support for ordering by related route fields.
"""
from rest_framework.filters import OrderingFilter
from django.db.models import OuterRef, Subquery, CharField, Value
from django.db.models.functions import Coalesce


class RouteAreaOrderingFilter(OrderingFilter):
    """
    Custom ordering filter for RouteArea models.

    Adds annotations for:
    - route_code: from route.area_code
    - route_description: from route.area_code_description

    Usage:
        class RouteAreaViewSet(viewsets.ModelViewSet):
            filter_backends = [DjangoFilterBackend, RouteAreaOrderingFilter]
            ordering_fields = [
                'id', 'area_name', 'route_code', 'route_description'
            ]
    """

    def filter_queryset(self, request, queryset, view):
        """
        Add annotations before applying ordering.
        """
        from routes.models import Route

        # Annotate with route code
        route_code_subquery = Route.objects.filter(
            id=OuterRef('route_id')
        ).values('area_code')[:1]

        # Annotate with route description
        route_description_subquery = Route.objects.filter(
            id=OuterRef('route_id')
        ).values('area_code_description')[:1]

        # Add annotations to queryset
        queryset = queryset.annotate(
            route_code=Coalesce(
                Subquery(route_code_subquery, output_field=CharField()),
                Value(''),
                output_field=CharField()
            ),
            route_description=Coalesce(
                Subquery(route_description_subquery, output_field=CharField()),
                Value(''),
                output_field=CharField()
            ),
        )

        # Get ordering from request
        ordering = self.get_ordering(request, queryset, view)

        if ordering:
            queryset = queryset.order_by(*ordering)

        return queryset
