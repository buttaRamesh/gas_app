# File: consumers/urls.py
from django.urls import path, include

urlpatterns = [
    path('', include('consumers.api.urls')),
]