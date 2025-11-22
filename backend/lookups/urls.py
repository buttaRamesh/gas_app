from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DCTTypeViewSet,
    MarketTypeViewSet,
    ConnectionTypeViewSet,
    ConsumerCategoryViewSet,
    ConsumerTypeViewSet,
    BPLTypeViewSet
)

router = DefaultRouter()
router.register(r'dct-types', DCTTypeViewSet, basename='dct-type')
router.register(r'market-types', MarketTypeViewSet, basename='market-type')
router.register(r'connection-types', ConnectionTypeViewSet, basename='connection-type')
router.register(r'consumer-categories', ConsumerCategoryViewSet, basename='consumer-category')
router.register(r'consumer-types', ConsumerTypeViewSet, basename='consumer-type')
router.register(r'bpl-types', BPLTypeViewSet, basename='bpl-type')

urlpatterns = [
    path('', include(router.urls)),
]
