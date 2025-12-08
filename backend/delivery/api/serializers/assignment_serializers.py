"""
Assignment serializers - kept as-is, not refactored.
Only DeliveryPerson serializers use the new nested pattern.
"""
from rest_framework import serializers
from delivery.models import DeliveryRouteAssignment, DeliveryPerson
from routes.models import Route
from .delivery_person_serializers import DeliveryPersonListSerializer


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
