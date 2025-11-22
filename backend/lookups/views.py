from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from authentication.permissions import HasResourcePermission
from .models import DCTType, MarketType, ConnectionType, ConsumerCategory, ConsumerType, BPLType
from .serializers import (
    DCTTypeSerializer,
    MarketTypeSerializer,
    ConnectionTypeSerializer,
    ConsumerCategorySerializer,
    ConsumerTypeSerializer,
    BPLTypeSerializer
)


class DCTTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for DCT Type operations.
    Provides full CRUD operations.
    """
    queryset = DCTType.objects.all()
    serializer_class = DCTTypeSerializer
    permission_classes = [IsAuthenticated, HasResourcePermission]
    resource_name = 'lookups'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'id']
    ordering = ['name']


class MarketTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Market Type operations.
    Provides full CRUD operations.
    """
    queryset = MarketType.objects.all()
    serializer_class = MarketTypeSerializer
    permission_classes = [IsAuthenticated, HasResourcePermission]
    resource_name = 'lookups'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'id']
    ordering = ['name']


class ConnectionTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Connection Type operations.
    Provides full CRUD operations.
    """
    queryset = ConnectionType.objects.all()
    serializer_class = ConnectionTypeSerializer
    permission_classes = [IsAuthenticated, HasResourcePermission]
    resource_name = 'lookups'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'id']
    ordering = ['name']


class ConsumerCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Consumer Category operations.
    Provides full CRUD operations.
    """
    queryset = ConsumerCategory.objects.all()
    serializer_class = ConsumerCategorySerializer
    permission_classes = [IsAuthenticated, HasResourcePermission]
    resource_name = 'lookups'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'id']
    ordering = ['name']


class ConsumerTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Consumer Type operations.
    Provides full CRUD operations.
    """
    queryset = ConsumerType.objects.all()
    serializer_class = ConsumerTypeSerializer
    permission_classes = [IsAuthenticated, HasResourcePermission]
    resource_name = 'lookups'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'id']
    ordering = ['name']


class BPLTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for BPL Type operations.
    Provides full CRUD operations.
    """
    queryset = BPLType.objects.all()
    serializer_class = BPLTypeSerializer
    permission_classes = [IsAuthenticated, HasResourcePermission]
    resource_name = 'lookups'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'id']
    ordering = ['name']
