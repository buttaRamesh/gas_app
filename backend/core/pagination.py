"""
Custom pagination classes for the application.
"""
from rest_framework.pagination import PageNumberPagination


class CustomPageNumberPagination(PageNumberPagination):
    """
    Custom pagination class that allows clients to control the page size
    via the 'page_size' query parameter.

    Usage:
        GET /api/endpoint/?page=1&page_size=10

    The page_size parameter can be set to any value between 1 and max_page_size.
    If not provided, it defaults to the PAGE_SIZE setting.
    """
    page_size = 20  # Default page size
    page_size_query_param = 'page_size'  # Allow client to override page size
    max_page_size = 10000  # Maximum allowed page size (supports full exports)
