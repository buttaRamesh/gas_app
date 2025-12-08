from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from authentication.permissions import HasResourcePermission
from routes.models import Route, RouteArea
from routes.api.serializers import (
    RouteListSerializer,
    RouteDetailSerializer,
    RouteCreateUpdateSerializer,
    RouteAreaSerializer,
    RouteConsumersSerializer,
)
from consumers.models import Consumer
from core.pagination.route_consumers_pagination import RouteConsumersPagination
class RouteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Route operations.

    Provides:
    - list: Get all routes with counts
    - retrieve: Get single route with full details
    - create: Create new route with areas
    - update: Update route
    - partial_update: Partial update route
    - destroy: Delete route

    Custom actions:
    - consumers: Get all consumers in this route
    - delivery_person: Get assigned delivery person
    - add_area: Add a new area to route
    - remove_area: Remove area from route
    - statistics: Get route statistics
    """

    queryset = Route.objects.prefetch_related('areas', 'consumer_assignments').all()
    # permission_classes = [IsAuthenticated, HasResourcePermission]
    resource_name = 'routes'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['area_code', 'area_code_description']
    ordering_fields = ['area_code', 'area_code_description']
    ordering = ['area_code']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return RouteListSerializer
        elif self.action == 'retrieve':
            return RouteDetailSerializer
        elif self.action == 'consumers':
            return RouteConsumersSerializer
        else:  # create, update, partial_update
            return RouteCreateUpdateSerializer

    def _get_route_consumers_queryset(self, route):
        """Get optimized queryset of consumers for this route"""
        consumer_ids = route.consumer_assignments.values_list('consumer_id', flat=True)
        return Consumer.objects.filter(id__in=consumer_ids).select_related('category', 'consumer_type').prefetch_related('person__contacts', 'person__addresses', 'connections')

    @action(detail=True, methods=['get'], url_path='consumers')
    def consumers(self, request, pk=None):
        """List all consumers assigned to this route"""
        route = self.get_object()
        queryset = self._get_route_consumers_queryset(route)
        paginator = RouteConsumersPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = RouteConsumersSerializer(route, context={'consumers': page or queryset})
        return paginator.get_paginated_response(serializer.data)

    @action(detail=True, methods=['get'])
    def delivery_person(self, request, pk=None):
        """
        Get delivery person assigned to this route.

        GET /api/routes/{id}/delivery_person/
        """
        route = self.get_object()

        try:
            assignment = route.delivery_assignment
            dp = assignment.delivery_person
            contact = dp.contacts.first()

            return Response({
                'id': dp.id,
                'name': dp.name,
                'mobile': contact.mobile_number if contact else None,
                'email': contact.email if contact else None,
                'total_routes': dp.route_assignments.count(),
            })
        except:
            return Response(
                {'message': 'No delivery person assigned to this route'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def add_area(self, request, pk=None):
        """
        Add a new area to this route.

        POST /api/routes/{id}/add_area/
        Body: { "area_name": "New Area" }
        """
        route = self.get_object()
        area_name = request.data.get('area_name')

        if not area_name:
            return Response(
                {'error': 'area_name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if area already exists
        if route.areas.filter(area_name=area_name).exists():
            return Response(
                {'error': 'Area already exists in this route'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create new area
        area = RouteArea.objects.create(route=route, area_name=area_name)

        return Response({
            'message': 'Area added successfully',
            'area': RouteAreaSerializer(area).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='remove_area/(?P<area_id>[^/.]+)')
    def remove_area(self, request, pk=None, area_id=None):
        """
        Remove an area from this route.

        DELETE /api/routes/{id}/remove_area/{area_id}/
        """
        route = self.get_object()

        try:
            area = route.areas.get(id=area_id)
            area_name = area.area_name
            area.delete()

            return Response({
                'message': f'Area "{area_name}" removed successfully'
            }, status=status.HTTP_200_OK)
        except RouteArea.DoesNotExist:
            return Response(
                {'error': 'Area not found in this route'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get route statistics.

        GET /api/routes/statistics/
        """
        total_routes = self.get_queryset().count()

        # Routes with delivery person assigned
        routes_with_dp = sum(1 for route in self.get_queryset() if hasattr(route, 'delivery_assignment'))

        # Routes with consumers
        routes_with_consumers = sum(1 for route in self.get_queryset() if route.consumer_assignments.exists())

        # Total consumers across all routes
        total_consumers = sum(route.consumer_assignments.count() for route in self.get_queryset())

        # Average consumers per route
        avg_consumers = total_consumers / total_routes if total_routes > 0 else 0

        return Response({
            'total_routes': total_routes,
            'routes_with_delivery_person': routes_with_dp,
            'routes_without_delivery_person': total_routes - routes_with_dp,
            'routes_with_consumers': routes_with_consumers,
            'total_consumers_assigned': total_consumers,
            'average_consumers_per_route': round(avg_consumers, 2),
        })

    @action(detail=False, methods=['get'])
    def unassigned_delivery(self, request):
        """
        Get routes without delivery person assigned.

        GET /api/routes/unassigned_delivery/
        """
        routes = []
        for route in self.get_queryset():
            if not hasattr(route, 'delivery_assignment'):
                routes.append({
                    'id': route.id,
                    'area_code': route.area_code,
                    'area_code_description': route.area_code_description,
                    'consumer_count': route.consumer_assignments.count(),
                })

        return Response({
            'count': len(routes),
            'routes': routes
        })
