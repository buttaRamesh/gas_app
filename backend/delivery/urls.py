"""
Delivery app URL Configuration

This file serves as the main entry point for delivery app URLs.
All actual URL patterns are defined in delivery/api/urls.py

Project-level inclusion:
    path('api/', include('delivery.urls'))

This creates endpoints like:
    - /api/delivery-person/
    - /api/delivery-run/
    - /api/delivery-record/
    - /api/delivery-run/<run_id>/load/
    - /api/delivery-reconcile/
    - /api/delivery-summary/
"""
from django.urls import path, include

urlpatterns = [
    path('', include('delivery.api.urls')),
]
