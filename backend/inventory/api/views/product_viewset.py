from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from core.filters import DataGridFilterBackend

from inventory.models import (
    Product,
    ProductCategory,
    Unit,
)

from inventory.api.serializers.product_serializers import (
    ProductSerializer,
    ProductWriteSerializer,
    ProductCategorySerializer,
    UnitSerializer,
)

from inventory.api.filters.product_filters import ProductFilter
from inventory.api.filters.category_filters import ProductCategoryFilter
from inventory.api.filters.unit_filters import UnitFilter

 
# -----------------------------------------------------------
# PRODUCT CATEGORY VIEWSET
# -----------------------------------------------------------

class ProductCategoryViewSet(viewsets.ModelViewSet):
    """
    CRUD for Product Categories (Cylinder, Regulators, Stoves, Accessories etc.)
    """
    queryset = ProductCategory.objects.all().order_by("name")
    serializer_class = ProductCategorySerializer
    filter_backends = [DataGridFilterBackend, DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductCategoryFilter
    search_fields = ["name", "description"]
    ordering_fields = ["name", "is_active", "description", "id"]


# -----------------------------------------------------------
# UNIT VIEWSET
# -----------------------------------------------------------

class UnitViewSet(viewsets.ModelViewSet):
    """
    CRUD for measurement units (NOS, KG, LTR etc.)
    """
    queryset = Unit.objects.all().order_by("short_name")
    serializer_class = UnitSerializer
    filter_backends = [DataGridFilterBackend, DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = UnitFilter
    search_fields = ["short_name", "description"]
    ordering_fields = ["short_name", "is_active", "description", "id"]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related(
        "category",
        "unit",
    ).all().order_by("category__name", "name")

    filter_backends = [DataGridFilterBackend, DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ["name", "product_code", "category__name", "unit__short_name"]
    ordering_fields = ["name", "product_code", "category__name", "unit__short_name", "is_active", "created_at"]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ProductWriteSerializer
        return ProductSerializer
