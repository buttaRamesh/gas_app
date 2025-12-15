"""
Export Validation Module - Request validation and field filtering.

Centralizes validation logic for export requests to reduce code duplication
and improve maintainability.
"""
from rest_framework.response import Response
from rest_framework import status as http_status


def validate_export_request(request_data, config):
    """
    Validate export request data.

    Args:
        request_data: Request data dictionary
        config: Resource configuration dictionary

    Returns:
        Tuple of (valid_fields, error_response)
        - If validation passes: (list of valid fields, None)
        - If validation fails: (None, Response with error)
    """
    visible_fields = request_data.get('visible_fields', [])
    allowed_fields = config['allowed_fields']

    # Validate visible fields
    valid_fields = [f for f in visible_fields if f in allowed_fields]

    if not valid_fields:
        return None, Response(
            {'error': 'No valid fields specified', 'allowed_fields': allowed_fields},
            status=http_status.HTTP_400_BAD_REQUEST
        )

    return valid_fields, None


def validate_resource(resource_name):
    """
    Validate that the resource exists in configuration.

    Args:
        resource_name: Name of the resource to validate

    Returns:
        Tuple of (config, error_response)
        - If valid: (resource config dict, None)
        - If invalid: (None, Response with error)
    """
    from .resources import get_resource_config

    if not resource_name:
        return None, Response(
            {'error': 'Missing required parameter: resource'},
            status=http_status.HTTP_400_BAD_REQUEST
        )

    try:
        config = get_resource_config(resource_name)
        return config, None
    except KeyError as e:
        return None, Response(
            {'error': str(e)},
            status=http_status.HTTP_404_NOT_FOUND
        )


def validate_export_format(export_format, allowed_formats):
    """
    Validate export format.

    Args:
        export_format: Requested export format
        allowed_formats: List of allowed format strings

    Returns:
        Response with error if invalid, None if valid
    """
    if export_format not in allowed_formats:
        return Response(
            {'error': f'Invalid export_format: {export_format}. Must be one of: {", ".join(allowed_formats)}'},
            status=http_status.HTTP_400_BAD_REQUEST
        )
    return None
