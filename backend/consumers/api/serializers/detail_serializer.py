from rest_framework import serializers
from consumers.models import Consumer
from commons.api.serializers import PersonSerializer
from connections.api.serializers import ConnectionListCreateSerializer
from connections.models import ConnectionDetails

class LookupSerializer(serializers.Serializer):
    """Generic serializer for lookup tables"""
    id = serializers.IntegerField()
    name = serializers.CharField()


class SchemeSerializer(serializers.Serializer):
    """Serializer for Scheme"""
    id = serializers.IntegerField()
    name = serializers.CharField()
from connections.models import ConnectionDetails

# class ConnectionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ConnectionDetails
#         fields = [
#             "id",
#             "sv_number",
#             "sv_date",
#             "hist_code_description",
#             "connection_type",
#             "product",
#             "num_of_regulators",
#         ]

from rest_framework import serializers
from consumers.models import Consumer
from commons.api.serializers import PersonSerializer
# from connections.api.serializers import ConnectionSerializer


class RouteInfoSerializer(serializers.Serializer):
    """Serializer for route information with delivery person details"""
    route_id = serializers.IntegerField()
    area_code = serializers.CharField()
    area_code_description = serializers.CharField()
    delivery_person_name = serializers.CharField(allow_null=True)
    delivery_person_mobile = serializers.CharField(allow_null=True)


class ConsumerDetailSerializer(serializers.ModelSerializer):
    person = PersonSerializer(read_only=True)
    connections = ConnectionListCreateSerializer(many=True)
    category = serializers.CharField(source="category.name", read_only=True)
    consumer_type = serializers.CharField(source="consumer_type.name", read_only=True)
    dct_type = serializers.CharField(source="dct_type.name", read_only=True)
    route_info = serializers.SerializerMethodField()

    class Meta:
        model = Consumer
        fields = [
            "id",
            "consumer_number",
            "blue_book",
            "lpg_id",
            "is_kyc_done",
            "opting_status",
            "status",
            "category",
            "consumer_type",
            "dct_type",
            "person",
            "connections",
            "route_info",
        ]

    def get_route_info(self, obj):
        """Get route information with delivery person details"""
        try:
            if not hasattr(obj, 'route_assignment') or not obj.route_assignment:
                return None

            route_assignment = obj.route_assignment
            route = route_assignment.route

            # Get delivery person info
            delivery_person_name = None
            delivery_person_mobile = None

            if hasattr(route, 'delivery_assignment') and route.delivery_assignment:
                delivery_person = route.delivery_assignment.delivery_person
                if delivery_person and delivery_person.person:
                    delivery_person_name = delivery_person.person.full_name
                    # Get mobile from delivery person's contacts
                    if delivery_person.person.contacts.exists():
                        first_contact = delivery_person.person.contacts.first()
                        delivery_person_mobile = first_contact.mobile_number if first_contact else None

            return {
                'route_id': route.id,
                'area_code': route.area_code,
                'area_code_description': route.area_code_description,
                'delivery_person_name': delivery_person_name,
                'delivery_person_mobile': delivery_person_mobile,
            }
        except Exception:
            return None

    # def get_connections(self, obj):
    #     # Use prefetch if available
    #     conns = getattr(obj, "prefetched_connections", None)
    #     if conns is None:
    #         conns = obj.connections.all()
    #     return ConnectionsOfConsumerListSerializer(conns, many=True).data
