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

    def get_area_count(self, obj):
        """Get number of areas in this route"""
        return obj.areas.count()

    def get_consumer_count(self, obj):
        """Get number of consumers assigned to this route"""
        return obj.consumer_assignments.count()

    def get_delivery_person(self, obj):
        """Get delivery person ID if assigned, None if unassigned"""
        try:
            return obj.delivery_assignment.delivery_person.id
        except:
            return None

    def get_delivery_person_name(self, obj):
        """Get delivery person name if assigned"""
        try:
            return obj.delivery_assignment.delivery_person.name
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
    consumers = serializers.SerializerMethodField()

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
            'consumers',
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

            # Get contact info
            contact = dp.contacts.first()

            return {
                'id': dp.id,
                'name': dp.name,
                'mobile': contact.mobile_number if contact else None,
                'email': contact.email if contact else None,
            }
        except:
            return None

    def get_consumers(self, obj):
        """Get basic info of all consumers in this route"""
        assignments = obj.consumer_assignments.select_related(
            'consumer__person'
        ).prefetch_related(
            'consumer__person__contacts'
        ).all()

        consumers_data = []
        for assignment in assignments:
            consumer = assignment.consumer
            contact = consumer.person.contacts.first() if consumer.person else None

            consumers_data.append({
                'id': consumer.id,
                'consumer_number': consumer.consumer_number,
                'consumer_name': consumer.person.person_name if consumer.person else 'Unknown',
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

    class Meta:
        model = Route
        fields = ['id', 'area_code', 'area_code_description', 'areas']

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

        with transaction.atomic():
            # Create the route
            route = Route.objects.create(**validated_data)

            # Assign existing areas to this route if provided
            if area_ids:
                RouteArea.objects.filter(id__in=area_ids).update(route=route)
        return route

    def update(self, instance, validated_data):
        """Update route and optionally reassign areas"""
        area_ids = validated_data.pop('areas', None)

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

        return instance
