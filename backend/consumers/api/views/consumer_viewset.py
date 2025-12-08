from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import Http404
from django.db.models import Prefetch
from django_filters.rest_framework import DjangoFilterBackend

from consumers.models import Consumer
from core.pagination.base_pagination import DefaultPagination
from consumers.api.filters import ConsumerFilter

from consumers.api.serializers import (
    ConsumerListSerializer,
    ConsumerDetailSerializer,
    ConsumerKYCListSerializer,
    ConsumerCreateUpdateSerializer
)


class ConsumerViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet
):

    lookup_field = "lookup_value"
    lookup_value_regex = r"[^/]+"
    pagination_class = DefaultPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = ConsumerFilter

    def get_queryset(self):
        return (
            Consumer.objects
            .select_related(     # ONLY REAL FKs ALLOWED HERE
                "person_content_type",
                "category",
                "consumer_type",
                "bpl_type",
                "dct_type",
                "scheme"
            )
            .prefetch_related(   # GFK RELATED MODELS MUST BE PREFETCHED
                Prefetch("person__addresses", to_attr="prefetched_addresses"),
                Prefetch("person__contacts", to_attr="prefetched_contacts"),
                Prefetch("connections", to_attr="prefetched_connections"),
            )
            .order_by("id")
        )


    # ---------------------------------------------------------
    # Overloaded route for ID OR CNxxxx
    # ---------------------------------------------------------
    def get_object(self):
        value = self.kwargs.get("lookup_value")
        qs = self.get_queryset()

        # CN-prefixed → lookup by consumer_number
        if value.upper().startswith("CN"):
            cnum = value[2:]     # remove CN prefix
            try:
                return qs.get(consumer_number=cnum)
            except Consumer.DoesNotExist:
                raise Http404("Consumer number not found")

        # Pure numeric → lookup by ID
        if value.isdigit():
            try:
                return qs.get(id=value)
            except Consumer.DoesNotExist:
                raise Http404("Consumer ID not found")

        raise Http404("Invalid lookup format")

    # ---------------------------------------------------------
    # Choose serializer dynamically
    # ---------------------------------------------------------
    def get_serializer_class(self):
        if self.action == "retrieve":
            return ConsumerDetailSerializer
        if self.action in ["create", "update", "partial_update"]:
            return ConsumerCreateUpdateSerializer
        if self.action == "kyc_list":
            return ConsumerKYCListSerializer
        return ConsumerListSerializer

    # ---------------------------------------------------------
    # /api/consumers/kyc/
    # ---------------------------------------------------------
    @action(detail=False, methods=["get"], url_path="kyc")
    def kyc_list(self, request):
        kyc_param = request.query_params.get("kyc", "").lower()
        qs = self.get_queryset()

        if kyc_param == "on":
            qs = qs.filter(is_kyc_done=True)
        else:
            qs = qs.filter(is_kyc_done=False)

        cat = request.query_params.get("category")
        if cat:
            qs = qs.filter(category_id=cat)

        ctype = request.query_params.get("consumer_type")
        if ctype:
            qs = qs.filter(consumer_type_id=ctype)

        page = self.paginate_queryset(qs)
        return self.get_paginated_response(
            ConsumerKYCListSerializer(page, many=True).data
        )

    # ---------------------------------------------------------
    # /api/consumers/<id or CNnum>/enable-kyc/
    # ---------------------------------------------------------
    @action(detail=True, methods=["patch"], url_path="enable-kyc")
    def enable_kyc(self, request, lookup_value=None):
        consumer = self.get_object()
        consumer.is_kyc_done = True
        consumer.save(update_fields=["is_kyc_done"])

        return Response({"message": "KYC enabled", "id": consumer.id})
