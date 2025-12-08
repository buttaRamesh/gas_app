from rest_framework import viewsets
from commons.models import FamilyDetails
from commons.api.serializers import FamilyDetailsSerializer


class FamilyDetailsViewSet(viewsets.ModelViewSet):
    """ViewSet for FamilyDetails model"""
    queryset = FamilyDetails.objects.all()
    serializer_class = FamilyDetailsSerializer
