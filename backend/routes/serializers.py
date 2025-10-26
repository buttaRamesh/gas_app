# File: route/serializers.py
from rest_framework import serializers
from .models import Route, RouteArea


# class RouteAreaSerializer(serializers.ModelSerializer):
#     """Serializer for RouteArea"""
    
#     class Meta:
#         model = RouteArea
#         fields = ['id', 'area_name', 'route']
#         read_only_fields = ['id']


# ------------------------------------------------------------------------------
# 1. Basic Serializer (for List views)
# ------------------------------------------------------------------------------
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
    delivery_person_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Route
        fields = [
            'id',
            'area_code',
            'area_code_description',
            'area_count',
            'consumer_count',
            'delivery_person_name',
        ]
    
    def get_area_count(self, obj):
        """Get number of areas in this route"""
        return obj.areas.count()
    
    def get_consumer_count(self, obj):
        """Get number of consumers assigned to this route"""
        return obj.consumer_assignments.count()
    
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
        assignments = obj.consumer_assignments.select_related('consumer').all()
        
        consumers_data = []
        for assignment in assignments:
            consumer = assignment.consumer
            contact = consumer.contacts.first()
            
            consumers_data.append({
                'id': consumer.id,
                'consumer_number': consumer.consumer_number,
                'consumer_name': consumer.consumer_name,
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
        fields = ['id','area_code', 'area_code_description', 'areas']
    
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
        from django.db import transaction
        
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
        from django.db import transaction
        
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


# ==============================================================================
# FILE: route/serializers.py
# STEP 2: RouteArea Serializers
# ==============================================================================

# from rest_framework import serializers
# from .models import RouteArea, Route




# ------------------------------------------------------------------------------
# 2. Detail Serializer (for single area view)
# ------------------------------------------------------------------------------
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


# ------------------------------------------------------------------------------
# 3. Create/Update Serializer (for POST, PUT, PATCH)
# ------------------------------------------------------------------------------
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


# ------------------------------------------------------------------------------
# 4. Bulk Create Serializer (for creating multiple areas at once)
# ------------------------------------------------------------------------------
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


# ==============================================================================
# Summary of Serializers:
# 
# 1. RouteAreaSerializer - Basic list view with route info
# 2. RouteAreaDetailSerializer - Detailed view with full route data
# 3. RouteAreaCreateUpdateSerializer - For creating/updating with validation
# 4. BulkRouteAreaCreateSerializer - For bulk creating multiple areas
#
# Note: List endpoint filtering behavior:
# GET /api/route-areas/                          -> ALL areas (default)
# GET /api/route-areas/?assigned=true            -> Only ASSIGNED areas
# GET /api/route-areas/?assigned=false           -> Only UNASSIGNED areas
# GET /api/route-areas/?route=1                  -> Areas for specific route
# ==============================================================================




# # File: route/serializers.py
# from rest_framework import serializers
# from .models import Route, RouteArea


# # class RouteAreaSerializer(serializers.ModelSerializer):
# #     """Serializer for RouteArea"""
    
# #     class Meta:
# #         model = RouteArea
# #         fields = ['id', 'area_name', 'route']
# #         read_only_fields = ['id']


# # ------------------------------------------------------------------------------
# # 1. Basic Serializer (for List views)
# # ------------------------------------------------------------------------------
# class RouteAreaSerializer(serializers.ModelSerializer):
#     """
#     Basic serializer for RouteArea with route details.
#     Used for list views and basic operations.
#     """
#     route_code = serializers.CharField(source='route.area_code', read_only=True)
#     route_description = serializers.CharField(source='route.area_code_description', read_only=True)
    
#     class Meta:
#         model = RouteArea
#         fields = ['id', 'area_name', 'route', 'route_code', 'route_description']
#         read_only_fields = ['id']


# class RouteListSerializer(serializers.ModelSerializer):
#     """
#     Lightweight serializer for route list views.
#     Shows basic info with counts.
#     """
#     area_count = serializers.SerializerMethodField()
#     consumer_count = serializers.SerializerMethodField()
#     delivery_person_name = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Route
#         fields = [
#             'id',
#             'area_code',
#             'area_code_description',
#             'area_count',
#             'consumer_count',
#             'delivery_person_name',
#         ]
    
#     def get_area_count(self, obj):
#         """Get number of areas in this route"""
#         return obj.areas.count()
    
#     def get_consumer_count(self, obj):
#         """Get number of consumers assigned to this route"""
#         return obj.consumer_assignments.count()
    
#     def get_delivery_person_name(self, obj):
#         """Get delivery person name if assigned"""
#         try:
#             return obj.delivery_assignment.delivery_person.name
#         except:
#             return None


# class RouteDetailSerializer(serializers.ModelSerializer):
#     """
#     Detailed serializer for single route view.
#     Includes all areas and assignment info.
#     """
#     areas = RouteAreaSerializer(many=True, read_only=True)
#     area_count = serializers.SerializerMethodField()
#     consumer_count = serializers.SerializerMethodField()
#     delivery_person = serializers.SerializerMethodField()
#     consumers = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Route
#         fields = [
#             'id',
#             'area_code',
#             'area_code_description',
#             'areas',
#             'area_count',
#             'consumer_count',
#             'delivery_person',
#             'consumers',
#         ]
    
#     def get_area_count(self, obj):
#         return obj.areas.count()
    
#     def get_consumer_count(self, obj):
#         return obj.consumer_assignments.count()
    
#     def get_delivery_person(self, obj):
#         """Get full delivery person details"""
#         try:
#             assignment = obj.delivery_assignment
#             dp = assignment.delivery_person
            
#             # Get contact info
#             contact = dp.contacts.first()
            
#             return {
#                 'id': dp.id,
#                 'name': dp.name,
#                 'mobile': contact.mobile_number if contact else None,
#                 'email': contact.email if contact else None,
#             }
#         except:
#             return None
    
#     def get_consumers(self, obj):
#         """Get basic info of all consumers in this route"""
#         assignments = obj.consumer_assignments.select_related('consumer').all()
        
#         consumers_data = []
#         for assignment in assignments:
#             consumer = assignment.consumer
#             contact = consumer.contacts.first()
            
#             consumers_data.append({
#                 'id': consumer.id,
#                 'consumer_number': consumer.consumer_number,
#                 'consumer_name': consumer.consumer_name,
#                 'mobile': contact.mobile_number if contact else None,
#                 'is_kyc_done': consumer.is_kyc_done,
#             })
        
#         return consumers_data


# class RouteCreateUpdateSerializer(serializers.ModelSerializer):
#     """
#     Serializer for creating and updating routes.
#     """
#     areas = serializers.ListField(
#         child=serializers.CharField(max_length=100),
#         write_only=True,
#         required=False,
#         help_text="List of area names to create"
#     )
    
#     class Meta:
#         model = Route
#         fields = ['area_code', 'area_code_description', 'areas']
    
#     def validate_area_code(self, value):
#         """Ensure area code is unique"""
#         if self.instance:  # Update case
#             if Route.objects.exclude(pk=self.instance.pk).filter(area_code=value).exists():
#                 raise serializers.ValidationError("Route code already exists.")
#         else:  # Create case
#             if Route.objects.filter(area_code=value).exists():
#                 raise serializers.ValidationError("Route code already exists.")
#         return value
    
#     def create(self, validated_data):
#         print(validated_data)
#         """Create route and associated areas"""
#         areas_data = validated_data.pop('areas', [])
#         route = Route.objects.create(**validated_data)
        
#         # Create associated areas
#         for area_name in areas_data:
#             RouteArea.objects.create(route=route, area_name=area_name)
        
#         return route
    
#     def update(self, instance, validated_data):
#         """Update route (areas handled separately)"""
#         areas_data = validated_data.pop('areas', None)
        
#         # Update route fields
#         instance.area_code = validated_data.get('area_code', instance.area_code)
#         instance.area_code_description = validated_data.get('area_code_description', instance.area_code_description)
#         instance.save()
        
#         # If areas provided, replace existing ones
#         if areas_data is not None:
#             # Delete old areas
#             instance.areas.all().delete()
#             # Create new areas
#             for area_name in areas_data:
#                 RouteArea.objects.create(route=instance, area_name=area_name)
        
#         return instance


# # ==============================================================================
# # FILE: route/serializers.py
# # STEP 2: RouteArea Serializers
# # ==============================================================================

# # from rest_framework import serializers
# # from .models import RouteArea, Route




# # ------------------------------------------------------------------------------
# # 2. Detail Serializer (for single area view)
# # ------------------------------------------------------------------------------
# class RouteAreaDetailSerializer(serializers.ModelSerializer):
#     """
#     Detailed serializer with full route information.
#     Used for retrieve/detail views.
#     """
#     route = serializers.SerializerMethodField()
    
#     class Meta:
#         model = RouteArea
#         fields = ['id', 'area_name', 'route']
    
#     def get_route(self, obj):
#         """Get full route details if route exists"""
#         if not obj.route:
#             return None
            
#         route = obj.route
#         return {
#             'id': route.id,
#             'area_code': route.area_code,
#             'area_code_description': route.area_code_description,
#             'total_areas': route.areas.count(),
#             'consumer_count': route.consumer_assignments.count(),
#         }


# # ------------------------------------------------------------------------------
# # 3. Create/Update Serializer (for POST, PUT, PATCH)
# # ------------------------------------------------------------------------------
# class RouteAreaCreateUpdateSerializer(serializers.ModelSerializer):
#     """
#     Serializer for creating/updating individual route areas.
#     Includes validation to prevent duplicate area names in same route.
#     """
#     class Meta:
#         model = RouteArea
#         fields = ['id', 'area_name', 'route']
#         read_only_fields = ['id']
    
#     def validate_area_name(self, value):
#         """Validate area name is at least 2 characters"""
#         if len(value.strip()) < 2:
#             raise serializers.ValidationError(
#                 "Area name must be at least 2 characters long."
#             )
#         return value.strip()
    
#     def validate(self, data):
#         """
#         Validate that area name is not duplicate for the same route.
#         Only check if route is provided (can have duplicate names if unassigned).
#         """
#         route = data.get('route')
#         area_name = data.get('area_name')
        
#         # Only check for duplicates if route is provided
#         if route:
#             queryset = RouteArea.objects.filter(
#                 route=route, 
#                 area_name=area_name
#             )
            
#             # Exclude current instance when updating
#             if self.instance:
#                 queryset = queryset.exclude(pk=self.instance.pk)
            
#             if queryset.exists():
#                 raise serializers.ValidationError({
#                     'area_name': f'Area "{area_name}" already exists in route {route.area_code}.'
#                 })
        
#         return data


# # ------------------------------------------------------------------------------
# # 4. Bulk Create Serializer (for creating multiple areas at once)
# # ------------------------------------------------------------------------------
# class BulkRouteAreaCreateSerializer(serializers.Serializer):
#     """
#     Serializer for bulk creating multiple areas for a route.
#     """
#     route = serializers.PrimaryKeyRelatedField(
#         queryset=Route.objects.all(),
#         required=True,
#         help_text="Route ID to assign areas to"
#     )
#     area_names = serializers.ListField(
#         child=serializers.CharField(max_length=100),
#         min_length=1,
#         help_text="List of area names to create"
#     )
    
#     def validate_area_names(self, value):
#         """Clean and validate area names"""
#         # Remove duplicates and empty strings
#         cleaned = [name.strip() for name in value if name.strip()]
        
#         if not cleaned:
#             raise serializers.ValidationError(
#                 "At least one valid area name is required."
#             )
        
#         # Check for duplicates in the provided list
#         if len(cleaned) != len(set(cleaned)):
#             raise serializers.ValidationError(
#                 "Duplicate area names found in the list."
#             )
        
#         return cleaned
    
#     def validate(self, data):
#         """Check if any area names already exist for this route"""
#         route = data.get('route')
#         area_names = data.get('area_names', [])
        
#         # Check for existing areas in this route
#         existing = RouteArea.objects.filter(
#             route=route, 
#             area_name__in=area_names
#         ).values_list('area_name', flat=True)
        
#         if existing:
#             raise serializers.ValidationError({
#                 'area_names': f"These areas already exist in route {route.area_code}: {', '.join(existing)}"
#             })
        
#         return data


# # ==============================================================================
# # Summary of Serializers:
# # 
# # 1. RouteAreaSerializer - Basic list view with route info
# # 2. RouteAreaDetailSerializer - Detailed view with full route data
# # 3. RouteAreaCreateUpdateSerializer - For creating/updating with validation
# # 4. BulkRouteAreaCreateSerializer - For bulk creating multiple areas
# #
# # Note: List endpoint filtering behavior:
# # GET /api/route-areas/                          -> ALL areas (default)
# # GET /api/route-areas/?assigned=true            -> Only ASSIGNED areas
# # GET /api/route-areas/?assigned=false           -> Only UNASSIGNED areas
# # GET /api/route-areas/?route=1                  -> Areas for specific route
# # ==============================================================================