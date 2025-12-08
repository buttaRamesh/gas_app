from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from delivery.models import DeliveryPerson
from commons.models import Person
from commons.api.serializers import PersonSerializer, PersonCreateUpdateSerializer


class DeliveryPersonListSerializer(serializers.ModelSerializer):
    """
    List serializer with nested person data.
    Includes route assignment statistics.
    """
    person = PersonSerializer(read_only=True)
    assigned_routes_count = serializers.IntegerField(
        source='route_assignments.count',
        read_only=True
    )
    total_consumers = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryPerson
        fields = [
            'id',
            'person',
            'assigned_routes_count',
            'total_consumers',
        ]

    def get_total_consumers(self, obj):
        """Get total number of consumers across all assigned routes"""
        total = 0
        for assignment in obj.route_assignments.select_related('route').all():
            total += assignment.route.consumer_assignments.count()
        return total


class DeliveryPersonDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer with complete person data and route assignments.
    """
    person = PersonSerializer(read_only=True)
    assigned_routes = serializers.SerializerMethodField()
    total_consumers = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryPerson
        fields = [
            'id',
            'person',
            'assigned_routes',
            'total_consumers',
        ]

    def get_assigned_routes(self, obj):
        """Get all routes assigned to this delivery person"""
        assignments = obj.route_assignments.select_related('route').prefetch_related('route__areas').all()

        routes_data = []
        for assignment in assignments:
            route = assignment.route
            routes_data.append({
                'id': route.id,
                'area_code': route.area_code,
                'area_code_description': route.area_code_description,
                'consumer_count': route.consumer_assignments.count(),
                'areas': [{'id': area.id, 'name': area.area_name} for area in route.areas.all()],
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
    Create/Update serializer using nested person object.
    Consistent with consumer pattern - INPUT and OUTPUT use same structure.
    """
    person = PersonCreateUpdateSerializer(required=False, allow_null=True)

    class Meta:
        model = DeliveryPerson
        fields = ['id', 'person']

    def create(self, validated_data):
        """Create delivery person with nested person object"""
        person_data = validated_data.pop('person', None)

        # Create Person using PersonCreateUpdateSerializer
        person = None
        if person_data:
            person_serializer = PersonCreateUpdateSerializer(data=person_data)
            person_serializer.is_valid(raise_exception=True)
            person = person_serializer.save()

        # Get content type for person (for generic FK)
        person_ct = ContentType.objects.get_for_model(Person)

        # Create delivery person with generic FK to person
        delivery_person = DeliveryPerson.objects.create(
            person_content_type=person_ct if person else None,
            person_object_id=person.id if person else None,
            **validated_data
        )

        return delivery_person

    def update(self, instance, validated_data):
        """Update delivery person with nested person object"""
        person_data = validated_data.pop('person', None)

        # Update or create Person using PersonCreateUpdateSerializer
        if person_data is not None:
            if instance.person:
                # Update existing person
                person_serializer = PersonCreateUpdateSerializer(
                    instance.person,
                    data=person_data,
                    partial=True
                )
                person_serializer.is_valid(raise_exception=True)
                person_serializer.save()
            else:
                # Create new person
                person_serializer = PersonCreateUpdateSerializer(data=person_data)
                person_serializer.is_valid(raise_exception=True)
                person = person_serializer.save()

                # Link to delivery person
                person_ct = ContentType.objects.get_for_model(Person)
                instance.person_content_type = person_ct
                instance.person_object_id = person.id

        # Update delivery person fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
