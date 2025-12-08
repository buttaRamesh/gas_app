from rest_framework import serializers
from consumers.models import Consumer
 

class ConsumerByRouteItemSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    mobile_number = serializers.SerializerMethodField()
    street_road_name = serializers.SerializerMethodField()
    consumer_type = serializers.CharField(source="consumer_type.name", read_only=True)
    cylinders_count = serializers.SerializerMethodField()

    class Meta:
        model = Consumer
        fields = [
            "id",
            "consumer_number",
            "name",
            "mobile_number",
            "street_road_name",
            "consumer_type",
            "cylinders_count",
        ]

    def get_name(self, obj):
        p = obj.person
        if p:
            return p.full_name or f"{p.first_name} {p.last_name}".strip()
        return None

    def get_mobile_number(self, obj):
        p = obj.person
        if p and hasattr(p, "prefetched_contacts") and p.prefetched_contacts:
            return p.prefetched_contacts[0].mobile_number
        return None

    def get_street_road_name(self, obj):
        p = obj.person
        if p and hasattr(p, "prefetched_addresses") and p.prefetched_addresses:
            return p.prefetched_addresses[0].street_road_name
        return None

    def get_cylinders_count(self, obj):
        if hasattr(obj, "prefetched_connections"):
            return len(obj.prefetched_connections)
        return obj.connections.count()


class ConsumersByRouteSerializer(serializers.Serializer):
    route_id = serializers.IntegerField()
    route_name = serializers.CharField()
    delivery_person_name = serializers.CharField()
    delivery_person_contact_num = serializers.CharField(allow_null=True)
    consumers_count = serializers.IntegerField()
    consumers = ConsumerByRouteItemSerializer(many=True)
