from rest_framework.pagination import PageNumberPagination


class CustomPageNumberPagination(PageNumberPagination):
    """
    Custom pagination class that allows client to control page size
    """
    page_size = 20  # Default page size
    page_size_query_param = 'page_size'  # Allow client to override page size using ?page_size=X
    max_page_size = 1000  # Maximum allowed page size
