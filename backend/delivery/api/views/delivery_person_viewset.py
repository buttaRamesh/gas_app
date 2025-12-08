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
        
     
