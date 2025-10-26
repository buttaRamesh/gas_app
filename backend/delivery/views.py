# File: delivery/views.py
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count

from .models import DeliveryPerson, DeliveryRouteAssignment
from .serializers import (
    DeliveryPersonListSerializer,
    DeliveryPersonDetailSerializer,
    DeliveryPersonCreateUpdateSerializer,
    DeliveryRouteAssignmentSerializer,
    DeliveryRouteAssignmentCreateUpdateSerializer,
    DeliveryRouteAssignmentDetailSerializer,
    BulkAssignmentSerializer,
)


class DeliveryPersonViewSet(viewsets.ModelViewSet):
    """
    ViewSet for DeliveryPerson operations.
    
    Provides:
    - list: Get all delivery persons
    - retrieve: Get single delivery person with routes
    - create: Create new delivery person
    - update: Update delivery person
    - partial_update: Partial update
    - destroy: Delete delivery person
    
    Custom actions:
    - assigned_routes: Get all routes assigned to person
    - consumers: Get all consumers in assigned routes
    - unassigned: Get delivery persons without routes
    - statistics: Get delivery statistics
    """
    
    queryset = DeliveryPerson.objects.prefetch_related('contacts', 'route_assignments').all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'contacts__mobile_number']
    ordering_fields = ['name', 'id']
    ordering = ['name']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return DeliveryPersonListSerializer
        elif self.action == 'retrieve':
            return DeliveryPersonDetailSerializer
        else:  # create, update, partial_update
            return DeliveryPersonCreateUpdateSerializer
    
    @action(detail=True, methods=['get'])
    def assigned_routes(self, request, pk=None):
        """
        Get all routes assigned to this delivery person.
        
        GET /api/delivery-persons/{id}/assigned_routes/
        """
        delivery_person = self.get_object()
        assignments = delivery_person.route_assignments.select_related('route').all()
        
        routes_data = []
        for assignment in assignments:
            route = assignment.route
            routes_data.append({
                'route_id': route.id,
                'route_code': route.area_code,
                'route_description': route.area_code_description,
                'areas': [area.area_name for area in route.areas.all()],
                'consumer_count': route.consumer_assignments.count(),
            })
        
        return Response({
            'delivery_person': delivery_person.name,
            'total_routes': len(routes_data),
            'routes': routes_data
        })
    
    @action(detail=True, methods=['get'])
    def consumers(self, request, pk=None):
        """
        Get all consumers in routes assigned to this delivery person.
        
        GET /api/delivery-persons/{id}/consumers/
        """
        delivery_person = self.get_object()
        
        consumers_data = []
        for assignment in delivery_person.route_assignments.select_related('route').all():
            route = assignment.route
            
            for consumer_assignment in route.consumer_assignments.select_related('consumer').all():
                consumer = consumer_assignment.consumer
                contact = consumer.contacts.first()
                address = consumer.addresses.first()
                
                consumers_data.append({
                    'consumer_id': consumer.id,
                    'consumer_number': consumer.consumer_number,
                    'consumer_name': consumer.consumer_name,
                    'mobile': contact.mobile_number if contact else None,
                    'address': address.address_text if address else None,
                    'route_code': route.area_code,
                    'is_kyc_done': consumer.is_kyc_done,
                })
        
        return Response({
            'delivery_person': delivery_person.name,
            'total_consumers': len(consumers_data),
            'consumers': consumers_data
        })
    
    @action(detail=False, methods=['get'])
    def unassigned(self, request):
        """
        Get delivery persons without any route assignments.
        
        GET /api/delivery-persons/unassigned/
        """
        # Get delivery persons with no route assignments
        unassigned = []
        for dp in self.get_queryset():
            if dp.route_assignments.count() == 0:
                contact = dp.contacts.first()
                unassigned.append({
                    'id': dp.id,
                    'name': dp.name,
                    'mobile': contact.mobile_number if contact else None,
                })
        
        return Response({
            'count': len(unassigned),
            'delivery_persons': unassigned
        })
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get delivery person statistics.
        
        GET /api/delivery-persons/statistics/
        """
        total_delivery_persons = self.get_queryset().count()
        
        # Count those with assignments
        with_assignments = sum(1 for dp in self.get_queryset() if dp.route_assignments.exists())
        without_assignments = total_delivery_persons - with_assignments
        
        # Total routes assigned
        total_routes_assigned = DeliveryRouteAssignment.objects.count()
        
        # Average routes per person (only those with assignments)
        avg_routes = total_routes_assigned / with_assignments if with_assignments > 0 else 0
        
        # Get top performers (most routes)
        top_performers = []
        for dp in self.get_queryset():
            route_count = dp.route_assignments.count()
            if route_count > 0:
                top_performers.append({
                    'name': dp.name,
                    'routes_assigned': route_count,
                    'total_consumers': sum(
                        assignment.route.consumer_assignments.count() 
                        for assignment in dp.route_assignments.all()
                    )
                })
        
        # Sort by routes assigned
        top_performers.sort(key=lambda x: x['routes_assigned'], reverse=True)
        
        return Response({
            'total_delivery_persons': total_delivery_persons,
            'with_route_assignments': with_assignments,
            'without_route_assignments': without_assignments,
            'total_routes_assigned': total_routes_assigned,
            'average_routes_per_person': round(avg_routes, 2),
            'top_performers': top_performers[:5],  # Top 5
        })


class DeliveryRouteAssignmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for DeliveryRouteAssignment operations.
    Manage route assignments to delivery persons.
    """
    
    queryset = DeliveryRouteAssignment.objects.select_related(
        'route', 'delivery_person'
    ).all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['delivery_person', 'route']
    search_fields = ['delivery_person__name', 'route__area_code']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return DeliveryRouteAssignmentDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return DeliveryRouteAssignmentCreateUpdateSerializer
        else:
            return DeliveryRouteAssignmentSerializer
    
    @action(detail=False, methods=['post'])
    def bulk_assign(self, request):
        """
        Bulk assign multiple routes to a delivery person.
        
        POST /api/delivery-route-assignments/bulk_assign/
        Body: {
            "delivery_person": 1,
            "routes": [1, 2, 3]
        }
        """
        serializer = BulkAssignmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        delivery_person = serializer.validated_data['delivery_person']
        routes = serializer.validated_data['routes']
        
        # Create assignments
        created_assignments = []
        for route in routes:
            assignment = DeliveryRouteAssignment.objects.create(
                route=route,
                delivery_person=delivery_person
            )
            created_assignments.append({
                'route_code': route.area_code,
                'route_description': route.area_code_description,
            })
        
        return Response({
            'message': f'Successfully assigned {len(routes)} routes to {delivery_person.name}',
            'assignments': created_assignments
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def reassign(self, request):
        """
        Reassign a route from one delivery person to another.
        
        POST /api/delivery-route-assignments/reassign/
        Body: {
            "route": 1,
            "new_delivery_person": 2
        }
        """
        route_id = request.data.get('route')
        new_dp_id = request.data.get('new_delivery_person')
        
        if not route_id or not new_dp_id:
            return Response({
                'error': 'route and new_delivery_person are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from routes.models import Route
            route = Route.objects.get(pk=route_id)
            new_dp = DeliveryPerson.objects.get(pk=new_dp_id)
            
            # Get current assignment
            try:
                assignment = DeliveryRouteAssignment.objects.get(route=route)
                old_dp_name = assignment.delivery_person.name
                
                # Update assignment
                assignment.delivery_person = new_dp
                assignment.save()
                
                return Response({
                    'message': f'Route {route.area_code} reassigned from {old_dp_name} to {new_dp.name}',
                    'route': route.area_code,
                    'previous_delivery_person': old_dp_name,
                    'new_delivery_person': new_dp.name,
                })
            except DeliveryRouteAssignment.DoesNotExist:
                return Response({
                    'error': 'Route is not currently assigned to any delivery person'
                }, status=status.HTTP_404_NOT_FOUND)
                
        except (Route.DoesNotExist, DeliveryPerson.DoesNotExist) as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['delete'])
    def unassign_route(self, request):
        """
        Remove route assignment (unassign route from delivery person).
        
        DELETE /api/delivery-route-assignments/unassign_route/
        Query params: ?route=1
        """
        route_id = request.query_params.get('route')
        
        if not route_id:
            return Response({
                'error': 'route parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            assignment = DeliveryRouteAssignment.objects.get(route_id=route_id)
            route_code = assignment.route.area_code
            dp_name = assignment.delivery_person.name
            
            assignment.delete()
            
            return Response({
                'message': f'Route {route_code} unassigned from {dp_name}'
            })
        except DeliveryRouteAssignment.DoesNotExist:
            return Response({
                'error': 'Route assignment not found'
            }, status=status.HTTP_404_NOT_FOUND)