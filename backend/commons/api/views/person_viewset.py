from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType

from commons.models import Person
from commons.api.serializers import PersonSerializer, PersonCreateUpdateSerializer


class PersonViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Person model.
    Supports creating/updating Person with nested related data.
    """
    queryset = Person.objects.all().select_related(
        'identification', 'family_details'
    ).prefetch_related('addresses', 'contacts')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PersonCreateUpdateSerializer
        return PersonSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by name
        name = self.request.query_params.get('name')
        if name:
            queryset = queryset.filter(full_name__icontains=name)

        # Filter by mobile number (through contacts)
        mobile = self.request.query_params.get('mobile')
        if mobile:
            queryset = queryset.filter(contacts__mobile_number__icontains=mobile).distinct()

        return queryset

    @action(detail=True, methods=['get'])
    def consumers(self, request, pk=None):
        """Get all consumers linked to this person"""
        person = self.get_object()
        from consumers.serializers import ConsumerSerializer

        # Get content type for person
        person_ct = ContentType.objects.get_for_model(Person)

        # Import Consumer model and filter
        from consumers.models import Consumer
        consumers = Consumer.objects.filter(
            person_content_type=person_ct,
            person_object_id=person.id
        )

        serializer = ConsumerSerializer(consumers, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def delivery_persons(self, request, pk=None):
        """Get all delivery persons linked to this person"""
        person = self.get_object()
        from delivery.serializers import DeliveryPersonSerializer

        # Get content type for person
        person_ct = ContentType.objects.get_for_model(Person)

        # Import DeliveryPerson model and filter
        from delivery.models import DeliveryPerson
        delivery_persons = DeliveryPerson.objects.filter(
            person_content_type=person_ct,
            person_object_id=person.id
        )

        serializer = DeliveryPersonSerializer(delivery_persons, many=True)
        return Response(serializer.data)
