from rest_framework import serializers
from django.db import transaction
from routes.models import Route, RouteArea


class RouteAreaSerializer(serializers.ModelSerializer):
    """
    Basic serializer for RouteArea with route details.
    Used for list views and basic operations.
    """
    route_code = serializers.CharField(source='route.area_code', read_only=True)
    route_description = serializers.CharField(source='route.area_code_description', read_only=True)

    class Meta:
        model = RouteArea
        fields = ['id', 'area_name', 'route', 'route_code', 'route_description']
        read_only_fields = ['id']


class RouteListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for route list views.
    Shows basic info with counts.
    """
    area_count = serializers.SerializerMethodField()
    consumer_count = serializers.SerializerMethodField()
    delivery_person = serializers.SerializerMethodField()
    delivery_person_name = serializers.SerializerMethodField()

    class Meta:
        model = Route
        fields = [
            'id',
            'area_code',
            'area_code_description',
            'area_count',
            'consumer_count',
            'delivery_person',
            'delivery_person_name',
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Batch-load delivery person names once for all routes
        if self.instance and hasattr(self.instance, '__iter__'):
            from delivery.models import DeliveryPerson, DeliveryRouteAssignment
            from commons.models import Person
            from django.contrib.contenttypes.models import ContentType

            # Get all route IDs
            route_ids = [route.id for route in self.instance]

            # Single query to get all delivery_person_ids for these routes
            assignments = DeliveryRouteAssignment.objects.filter(
                route_id__in=route_ids
            ).values_list('delivery_person_id', flat=True)
            dp_ids = list(assignments)

            # Batch load all delivery persons with their person data
            if dp_ids:
                person_ct = ContentType.objects.get_for_model(Person)
                delivery_persons = DeliveryPerson.objects.filter(id__in=dp_ids)
                person_ids = [dp.person_object_id for dp in delivery_persons if dp.person_content_type_id == person_ct.id]
                persons = {p.id: p.full_name for p in Person.objects.filter(id__in=person_ids)}

                # Create lookup dict
                self._person_names = {}
                for dp in delivery_persons:
                    if dp.person_content_type_id == person_ct.id:
                        self._person_names[dp.id] = persons.get(dp.person_object_id, '')
            else:
                self._person_names = {}

    def get_area_count(self, obj):
        """Get number of areas in this route"""
        # Use len() to utilize prefetch cache instead of .count()
        return len(obj.areas.all())

    def get_consumer_count(self, obj):
        """Get number of consumers assigned to this route"""
        # Use .count() - faster than loading all records
        return obj.consumer_assignments.count()

    def get_delivery_person(self, obj):
        """Get delivery person ID if assigned, None if unassigned"""
        try:
            return obj.delivery_assignment.delivery_person.id
        except:
            return None

    def get_delivery_person_name(self, obj):
        """Get delivery person name if assigned (from batch-loaded cache)"""
        try:
            dp_id = obj.delivery_assignment.delivery_person_id
            return self._person_names.get(dp_id, '')
        except:
            return None


class RouteDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for single route view.
    Includes all areas and assignment info.
    """
    areas = RouteAreaSerializer(many=True, read_only=True)
    area_count = serializers.SerializerMethodField()
    consumer_count = serializers.SerializerMethodField()
    delivery_person = serializers.SerializerMethodField()

    class Meta:
        model = Route
        fields = [
            'id',
            'area_code',
            'area_code_description',
            'areas',
            'area_count',
            'consumer_count',
            'delivery_person',
        ]

    def get_area_count(self, obj):
        return obj.areas.count()

    def get_consumer_count(self, obj):
        return obj.consumer_assignments.count()

    def get_delivery_person(self, obj):
        """Get full delivery person details"""
        try:
            assignment = obj.delivery_assignment
            dp = assignment.delivery_person

            # Get person info (DeliveryPerson uses GenericForeignKey for person)
            person = dp.person if dp else None
            if not person:
                return None

            # Get contact info from person
            contact = person.contacts.first() if person else None

            return {
                'id': dp.id,
                'name': person.full_name if person else None,
                'mobile': contact.mobile_number if contact else None,
                'email': contact.email if contact else None,
            }
        except Exception as e:
            print(f"Error getting delivery person: {e}")
            return None

    def get_consumers(self, obj):
        """Get basic info of all consumers in this route"""
        assignments = obj.consumer_assignments.select_related(
            'consumer'
        ).all()

        consumers_data = []
        for assignment in assignments:
            consumer = assignment.consumer
            contact = consumer.person.contacts.first() if consumer.person else None

            consumers_data.append({
                'id': consumer.id,
                'consumer_number': consumer.consumer_number,
                'consumer_name': consumer.person.full_name if consumer.person else 'Unknown',
                'mobile': contact.mobile_number if contact else None,
                'is_kyc_done': consumer.is_kyc_done,
            })

        return consumers_data


class RouteCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating routes.
    Can optionally assign existing unassigned RouteArea IDs to the route.
    """
    areas = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text="List of existing RouteArea IDs to assign to this route"
    )
    delivery_person_id = serializers.IntegerField(
        write_only=True,
        required=False,
        allow_null=True,
        help_text="ID of delivery person to assign to this route"
    )

    class Meta:
        model = Route
        fields = ['id', 'area_code', 'area_code_description', 'areas', 'delivery_person_id']

    def validate_area_code(self, value):
        """Ensure area code is unique"""
        if self.instance:  # Update case
            if Route.objects.exclude(pk=self.instance.pk).filter(area_code=value).exists():
                raise serializers.ValidationError("Route code already exists.")
        else:  # Create case
            if Route.objects.filter(area_code=value).exists():
                raise serializers.ValidationError("Route code already exists.")
        return value

    def validate_areas(self, value):
        """Validate that all area IDs exist and are unassigned (or assigned to current route during update)"""
        if not value:
            return value

        # Check if all areas exist
        existing_ids = set(RouteArea.objects.filter(id__in=value).values_list('id', flat=True))
        provided_ids = set(value)

        missing_ids = provided_ids - existing_ids
        if missing_ids:
            raise serializers.ValidationError(
                f"These area IDs do not exist: {', '.join(map(str, missing_ids))}"
            )

        # Check if any areas are already assigned to other routes
        already_assigned = RouteArea.objects.filter(
            id__in=value,
            route__isnull=False
        )

        if self.instance:
            # During update, allow areas that are already assigned to THIS route
            already_assigned = already_assigned.exclude(route=self.instance)

        if already_assigned.exists():
            assigned_areas = [
                f"{area.area_name} (ID: {area.id}, assigned to route: {area.route.area_code})"
                for area in already_assigned
            ]
            raise serializers.ValidationError(
                f"These areas are already assigned to other routes: {'; '.join(assigned_areas)}"
            )

        return value

    def create(self, validated_data):
        """Create route and assign existing areas to it"""
        area_ids = validated_data.pop('areas', [])
        delivery_person_id = validated_data.pop('delivery_person_id', None)

        with transaction.atomic():
            # Create the route
            route = Route.objects.create(**validated_data)

            # Assign existing areas to this route if provided
            if area_ids:
                RouteArea.objects.filter(id__in=area_ids).update(route=route)

            # Assign delivery person if provided
            if delivery_person_id:
                from delivery.models import DeliveryRouteAssignment, DeliveryPerson
                delivery_person = DeliveryPerson.objects.get(id=delivery_person_id)
                DeliveryRouteAssignment.objects.create(
                    route=route,
                    delivery_person=delivery_person
                )
        return route

    def update(self, instance, validated_data):
        """Update route and optionally reassign areas"""
        area_ids = validated_data.pop('areas', None)
        delivery_person_id = validated_data.pop('delivery_person_id', None)

        with transaction.atomic():
            # Update route fields
            instance.area_code = validated_data.get('area_code', instance.area_code)
            instance.area_code_description = validated_data.get('area_code_description', instance.area_code_description)
            instance.save()

            # If area_ids provided, reassign areas
            if area_ids is not None:
                # Unassign all current areas from this route (make them unassigned)
                instance.areas.all().update(route=None)

                # Assign the new areas to this route
                if area_ids:
                    RouteArea.objects.filter(id__in=area_ids).update(route=instance)

            # Handle delivery person assignment
            from delivery.models import DeliveryRouteAssignment, DeliveryPerson

            # Delete existing assignment if any
            DeliveryRouteAssignment.objects.filter(route=instance).delete()

            # Create new assignment if delivery_person_id provided
            if delivery_person_id:
                delivery_person = DeliveryPerson.objects.get(id=delivery_person_id)
                DeliveryRouteAssignment.objects.create(
                    route=instance,
                    delivery_person=delivery_person
                )

        return instance
