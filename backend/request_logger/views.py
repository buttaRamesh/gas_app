from rest_framework import generics
from .models import APILog, APIErrorLog
from .serializers import APILogSerializer, APIErrorLogSerializer


class APILogListView(generics.ListAPIView):
    queryset = APILog.objects.all().order_by("-timestamp")
    serializer_class = APILogSerializer


class APIErrorLogListView(generics.ListAPIView):
    queryset = APIErrorLog.objects.all().order_by("-timestamp")
    serializer_class = APIErrorLogSerializer
