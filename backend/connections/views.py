# File: connections/views.py
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count

from .models import ConnectionDetails
from .serializers import (
    ConnectionDetailsListSerializer,
    ConnectionDetailsSerializer,
    ConnectionDetailsCreateUpdateSerializer
)


class ConnectionDetailsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ConnectionDetails operations.

    Provides:
    - list: Get all connections with pagination and filtering
    - retrieve: Get single connection with full details
    - create: Create new connection
    - update: Update connection (PUT)
    - partial_update: Partial update connection (PATCH)
    - destroy: Delete connection

    Custom actions:
    - by_consumer: Get connections by consumer ID
    - by_connection_type: Get connections by connection type
    - statistics: Get connection statistics
    """

    queryset = ConnectionDetails.objects.select_related(
        'consumer',
        'connection_type',
        'product',
        'product__unit'
    ).all()

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['consumer', 'connection_type', 'product']
    search_fields = ['sv_number', 'consumer__consumer_name', 'consumer__consumer_number', 'hist_code_description']
    ordering_fields = ['sv_number', 'sv_date', 'id']
    ordering = ['-sv_date']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return ConnectionDetailsListSerializer
        elif self.action == 'retrieve':
            return ConnectionDetailsSerializer
        else:  # create, update, partial_update
            return ConnectionDetailsCreateUpdateSerializer

    @action(detail=False, methods=['get'], url_path='by-consumer/(?P<consumer_id>[^/.]+)')
    def by_consumer(self, request, consumer_id=None):
        """
        Get all connections for a specific consumer.

        Example: GET /api/connections/by-consumer/123/
        """
        connections = self.get_queryset().filter(consumer_id=consumer_id)
        serializer = ConnectionDetailsListSerializer(connections, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_connection_type(self, request):
        """
        Get connections filtered by connection type.

        Example: GET /api/connections/by_connection_type/?connection_type=1
        """
        connection_type_id = request.query_params.get('connection_type', None)
        if not connection_type_id:
            return Response(
                {"error": "connection_type parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        connections = self.get_queryset().filter(connection_type_id=connection_type_id)
        page = self.paginate_queryset(connections)
        if page is not None:
            serializer = ConnectionDetailsListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = ConnectionDetailsListSerializer(connections, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get connection statistics.

        Example: GET /api/connections/statistics/
        """
        stats = {
            'total_connections': ConnectionDetails.objects.count(),
            'by_connection_type': list(
                ConnectionDetails.objects.values('connection_type__name')
                .annotate(count=Count('id'))
                .order_by('-count')
            ),
            'by_product': list(
                ConnectionDetails.objects.values('product__variant_name', 'product__size')
                .annotate(count=Count('id'))
                .order_by('-count')
            ),
        }
        return Response(stats)
