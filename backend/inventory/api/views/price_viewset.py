from datetime import date
from django.utils import timezone
from django.db.models import Q
from rest_framework.decorators import action
from rest_framework.response import Response

from rest_framework import viewsets, filters
from inventory.models import ProductPrice, ProductPriceLog
from inventory.api.serializers.product_price_serializers import ProductPriceSerializer
from inventory.api.serializers import ProductPriceAuditSerializer
from inventory.api.services import ProductPriceAuditService


class ProductPriceViewSet(viewsets.ModelViewSet):
    # Updated: order by effective_date (your real field)
    queryset = ProductPrice.objects.select_related("product").all().order_by("-effective_date")
    serializer_class = ProductPriceSerializer

    filter_backends = [filters.SearchFilter]
    search_fields = ["product__name", "product__product_code"]

    # -------------------------------
    # CREATE
    # -------------------------------
    def perform_create(self, serializer):
        instance = serializer.save()

        # Deactivate all other active prices for this product
        ProductPrice.objects.filter(
            product=instance.product,
            is_active=True
        ).exclude(id=instance.id).update(is_active=False)

        # Audit log
        ProductPriceAuditService.log_create(instance, user=self.request.user)

    # -------------------------------
    # UPDATE
    # -------------------------------
    def perform_update(self, serializer):
        old = ProductPrice.objects.get(id=self.get_object().id)
        instance = serializer.save()

        # If updated price becomes active → deactivate others
        if instance.is_active:
            ProductPrice.objects.filter(
                product=instance.product,
                is_active=True
            ).exclude(id=instance.id).update(is_active=False)

        # Audit log
        ProductPriceAuditService.log_update(old, instance, user=self.request.user)

    # -------------------------------
    # DELETE
    # -------------------------------
    def perform_destroy(self, instance):
        ProductPriceAuditService.log_delete(instance, user=self.request.user)
        return super().perform_destroy(instance)

    # -------------------------------
    # CURRENT ACTIVE PRICE
    # GET /api/inventory/prices/current/?product=ID
    # -------------------------------
    @action(detail=False, methods=["get"])
    def current(self, request):
        product_id = request.query_params.get("product")
        if not product_id:
            return Response({"error": "product parameter is required"}, status=400)

        price = ProductPrice.objects.filter(
            product_id=product_id,
            is_active=True
        ).order_by("-effective_date").first()

        if not price:
            return Response({"error": "No active price found"}, status=404)

        return Response(ProductPriceSerializer(price).data)

    # -------------------------------
    # PRICE HISTORY
    # GET /api/inventory/prices/history/?product=ID
    # -------------------------------
    @action(detail=False, methods=["get"])
    def history(self, request):
        product_id = request.query_params.get("product")
        if not product_id:
            return Response({"error": "product parameter is required"}, status=400)

        qs = ProductPrice.objects.filter(
            product_id=product_id
        ).order_by("-effective_date")

        return Response(ProductPriceSerializer(qs, many=True).data)

    # -------------------------------
    # AUDIT LOG
    # GET /api/inventory/prices/audit/?product=ID
    # -------------------------------
    @action(detail=False, methods=["get"], url_path="audit")
    def audit(self, request):
        product_id = request.query_params.get("product")
        if not product_id:
            return Response({"error": "product parameter is required"}, status=400)

        logs = ProductPriceLog.objects.filter(
            product_id=product_id
        ).order_by("-changed_at")

        serializer = ProductPriceAuditSerializer(logs, many=True)
        return Response(serializer.data)
