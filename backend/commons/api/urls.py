from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AddressViewSet,
    ContactViewSet,
    FamilyDetailsViewSet,
    IdentificationViewSet,
    PersonViewSet,
)

router = DefaultRouter()
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'contacts', ContactViewSet, basename='contact')
router.register(r'family-details', FamilyDetailsViewSet, basename='family-details')
router.register(r'identifications', IdentificationViewSet, basename='identification')
router.register(r'persons', PersonViewSet, basename='person')

urlpatterns = [
    path('', include(router.urls)),
]
