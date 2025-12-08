from rest_framework import viewsets, filters
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

 
# -----------------------------------------------------------
# PRODUCT CATEGORY VIEWSET
# -----------------------------------------------------------

class ProductCategoryViewSet(viewsets.ModelViewSet):
    """
    CRUD for Product Categories (Cylinder, Regulators, Stoves, Accessories etc.)
    """
    queryset = ProductCategory.objects.all().order_by("name")
    serializer_class = ProductCategorySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "description"]


# -----------------------------------------------------------
# UNIT VIEWSET
# -----------------------------------------------------------

class UnitViewSet(viewsets.ModelViewSet):
    """
    CRUD for measurement units (NOS, KG, LTR etc.)
    """
    queryset = Unit.objects.all().order_by("short_name")
    serializer_class = UnitSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["short_name", "description"]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related(
        "category",
        "unit",
    ).all().order_by("category__name", "name")

    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "product_code"]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ProductWriteSerializer
        return ProductSerializer
