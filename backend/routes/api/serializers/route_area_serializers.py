from rest_framework import serializers
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


class RouteAreaDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer with full route information.
    Used for retrieve/detail views.
    """
    route = serializers.SerializerMethodField()

    class Meta:
        model = RouteArea
        fields = ['id', 'area_name', 'route']

    def get_route(self, obj):
        """Get full route details if route exists"""
        if not obj.route:
            return None

        route = obj.route
        return {
            'id': route.id,
            'area_code': route.area_code,
            'area_code_description': route.area_code_description,
            'total_areas': route.areas.count(),
            'consumer_count': route.consumer_assignments.count(),
        }


class RouteAreaCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating/updating individual route areas.
    Includes validation to prevent duplicate area names in same route.
    """
    class Meta:
        model = RouteArea
        fields = ['id', 'area_name', 'route']
        read_only_fields = ['id']

    def validate_area_name(self, value):
        """Validate area name is at least 2 characters"""
        if len(value.strip()) < 2:
            raise serializers.ValidationError(
                "Area name must be at least 2 characters long."
            )
        return value.strip()

    def validate(self, data):
        """
        Validate that area name is not duplicate for the same route.
        Only check if route is provided (can have duplicate names if unassigned).
        """
        route = data.get('route')
        area_name = data.get('area_name')

        # Only check for duplicates if route is provided
        if route:
            queryset = RouteArea.objects.filter(
                route=route,
                area_name=area_name
            )

            # Exclude current instance when updating
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)

            if queryset.exists():
                raise serializers.ValidationError({
                    'area_name': f'Area "{area_name}" already exists in route {route.area_code}.'
                })

        return data


class BulkRouteAreaCreateSerializer(serializers.Serializer):
    """
    Serializer for bulk creating multiple areas for a route.
    """
    route = serializers.PrimaryKeyRelatedField(
        queryset=Route.objects.all(),
        required=True,
        help_text="Route ID to assign areas to"
    )
    area_names = serializers.ListField(
        child=serializers.CharField(max_length=100),
        min_length=1,
        help_text="List of area names to create"
    )

    def validate_area_names(self, value):
        """Clean and validate area names"""
        # Remove duplicates and empty strings
        cleaned = [name.strip() for name in value if name.strip()]

        if not cleaned:
            raise serializers.ValidationError(
                "At least one valid area name is required."
            )

        # Check for duplicates in the provided list
        if len(cleaned) != len(set(cleaned)):
            raise serializers.ValidationError(
                "Duplicate area names found in the list."
            )

        return cleaned

    def validate(self, data):
        """Check if any area names already exist for this route"""
        route = data.get('route')
        area_names = data.get('area_names', [])

        # Check for existing areas in this route
        existing = RouteArea.objects.filter(
            route=route,
            area_name__in=area_names
        ).values_list('area_name', flat=True)

        if existing:
            raise serializers.ValidationError({
                'area_names': f"These areas already exist in route {route.area_code}: {', '.join(existing)}"
            })

        return data
