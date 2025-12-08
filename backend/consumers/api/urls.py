# File: consumers/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from consumers.api.views import ConsumerViewSet

router = DefaultRouter()
router.register(r'consumers', ConsumerViewSet, basename='consumer')

urlpatterns = [
    path('', include(router.urls)),
]

"""
/api/consumers/                     → list
/api/consumers/<id>/                → retrieve
/api/consumers/kyc/                 → custom list (KYC)
/api/consumers/<id>/enable-kyc/     → custom patch

"""
