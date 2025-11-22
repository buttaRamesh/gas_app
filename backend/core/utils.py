"""
Common utility functions for the backend
"""
from rest_framework import status
from rest_framework.response import Response
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError
from typing import Dict, Any, Optional, List
import logging

logger = logging.getLogger(__name__)


def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = status.HTTP_200_OK
) -> Response:
    """
    Standardized success response

    Args:
        data: Response data
        message: Success message
        status_code: HTTP status code

    Returns:
        Response object
    """
    response_data = {
        'success': True,
        'message': message,
    }

    if data is not None:
        response_data['data'] = data

    return Response(response_data, status=status_code)


def error_response(
    message: str = "An error occurred",
    errors: Optional[Dict[str, Any]] = None,
    status_code: int = status.HTTP_400_BAD_REQUEST
) -> Response:
    """
    Standardized error response

    Args:
        message: Error message
        errors: Detailed errors dictionary
        status_code: HTTP status code

    Returns:
        Response object
    """
    response_data = {
        'success': False,
        'message': message,
    }

    if errors:
        response_data['errors'] = errors

    return Response(response_data, status=status_code)


def paginated_response(
    queryset,
    serializer_class,
    request,
    extra_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Helper function to create paginated response

    Args:
        queryset: Django queryset to paginate
        serializer_class: Serializer class to use
        request: Request object
        extra_data: Additional data to include in response

    Returns:
        Dictionary with paginated data
    """
    from rest_framework.pagination import PageNumberPagination

    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(queryset, request)

    if page is not None:
        serializer = serializer_class(page, many=True)
        response_data = {
            'count': paginator.page.paginator.count,
            'next': paginator.get_next_link(),
            'previous': paginator.get_previous_link(),
            'results': serializer.data,
        }
    else:
        serializer = serializer_class(queryset, many=True)
        response_data = {
            'count': queryset.count(),
            'results': serializer.data,
        }

    if extra_data:
        response_data.update(extra_data)

    return response_data


def validate_required_fields(data: Dict[str, Any], required_fields: List[str]) -> None:
    """
    Validate that required fields are present in data

    Args:
        data: Data dictionary to validate
        required_fields: List of required field names

    Raises:
        DRFValidationError: If any required field is missing
    """
    missing_fields = [field for field in required_fields if field not in data or not data[field]]

    if missing_fields:
        raise DRFValidationError({
            field: f"{field} is required" for field in missing_fields
        })


def validate_positive_number(value: float, field_name: str = "value") -> None:
    """
    Validate that a number is positive

    Args:
        value: Number to validate
        field_name: Name of the field (for error message)

    Raises:
        DRFValidationError: If value is not positive
    """
    if value <= 0:
        raise DRFValidationError({
            field_name: f"{field_name} must be a positive number"
        })


def validate_date_range(start_date, end_date) -> None:
    """
    Validate that end_date is after start_date

    Args:
        start_date: Start date
        end_date: End date

    Raises:
        DRFValidationError: If date range is invalid
    """
    if end_date < start_date:
        raise DRFValidationError({
            'date_range': 'End date must be after start date'
        })


def safe_delete(instance, user=None) -> Dict[str, Any]:
    """
    Safely delete an instance with proper error handling

    Args:
        instance: Model instance to delete
        user: User performing the deletion (optional)

    Returns:
        Dictionary with deletion result
    """
    try:
        model_name = instance.__class__.__name__
        instance_id = instance.pk

        if hasattr(instance, 'is_active'):
            # Soft delete
            instance.is_active = False
            if user and hasattr(instance, 'updated_by'):
                instance.updated_by = user
            instance.save()
            action = 'deactivated'
        else:
            # Hard delete
            instance.delete()
            action = 'deleted'

        logger.info(f"{model_name} {instance_id} {action} by {user.employee_id if user else 'system'}")

        return {
            'success': True,
            'message': f'{model_name} {action} successfully',
            'action': action
        }

    except Exception as e:
        logger.error(f"Error deleting {instance.__class__.__name__} {instance.pk}: {str(e)}")
        return {
            'success': False,
            'message': str(e),
            'action': 'failed'
        }


def get_or_error(model, lookup_field: str, lookup_value: Any, error_message: Optional[str] = None):
    """
    Get object or return error response

    Args:
        model: Django model class
        lookup_field: Field name to lookup
        lookup_value: Value to search for
        error_message: Custom error message

    Returns:
        Model instance or raises ValidationError

    Raises:
        DRFValidationError: If object not found
    """
    try:
        return model.objects.get(**{lookup_field: lookup_value})
    except model.DoesNotExist:
        if not error_message:
            error_message = f"{model.__name__} not found with {lookup_field}={lookup_value}"
        raise DRFValidationError({lookup_field: error_message})


def bulk_update_or_create(model, data_list: List[Dict], unique_fields: List[str], user=None):
    """
    Bulk update or create objects

    Args:
        model: Django model class
        data_list: List of dictionaries with object data
        unique_fields: Fields that uniquely identify each object
        user: User performing the operation

    Returns:
        Dictionary with results
    """
    created = []
    updated = []
    errors = []

    for idx, data in enumerate(data_list):
        try:
            # Build lookup kwargs from unique fields
            lookup_kwargs = {field: data.get(field) for field in unique_fields if field in data}

            if not lookup_kwargs:
                errors.append({
                    'index': idx,
                    'error': f'Missing unique fields: {unique_fields}'
                })
                continue

            # Try to get existing object
            try:
                obj = model.objects.get(**lookup_kwargs)
                # Update existing
                for key, value in data.items():
                    setattr(obj, key, value)

                if user and hasattr(obj, 'updated_by'):
                    obj.updated_by = user

                obj.save()
                updated.append(obj)

            except model.DoesNotExist:
                # Create new
                if user and hasattr(model, 'created_by'):
                    data['created_by'] = user

                obj = model.objects.create(**data)
                created.append(obj)

        except Exception as e:
            errors.append({
                'index': idx,
                'data': data,
                'error': str(e)
            })

    return {
        'created_count': len(created),
        'updated_count': len(updated),
        'error_count': len(errors),
        'created': created,
        'updated': updated,
        'errors': errors
    }


def sanitize_search_query(query: str) -> str:
    """
    Sanitize search query to prevent SQL injection

    Args:
        query: Search query string

    Returns:
        Sanitized query string
    """
    # Remove potentially dangerous characters
    dangerous_chars = [';', '--', '/*', '*/', 'xp_', 'sp_']

    for char in dangerous_chars:
        query = query.replace(char, '')

    return query.strip()
