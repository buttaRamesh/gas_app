from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import Http404
from django.db.models import Prefetch
from django_filters.rest_framework import DjangoFilterBackend

from consumers.models import Consumer
from core.pagination.base_pagination import DefaultPagination
from consumers.api.filters import ConsumerFilter, ConsumerOrderingFilter
from core.exports import ExportViewMixin

from consumers.api.serializers import (
    ConsumerListSerializer,
    ConsumerDetailSerializer,
    ConsumerKYCListSerializer,
    ConsumerCreateUpdateSerializer
)


class ConsumerViewSet(
    ExportViewMixin,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet
):

    lookup_field = "lookup_value"
    lookup_value_regex = r"[^/]+"
    pagination_class = DefaultPagination
    filter_backends = [DjangoFilterBackend, ConsumerOrderingFilter]
    filterset_class = ConsumerFilter
    ordering_fields = [
        'consumer_number',
        'name',
        'mobile_number',
        'street_road_name',
        'pin_code',
        'category',
        'consumer_type',
        'cylinders',
        'is_kyc_done',
    ]
    ordering = ['id']  # default ordering

    # Export configuration
    export_serializer_class = ConsumerListSerializer
    export_filename_prefix = 'consumers'

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
        )

    def list(self, request, *args, **kwargs):
        """
        Override list to handle cylinders sorting in-memory after fetching.
        For cylinders sorting: fetch all, sort, then paginate.
        """
        queryset = self.filter_queryset(self.get_queryset())

        # Check if cylinders sorting is requested
        ordering_param = request.query_params.get('ordering', '')
        cylinders_sort = None

        if 'cylinders' in ordering_param:
            if ordering_param.startswith('-cylinders') or ',-cylinders' in ordering_param:
                cylinders_sort = 'desc'
            elif 'cylinders' in ordering_param:
                cylinders_sort = 'asc'

        # If cylinders sorting is requested, sort ALL items first, then paginate
        if cylinders_sort:
            # Convert queryset to list to evaluate it
            all_items = list(queryset)

            # Sort ALL items by cylinders count
            sorted_items = sorted(
                all_items,
                key=lambda obj: len(getattr(obj, 'prefetched_connections', [])),
                reverse=(cylinders_sort == 'desc')
            )

            # Now manually paginate the sorted list
            page = self.paginate_queryset(sorted_items)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(sorted_items, many=True)
            return Response(serializer.data)

        # Normal pagination for non-cylinders sorting
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


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
    # Default: KYC Pending, Supports search & ordering
    # ---------------------------------------------------------
    @action(detail=False, methods=["get"], url_path="kyc")
    def kyc_list(self, request):
        # Start with base queryset
        qs = self.get_queryset()

        # Apply KYC filter (default: pending)
        kyc_param = request.query_params.get("kyc", "").lower()
        if kyc_param == "on":
            qs = qs.filter(is_kyc_done=True)
        else:
            qs = qs.filter(is_kyc_done=False)

        # Apply additional filters
        cat = request.query_params.get("category")
        if cat:
            qs = qs.filter(category_id=cat)

        ctype = request.query_params.get("consumer_type")
        if ctype:
            qs = qs.filter(consumer_type_id=ctype)

        # Apply search and ordering filters (enables SmartDataGrid compatibility)
        qs = self.filter_queryset(qs)

        # Handle cylinders sorting (in-memory, same as list method)
        ordering_param = request.query_params.get('ordering', '')
        if 'cylinders' in ordering_param:
            cylinders_sort = None
            if ordering_param.startswith('-cylinders') or ',-cylinders' in ordering_param:
                cylinders_sort = 'desc'
            elif 'cylinders' in ordering_param:
                cylinders_sort = 'asc'

            if cylinders_sort:
                all_items = list(qs)
                sorted_items = sorted(
                    all_items,
                    key=lambda obj: len(getattr(obj, 'prefetched_connections', [])),
                    reverse=(cylinders_sort == 'desc')
                )
                page = self.paginate_queryset(sorted_items)
                if page is not None:
                    return self.get_paginated_response(
                        ConsumerKYCListSerializer(page, many=True).data
                    )
                return Response(ConsumerKYCListSerializer(sorted_items, many=True).data)

        # Normal pagination
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
