from .address_serializers import AddressSerializer
from .contact_serializers import ContactSerializer
from .family_serializers import FamilyDetailsSerializer
from .identification_serializers import IdentificationSerializer
# from .person_serializers import PersonSerializer
from .person_serializers import PersonSerializer, PersonCreateUpdateSerializer

__all__ = [
    'AddressSerializer',
    'ContactSerializer',
    'FamilyDetailsSerializer',
    'IdentificationSerializer',
    'PersonSerializer',
    'PersonCreateUpdateSerializer',
]
