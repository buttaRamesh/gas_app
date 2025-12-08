from rest_framework import viewsets
from commons.models import Identification
from commons.api.serializers import IdentificationSerializer


class IdentificationViewSet(viewsets.ModelViewSet):
    """ViewSet for Identification model"""
    queryset = Identification.objects.all()
    serializer_class = IdentificationSerializer
