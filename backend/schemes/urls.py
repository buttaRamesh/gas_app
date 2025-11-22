from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SchemeViewSet, SubsidyDetailsViewSet

router = DefaultRouter()
router.register(r'schemes', SchemeViewSet, basename='scheme')
router.register(r'subsidy-details', SubsidyDetailsViewSet, basename='subsidy-details')

urlpatterns = [
    path('', include(router.urls)),
]
