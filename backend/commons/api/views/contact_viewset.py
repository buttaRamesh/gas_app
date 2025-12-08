from rest_framework import viewsets
from commons.models import Contact
from commons.api.serializers import ContactSerializer


class ContactViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Contact model.
    Supports generic relations - can be linked to Person, Office, Organization, etc.
    """
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by content_type and object_id if provided
        content_type_id = self.request.query_params.get('content_type')
        object_id = self.request.query_params.get('object_id')

        if content_type_id and object_id:
            queryset = queryset.filter(content_type_id=content_type_id, object_id=object_id)

        return queryset
