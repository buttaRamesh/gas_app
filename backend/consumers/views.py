# File: consumers/views.py
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Consumer
from .serializers import (
    ConsumerListSerializer,
    ConsumerDetailSerializer,
    ConsumerCreateUpdateSerializer
)


class ConsumerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Consumer operations.
    
    Provides:
    - list: Get all consumers with pagination and filtering
    - retrieve: Get single consumer with full details
    - create: Create new consumer
    - update: Update consumer (PUT)
    - partial_update: Partial update consumer (PATCH)
    - destroy: Delete consumer
    
    Custom actions:
    - kyc_pending: Get consumers with pending KYC
    - by_route: Get consumers by route code
    - search: Advanced search
    """
    
    queryset = Consumer.objects.select_related(
        'category', 
        'consumer_type', 
        'bpl_type', 
        'dct_type', 
        'scheme'
    ).prefetch_related(
        'addresses', 
        'contacts'
    ).all()
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'consumer_type', 'opting_status', 'is_kyc_done', 'scheme']
    search_fields = ['consumer_number', 'consumer_name', 'ration_card_num', 'lpg_id']
    ordering_fields = ['consumer_number', 'consumer_name', 'id']
    ordering = ['consumer_number']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return ConsumerListSerializer
        elif self.action == 'retrieve':
            return ConsumerDetailSerializer
        else:  # create, update, partial_update
            return ConsumerCreateUpdateSerializer
    
    def get_queryset(self):
        """
        Optionally restricts the returned consumers,
        by filtering against query parameters in the URL.
        """
        queryset = super().get_queryset()
        
        # Example: Filter by KYC status from query params
        kyc_status = self.request.query_params.get('kyc_status', None)
        if kyc_status is not None:
            if kyc_status.lower() == 'true':
                queryset = queryset.filter(is_kyc_done=True)
            elif kyc_status.lower() == 'false':
                queryset = queryset.filter(is_kyc_done=False)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def kyc_pending(self, request):
        """
        Get all consumers with pending KYC.
        
        GET /api/consumers/kyc_pending/
        """
        queryset = self.get_queryset().filter(is_kyc_done=False)
        
        # Apply pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = ConsumerListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ConsumerListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_route(self, request):
        """
        Get consumers by route code.
        
        GET /api/consumers/by_route/?route_code=R001
        """
        route_code = request.query_params.get('route_code', None)
        
        if not route_code:
            return Response(
                {'error': 'route_code parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(
            route_assignment__route__area_code=route_code
        )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = ConsumerListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ConsumerListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def route(self, request, pk=None):
        """
        Get route assignment for a specific consumer.
        
        GET /api/consumers/{id}/route/
        """
        consumer = self.get_object()
        
        try:
            assignment = consumer.route_assignment
            return Response({
                'route_id': assignment.route.id,
                'route_code': assignment.route.area_code,
                'route_description': assignment.route.area_code_description
            })
        except:
            return Response(
                {'message': 'No route assigned to this consumer'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['patch'])
    def update_kyc_status(self, request, pk=None):
        """
        Update only the KYC status of a consumer.
        
        PATCH /api/consumers/{id}/update_kyc_status/
        Body: { "is_kyc_done": true }
        """
        consumer = self.get_object()
        is_kyc_done = request.data.get('is_kyc_done')
        
        if is_kyc_done is None:
            return Response(
                {'error': 'is_kyc_done field is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        consumer.is_kyc_done = is_kyc_done
        consumer.save()
        
        serializer = ConsumerDetailSerializer(consumer)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get consumer statistics.
        
        GET /api/consumers/statistics/
        """
        total = self.get_queryset().count()
        kyc_done = self.get_queryset().filter(is_kyc_done=True).count()
        kyc_pending = total - kyc_done
        
        by_status = {}
        for status_choice in Consumer.OptingStatus.choices:
            count = self.get_queryset().filter(opting_status=status_choice[0]).count()
            by_status[status_choice[1]] = count
        
        return Response({
            'total_consumers': total,
            'kyc_done': kyc_done,
            'kyc_pending': kyc_pending,
            'by_opting_status': by_status,
        })