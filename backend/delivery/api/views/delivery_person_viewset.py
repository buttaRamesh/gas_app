# File: delivery/api/views/delivery_person_viewset.py
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action

from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Prefetch

from authentication.permissions import HasResourcePermission
from delivery.models import DeliveryPerson, DeliveryRouteAssignment
from delivery.api.serializers import (
    DeliveryPersonListSerializer,
    DeliveryPersonDetailSerializer,
    DeliveryPersonCreateUpdateSerializer,
    ConsumersListSerializer,
    BulkAssignmentSerializer,
)
from consumers.models import Consumer, ConsumerRouteAssignment
from core.pagination.delivery_consumers_pagination import DeliveryPersonConsumersPagination


class DeliveryPersonViewSet(viewsets.ModelViewSet):
    """
    ViewSet for DeliveryPerson operations.

    Provides:
    - list: Get all delivery persons with pagination and filtering
    - retrieve: Get single delivery person with full details
    - create: Create new delivery person
    - update: Update delivery person (PUT)
    - partial_update: Partial update delivery person (PATCH)
    - destroy: Delete delivery person

    No business logic - pure CRUD operations.
    Pagination is handled globally by REST_FRAMEWORK settings.

    NOTE: DeliveryPerson uses GenericForeignKey to Person, so we cannot use
    select_related('person'). The person object will be fetched when accessed
    via the generic relation. This is a limitation of GenericForeignKey.
    """

    queryset = DeliveryPerson.objects.prefetch_related(
        Prefetch(
            'route_assignments',
            queryset=DeliveryRouteAssignment.objects.select_related('route').prefetch_related('route__areas')
        )
    ).all()

    # permission_classes = [IsAuthenticated, HasResourcePermission]
    resource_name = 'delivery'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    # NOTE: Cannot search on GenericForeignKey fields (person__full_name, etc.)
    # Search must be done on direct DeliveryPerson fields only
    search_fields = ['id']
    ordering_fields = ['id']
    ordering = ['id']
    pagination_class = None  # Disable pagination - return all delivery persons

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return DeliveryPersonListSerializer
        elif self.action == 'retrieve':
            return DeliveryPersonDetailSerializer
        elif self.action == 'consumers':
            return ConsumersListSerializer
        else:  # create, update, partial_update
            return DeliveryPersonCreateUpdateSerializer

    def list(self, request, *args, **kwargs):
        """Override list to include statistics in response"""
        from rest_framework.response import Response
        from django.db.models import Count

        # Calculate statistics
        base_qs = DeliveryPerson.objects.all()
        total_delivery_persons = base_qs.count()

        assigned_delivery_persons = base_qs.filter(route_assignments__isnull=False).distinct().count()
        unassigned_delivery_persons = total_delivery_persons - assigned_delivery_persons

        total_routes = DeliveryRouteAssignment.objects.values('delivery_person').distinct().count()

        # Get all delivery persons
        delivery_persons_list = list(DeliveryPerson.objects.prefetch_related(
            Prefetch(
                'route_assignments',
                queryset=DeliveryRouteAssignment.objects.select_related('route').prefetch_related('route__areas')
            )
        ).all())

        # Serialize
        serializer = self.get_serializer(delivery_persons_list, many=True)

        return Response({
            'results': serializer.data,
            'count': len(serializer.data),
            'statistics': {
                'total_delivery_persons': total_delivery_persons,
                'assigned_delivery_persons': assigned_delivery_persons,
                'unassigned_delivery_persons': unassigned_delivery_persons,
                'total_routes': total_routes,
            }
        })

    def _get_consumers_queryset(self, delivery_person):
        """Get optimized queryset of consumers for delivery person's routes"""
        route_ids = delivery_person.route_assignments.values_list('route_id', flat=True)
        consumer_ids = ConsumerRouteAssignment.objects.filter(route_id__in=route_ids).values_list('consumer_id', flat=True)
        return Consumer.objects.filter(id__in=consumer_ids).select_related('category', 'consumer_type').prefetch_related('person__contacts', 'person__addresses', 'connections')

    @action(detail=True, methods=["get"], url_path="consumers")
    def consumers(self, request, pk=None):
        delivery_person = self.get_object()
        queryset = self._get_consumers_queryset(delivery_person)
        paginator = DeliveryPersonConsumersPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = ConsumersListSerializer(delivery_person, context={'consumers': page or queryset})
        return paginator.get_paginated_response(serializer.data)

    @action(detail=True, methods=['post'], url_path='assign-routes')
    def assign_routes(self, request, pk=None):
        """
        Bulk assign routes to delivery person.

        POST /api/delivery-persons/{id}/assign-routes/
        Body: { "routes": [1, 2, 3] }
        """
        from django.db import transaction
        from rest_framework.response import Response
        from rest_framework import status

        delivery_person = self.get_object()

        # Prepare data for BulkAssignmentSerializer
        data = {
            'delivery_person': delivery_person.id,
            'routes': request.data.get('routes', [])
        }

        serializer = BulkAssignmentSerializer(data=data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create assignments
        routes = serializer.validated_data['routes']
        assignments_created = []

        with transaction.atomic():
            for route in routes:
                assignment = DeliveryRouteAssignment.objects.create(
                    route=route,
                    delivery_person=delivery_person
                )
                assignments_created.append({
                    'route_id': route.id,
                    'route_code': route.area_code,
                    'route_description': route.area_code_description
                })

        return Response({
            'message': f'{len(assignments_created)} route(s) assigned successfully',
            'assignments': assignments_created
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='unassign-route/(?P<route_id>[^/.]+)')
    def unassign_route(self, request, pk=None, route_id=None):
        """
        Unassign a specific route from delivery person.

        DELETE /api/delivery-persons/{id}/unassign-route/{route_id}/
        """
        from rest_framework.response import Response
        from rest_framework import status
        from django.db import transaction

        delivery_person = self.get_object()

        try:
            assignment = DeliveryRouteAssignment.objects.get(
                delivery_person=delivery_person,
                route_id=route_id
            )

            route_code = assignment.route.area_code

            with transaction.atomic():
                assignment.delete()

            return Response({
                'message': f'Route {route_code} unassigned successfully'
            }, status=status.HTTP_200_OK)

        except DeliveryRouteAssignment.DoesNotExist:
            return Response(
                {'error': 'Route assignment not found for this delivery person'},
                status=status.HTTP_404_NOT_FOUND
            )

    def destroy(self, request, *args, **kwargs):
        """
        Delete delivery person and handle related records.
        Deletes route assignments and history before deleting delivery person.
        """
        from django.db import transaction
        from rest_framework.response import Response
        from rest_framework import status
        from delivery.models import DeliveryRouteAssignmentHistory

        delivery_person = self.get_object()

        with transaction.atomic():
            # Delete delivery route assignment history
            DeliveryRouteAssignmentHistory.objects.filter(delivery_person=delivery_person).delete()

            # Delete current route assignments
            DeliveryRouteAssignment.objects.filter(delivery_person=delivery_person).delete()

            # Delete the person associated with delivery person if exists
            if delivery_person.person:
                delivery_person.person.delete()

            # Finally delete the delivery person
            delivery_person.delete()

        return Response(
            {'message': 'Delivery person deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )

