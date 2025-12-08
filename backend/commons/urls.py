from django.urls import path, include

urlpatterns = [
    path('', include('commons.api.urls')),
]
