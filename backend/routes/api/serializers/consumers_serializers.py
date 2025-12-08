from rest_framework import serializers
from routes.models import Route
from delivery.api.serializers import ConsumersListItemSerializer


class RouteConsumersSerializer(serializers.ModelSerializer):
    """
    Serializer for route info in the consumers endpoint.
    Gets consumers list from context (paginated).
    """
    total_consumers = serializers.SerializerMethodField()
    areas = serializers.SerializerMethodField()
    delivery_person = serializers.SerializerMethodField()
    consumers = serializers.SerializerMethodField()

    class Meta:
        model = Route
        fields = [
            'id',
            'area_code',
            'area_code_description',
            'total_consumers',
            'areas',
            'delivery_person',
            'consumers',
        ]

    def get_total_consumers(self, obj):
        """Get total consumers assigned to this route"""
        return obj.consumer_assignments.count()

    def get_areas(self, obj):
        """Get list of area names for this route"""
        return [area.area_name for area in obj.areas.all()]

    def get_delivery_person(self, obj):
        """Get assigned delivery person info"""
        try:
            assignment = obj.delivery_assignment
            dp = assignment.delivery_person
            person = dp.person
            if person and person.contacts.exists():
                mobile = person.contacts.first().mobile_number
            else:
                mobile = None

            return {
                'id': dp.id,
                'name': dp.name,
                'mobile_num': mobile,
            }
        except:
            return None

    def get_consumers(self, obj):
        """Get consumers from context (already paginated)"""
        consumers = self.context.get('consumers', [])
        return ConsumersListItemSerializer(consumers, many=True).data
