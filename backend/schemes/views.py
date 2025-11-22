from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Scheme, SubsidyDetails
from .serializers import SchemeSerializer, SubsidyDetailsSerializer


class SchemeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Scheme operations.
    Provides full CRUD operations.
    """
    queryset = Scheme.objects.all()
    serializer_class = SchemeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'id']
    ordering = ['name']


class SubsidyDetailsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Subsidy Details operations.
    Provides full CRUD operations.
    """
    queryset = SubsidyDetails.objects.all()
    serializer_class = SubsidyDetailsSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['year']
    ordering_fields = ['year', 'id']
    ordering = ['-year']
