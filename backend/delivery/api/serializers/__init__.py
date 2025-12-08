from .delivery_person_serializers import (
    DeliveryPersonListSerializer,
    DeliveryPersonDetailSerializer,
    DeliveryPersonCreateUpdateSerializer,
)
from .consumers_serializers import (
    ConsumersListSerializer,
    ConsumersListItemSerializer
)
from .assignment_serializers import (
    DeliveryRouteAssignmentSerializer,
    DeliveryRouteAssignmentCreateUpdateSerializer,
    DeliveryRouteAssignmentDetailSerializer,
    BulkAssignmentSerializer,
)

__all__ = [
    # DeliveryPerson
    'DeliveryPersonListSerializer',
    'DeliveryPersonDetailSerializer',
    'DeliveryPersonCreateUpdateSerializer',
    # Assignments (kept together)
    'DeliveryRouteAssignmentSerializer',
    'DeliveryRouteAssignmentCreateUpdateSerializer',
    'DeliveryRouteAssignmentDetailSerializer',
    'BulkAssignmentSerializer',
    # Consumers
    'ConsumersListSerializer',
    'ConsumersListItemSerializer',
]
