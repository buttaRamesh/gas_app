from django.urls import path
from .views import APILogListView, APIErrorLogListView

urlpatterns = [
    path("logs/", APILogListView.as_view(), name="api-logs"),
    path("errors/", APIErrorLogListView.as_view(), name="api-error-logs"),
]
