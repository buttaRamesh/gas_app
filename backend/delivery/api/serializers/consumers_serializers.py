
from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from delivery.models import DeliveryPerson
from commons.models import Person
from commons.api.serializers import PersonSerializer, PersonCreateUpdateSerializer
from consumers.models import Consumer


class ConsumersListItemSerializer(serializers.ModelSerializer):
    """
    Serializer for individual consumer in the list.
    """
    name = serializers.SerializerMethodField()
    mobile_number = serializers.SerializerMethodField()
    street_road_name = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    consumer_type = serializers.SerializerMethodField()
    cylinders = serializers.SerializerMethodField()

    class Meta:
        model = Consumer
        fields = [
            'id',
            'consumer_number',
            'name',
            'mobile_number',
            'street_road_name',
            'is_kyc_done',
            'category',
            'consumer_type',
            'cylinders',
        ]

    def get_name(self, obj):
        """Get consumer's full name from person"""
        person = obj.person
        if not person:
            return None
        return person.full_name or f"{person.first_name or ''} {person.last_name or ''}".strip()

    def get_mobile_number(self, obj):
        """Get consumer's mobile number from person contacts"""
        person = obj.person
        if person and person.contacts.exists():
            return person.contacts.first().mobile_number
        return None

    def get_street_road_name(self, obj):
        """Get consumer's street/road name from person address"""
        person = obj.person
        if person and person.addresses.exists():
            return person.addresses.first().street_road_name
        return None

    def get_category(self, obj):
        """Get consumer category name"""
        return obj.category.name if obj.category else None

    def get_consumer_type(self, obj):
        """Get consumer type name"""
        return obj.consumer_type.name if obj.consumer_type else None

    def get_cylinders(self, obj):
        """Get number of cylinders/connections"""
        return obj.connections.count()


class ConsumersListSerializer(serializers.ModelSerializer):
    """
    Serializer for delivery person info in the consumers endpoint.
    Gets consumers list from context (paginated).
    """
    assigned_routes = serializers.SerializerMethodField()
    total_consumers = serializers.SerializerMethodField()
    mobile_num = serializers.SerializerMethodField()
    consumers = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryPerson
        fields = [
            'id',
            'name',
            'mobile_num',
            'total_consumers',
            'assigned_routes',
            'consumers',
        ]

    def get_mobile_num(self, obj):
        """Get delivery person's mobile number"""
        person = obj.person
        if person and person.contacts.exists():
            return person.contacts.first().mobile_number
        return None

    def get_assigned_routes(self, obj):
        """Get list of assigned routes with their details"""
        from consumers.models import ConsumerRouteAssignment

        routes = []
        for assignment in obj.route_assignments.all():
            route = assignment.route

            # Count consumers for this specific route
            consumer_count = ConsumerRouteAssignment.objects.filter(route=route).count()

            # Get route areas
            areas = [area.area_name for area in route.areas.all()]

            routes.append({
                'route': f"{route.area_code} - {route.area_code_description}",
                'consumers': consumer_count,
                'areas': areas,
            })
        return routes

    def get_total_consumers(self, obj):
        """Calculate total consumers across all assigned routes"""
        from consumers.models import ConsumerRouteAssignment

        # Get all route IDs assigned to this delivery person
        route_ids = obj.route_assignments.values_list('route_id', flat=True)

        # Count consumers assigned to these routes
        total = ConsumerRouteAssignment.objects.filter(route_id__in=route_ids).count()
        return total

    def get_consumers(self, obj):
        """Get consumers from context (already paginated)"""
        consumers = self.context.get('consumers', [])
        return ConsumersListItemSerializer(consumers, many=True).data






 