from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class DefaultPagination(PageNumberPagination):
    """
    Global reusable pagination class
    Used across all viewsets (unless overridden)
    """

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 200

    def get_paginated_response(self, data):
        return Response({
            "count": self.page.paginator.count,
            "page": self.page.number,
            "page_size": self.get_page_size(self.request),
            "results": data
        })



class CustomPageNumberPagination(PageNumberPagination):
    """
    Custom pagination class that allows client to control page size
    """
    page_size = 20  # Default page size
    page_size_query_param = 'page_size'  # Allow client to override page size using ?page_size=X
    max_page_size = 1000  # Maximum allowed page size
