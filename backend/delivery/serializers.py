# File: delivery/serializers.py
from rest_framework import serializers
from .models import DeliveryPerson, DeliveryRouteAssignment
from routes.models import Route

class DeliveryPersonListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for delivery person list views.
    Shows basic info with assignment counts.
    """
    assigned_routes_count = serializers.SerializerMethodField()
    total_consumers = serializers.SerializerMethodField()
    mobile_number = serializers.SerializerMethodField()
    
    class Meta:
        model = DeliveryPerson
        fields = [
            'id',
            'name',
            'mobile_number',
            'assigned_routes_count',
            'total_consumers',
        ]
    
    def get_assigned_routes_count(self, obj):
        """Get number of routes assigned to this delivery person"""
        print('dp assignments ',obj.route_assignments)
        return obj.route_assignments.count()
    
    def get_total_consumers(self, obj):
        """Get total number of consumers across all assigned routes"""
        total = 0
        for assignment in obj.route_assignments.select_related('route').all():
            total += assignment.route.consumer_assignments.count()
        return total
    
    def get_mobile_number(self, obj):
        """Get primary mobile number"""
        contact = obj.contacts.first()
        return contact.mobile_number if contact else None


class DeliveryPersonDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for single delivery person view.
    Includes all contacts and assigned routes.
    """
    contacts = serializers.SerializerMethodField()
    assigned_routes = serializers.SerializerMethodField()
    assigned_routes_count = serializers.SerializerMethodField()
    total_consumers = serializers.SerializerMethodField()
    
    class Meta:
        model = DeliveryPerson
        fields = [
            'id',
            'name',
            'contacts',
            'assigned_routes_count',
            'assigned_routes',
            'total_consumers',
        ]
    
    def get_contacts(self, obj):
        """Get all contacts for this delivery person"""
        contacts = obj.contacts.all()
        return [{
            'id': contact.id,
            'email': contact.email,
            'mobile_number': contact.mobile_number,
            'phone_number': contact.phone_number,
        } for contact in contacts]
    
    def get_assigned_routes_count(self, obj):
        return obj.route_assignments.count()
    
    def get_assigned_routes(self, obj):
        """Get all routes assigned to this delivery person"""
        assignments = obj.route_assignments.select_related('route').all()
        
        routes_data = []
        for assignment in assignments:
            route = assignment.route
            routes_data.append({
                'route_id': route.id,
                'route_code': route.area_code,
                'route_description': route.area_code_description,
                'consumer_count': route.consumer_assignments.count(),
                'areas': [area.area_name for area in route.areas.all()],
            })
        
        return routes_data
    
    def get_total_consumers(self, obj):
        """Get total number of consumers across all assigned routes"""
        total = 0
        for assignment in obj.route_assignments.select_related('route').all():
            total += assignment.route.consumer_assignments.count()
        return total


class DeliveryPersonCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating delivery persons.
    """
    class Meta:
        model = DeliveryPerson
        fields = ['name']
    
    def validate_name(self, value):
        """Basic validation for name"""
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long.")
        return value.strip()


class DeliveryRouteAssignmentSerializer(serializers.ModelSerializer):
    """
    Serializer for route assignments.
    Shows basic assignment info.
    """
    delivery_person_name = serializers.CharField(source='delivery_person.name', read_only=True)
    route_code = serializers.CharField(source='route.area_code', read_only=True)
    route_description = serializers.CharField(source='route.area_code_description', read_only=True)
    consumer_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DeliveryRouteAssignment
        fields = [
            'route',
            'route_code',
            'route_description',
            'delivery_person',
            'delivery_person_name',
            'consumer_count',
        ]
    
    def get_consumer_count(self, obj):
        """Get number of consumers in this route"""
        return obj.route.consumer_assignments.count()


class DeliveryRouteAssignmentCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating/updating route assignments.
    """
    class Meta:
        model = DeliveryRouteAssignment
        fields = ['route', 'delivery_person']
    
    def validate(self, data):
        """
        Validate that route is not already assigned to another delivery person.
        """

        print('data.. ',data)
        route = data.get('route')
        delivery_person = data.get('delivery_person')
        
        # Check if this is an update
        if self.instance:
            # If route is being changed, check if new route is available
            if route != self.instance.route:
                if DeliveryRouteAssignment.objects.filter(route=route).exists():
                    raise serializers.ValidationError({
                        'route': 'This route is already assigned to another delivery person.'
                    })
        else:
            # For new assignments, check if route is already assigned
            if DeliveryRouteAssignment.objects.filter(route=route).exists():
                raise serializers.ValidationError({
                    'route': 'This route is already assigned to another delivery person.'
                })
        
        return data
    
    def create(self, validated_data):
        """Create assignment and log history"""
        assignment = DeliveryRouteAssignment.objects.create(**validated_data)
        
        # History is automatically created via signals
        
        return assignment


class DeliveryRouteAssignmentDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for route assignment.
    Includes full delivery person and route details.
    """
    delivery_person = DeliveryPersonListSerializer(read_only=True)
    route = serializers.SerializerMethodField()
    
    class Meta:
        model = DeliveryRouteAssignment
        fields = ['route', 'delivery_person']
    
    def get_route(self, obj):
        """Get route details with consumer info"""
        route = obj.route
        return {
            'id': route.id,
            'area_code': route.area_code,
            'area_code_description': route.area_code_description,
            'areas': [area.area_name for area in route.areas.all()],
            'consumer_count': route.consumer_assignments.count(),
        }


class BulkAssignmentSerializer(serializers.Serializer):
    """
    Serializer for bulk assignment of routes to delivery person.
    """
    delivery_person = serializers.PrimaryKeyRelatedField(
        queryset=DeliveryPerson.objects.all()
    )
    routes = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(
            queryset=Route.objects.all()
        ),
        min_length=1
    )
    
    def validate_routes(self, value):
        """Check if any routes are already assigned"""
        already_assigned = []
        
        for route in value:
            if DeliveryRouteAssignment.objects.filter(route=route).exists():
                already_assigned.append(route.area_code)
        
        if already_assigned:
            raise serializers.ValidationError(
                f"These routes are already assigned: {', '.join(already_assigned)}"
            )
        
        return value


# Import Route model for bulk assignment
