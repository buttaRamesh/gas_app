from rest_framework import viewsets, status
from rest_framework.response import Response

from inventory.models import InvoiceHeader
from inventory.api.serializers.invoice_serializers import (
    InvoiceReadSerializer,
    InvoiceCreateSerializer
)


class InvoiceViewSet(viewsets.ModelViewSet):
    """
    GET    /api/inventory/invoice/            -> list invoices
    GET    /api/inventory/invoice/{id}/       -> retrieve invoice
    POST   /api/inventory/invoice/           -> create + post invoice
    """

    queryset = InvoiceHeader.objects.all().order_by("-received_at")

    def get_serializer_class(self):
        if self.action == "create":
            return InvoiceCreateSerializer
        return InvoiceReadSerializer

    def create(self, request, *args, **kwargs):
        serializer = InvoiceCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        invoice = serializer.save()
        return Response(
            {
                "invoice_id": invoice.id,
                "invoice_number": invoice.invoice_number,
                "status": invoice.status
            },
            status=status.HTTP_201_CREATED
        )
