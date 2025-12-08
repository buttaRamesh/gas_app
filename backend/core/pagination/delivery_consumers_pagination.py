from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class DeliveryPersonConsumersPagination(PageNumberPagination):
    """
    Custom pagination for delivery person consumers endpoint.
    Includes delivery person info at root level along with paginated consumers.
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 200

    def get_paginated_response(self, data):
        """
        Override to build custom response structure.
        Receives serialized data and reformats with pagination links.
        """
        # Pop consumers before building response
        consumers = data.pop('consumers', [])
        return Response({
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            **data,
            'consumers': consumers,
        })
