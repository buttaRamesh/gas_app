from rest_framework.routers import DefaultRouter
from order_book.views import (
    OrderBookViewSet,
    RefillTypeViewSet,
    DeliveryFlagViewSet,
    PaymentOptionViewSet,
    ColumnMappingViewSet,
    FieldConfigurationViewSet,
)

router = DefaultRouter()
router.register(r"orderbooks", OrderBookViewSet, basename="orderbook")
router.register(r"refill-types", RefillTypeViewSet, basename="refilltype")
router.register(r"delivery-flags", DeliveryFlagViewSet, basename="deliveryflag")
router.register(r"payment-options", PaymentOptionViewSet, basename="paymentoption")
router.register(r"column-mappings", ColumnMappingViewSet, basename="columnmapping")
router.register(r"field-configurations", FieldConfigurationViewSet, basename="fieldconfiguration")

urlpatterns = router.urls
