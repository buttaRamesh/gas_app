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


class ConsumerDetailSerializer(serializers.ModelSerializer):
    person = PersonSerializer(read_only=True)
    connections = ConnectionListCreateSerializer(many=True)
    category = serializers.CharField(source="category.name", read_only=True)
    consumer_type = serializers.CharField(source="consumer_type.name", read_only=True)
    dct_type = serializers.CharField(source="dct_type.name", read_only=True)

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
        ]

    # def get_connections(self, obj):
    #     # Use prefetch if available
    #     conns = getattr(obj, "prefetched_connections", None)
    #     if conns is None:
    #         conns = obj.connections.all()
    #     return ConnectionsOfConsumerListSerializer(conns, many=True).data
