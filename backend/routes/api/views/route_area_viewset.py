from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from authentication.permissions import HasResourcePermission
from routes.models import Route, RouteArea
from routes.api.serializers import (
    RouteAreaSerializer,
    RouteAreaDetailSerializer,
    RouteAreaCreateUpdateSerializer,
    BulkRouteAreaCreateSerializer,
)


class RouteAreaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for RouteArea operations.

    List endpoint shows ALL areas by default (assigned + unassigned).
    Use query params to filter:
    - ?assigned=true  -> Only areas with routes
    - ?assigned=false -> Only areas without routes
    - ?route=1        -> Areas for specific route
    - ?page_size=10   -> Number of items per page (default: 10)
    """

    queryset = RouteArea.objects.select_related('route').all()
    permission_classes = [IsAuthenticated, HasResourcePermission]
    resource_name = 'route_areas'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['route']
    search_fields = ['area_name', 'route__area_code']
    ordering_fields = ['area_name', 'id']
    ordering = ['area_name']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return RouteAreaDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return RouteAreaCreateUpdateSerializer
        else:
            return RouteAreaSerializer

    def get_queryset(self):
        """
        Filter queryset based on 'assigned' query parameter.
        By default, shows ALL areas.
        """
        queryset = super().get_queryset()

        # Check for 'assigned' query parameter
        assigned = self.request.query_params.get('assigned', None)

        if assigned is not None:
            if assigned.lower() == 'true':
                # Only assigned areas (route is not null)
                queryset = queryset.filter(route__isnull=False)
            elif assigned.lower() == 'false':
                # Only unassigned areas (route is null)
                queryset = queryset.filter(route__isnull=True)

        # Default: return all areas (no filtering)
        return queryset

    def paginate_queryset(self, queryset):
        """
        Override pagination to allow custom page_size via query param.
        Default page_size is 10.
        """
        # Get page_size from query params, default to 10
        page_size = self.request.query_params.get('page_size', 10)

        try:
            page_size = int(page_size)
            # Limit maximum page_size to 100
            if page_size > 100:
                page_size = 100
            elif page_size < 1:
                page_size = 10
        except (ValueError, TypeError):
            page_size = 10

        # Set page size on paginator
        if self.paginator:
            self.paginator.page_size = page_size

        return super().paginate_queryset(queryset)

    def destroy(self, request, *args, **kwargs):
        """Override destroy to provide custom response message"""
        instance = self.get_object()
        area_name = instance.area_name
        route_code = instance.route.area_code if instance.route else "Unassigned"

        self.perform_destroy(instance)

        return Response({
            'message': f'Area "{area_name}" (Route: {route_code}) deleted successfully'
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        Create multiple areas for a route at once.

        POST /api/route-areas/bulk_create/
        Body: {
            "route": 1,
            "area_names": ["Area 1", "Area 2", "Area 3"]
        }
        """
        serializer = BulkRouteAreaCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        route = serializer.validated_data['route']
        area_names = serializer.validated_data['area_names']

        # Create all areas
        created_areas = []
        for area_name in area_names:
            area = RouteArea.objects.create(route=route, area_name=area_name)
            created_areas.append({
                'id': area.id,
                'area_name': area.area_name,
            })

        return Response({
            'message': f'Successfully created {len(created_areas)} areas for route {route.area_code}',
            'route_code': route.area_code,
            'route_id': route.id,
            'areas': created_areas
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['delete'])
    def bulk_delete(self, request):
        """
        Delete multiple areas at once.

        DELETE /api/route-areas/bulk_delete/
        Body: {
            "area_ids": [1, 2, 3]
        }
        """
        area_ids = request.data.get('area_ids', [])

        if not area_ids:
            return Response({
                'error': 'area_ids list is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        areas = RouteArea.objects.filter(id__in=area_ids)
        count = areas.count()

        if count == 0:
            return Response({
                'error': 'No areas found with provided IDs'
            }, status=status.HTTP_404_NOT_FOUND)

        # Get area details before deletion
        deleted_areas = [{
            'id': area.id,
            'area_name': area.area_name,
            'route_code': area.route.area_code if area.route else 'Unassigned'
        } for area in areas]

        areas.delete()

        return Response({
            'message': f'Successfully deleted {count} area(s)',
            'deleted_areas': deleted_areas
        })

    @action(detail=True, methods=['post'])
    def assign_to_route(self, request, pk=None):
        """
        Assign an unassigned area to a route.

        POST /api/route-areas/{id}/assign_to_route/
        Body: {
            "route": 1
        }
        """
        area = self.get_object()
        route_id = request.data.get('route')

        if not route_id:
            return Response({
                'error': 'route ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            route = Route.objects.get(pk=route_id)

            # Check if area name already exists in target route
            if RouteArea.objects.filter(route=route, area_name=area.area_name).exclude(pk=area.pk).exists():
                return Response({
                    'error': f'An area named "{area.area_name}" already exists in route {route.area_code}'
                }, status=status.HTTP_400_BAD_REQUEST)

            area.route = route
            area.save()

            serializer = RouteAreaSerializer(area)
            return Response({
                'message': f'Area "{area.area_name}" assigned to route {route.area_code}',
                'area': serializer.data
            })
        except Route.DoesNotExist:
            return Response({
                'error': 'Route not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def unassign_from_route(self, request, pk=None):
        """
        Unassign an area from its route (make it unassigned).

        POST /api/route-areas/{id}/unassign_from_route/
        """
        area = self.get_object()

        if not area.route:
            return Response({
                'error': 'Area is already unassigned'
            }, status=status.HTTP_400_BAD_REQUEST)

        old_route_code = area.route.area_code
        area.route = None
        area.save()

        serializer = RouteAreaSerializer(area)
        return Response({
            'message': f'Area "{area.area_name}" unassigned from route {old_route_code}',
            'area': serializer.data
        })

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get route area statistics.

        GET /api/route-areas/statistics/
        """
        total_areas = self.get_queryset().count()

        # Areas with and without routes
        areas_with_route = self.get_queryset().filter(route__isnull=False).count()
        areas_without_route = self.get_queryset().filter(route__isnull=True).count()

        # Route statistics
        total_routes = Route.objects.count()
        routes_with_areas = Route.objects.filter(areas__isnull=False).distinct().count()
        routes_without_areas = total_routes - routes_with_areas

        # Average areas per route (only counting routes with areas)
        avg_areas = areas_with_route / routes_with_areas if routes_with_areas > 0 else 0

        # Top routes by area count
        top_routes = Route.objects.annotate(
            area_count=Count('areas')
        ).filter(area_count__gt=0).order_by('-area_count')[:5]

        top_routes_data = [{
            'route_code': route.area_code,
            'route_description': route.area_code_description,
            'area_count': route.area_count
        } for route in top_routes]

        return Response({
            'total_areas': total_areas,
            'areas_assigned': areas_with_route,
            'areas_unassigned': areas_without_route,
            'total_routes': total_routes,
            'routes_with_areas': routes_with_areas,
            'routes_without_areas': routes_without_areas,
            'average_areas_per_route': round(avg_areas, 2),
            'top_routes_by_areas': top_routes_data
        })
