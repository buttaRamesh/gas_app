"""
Custom exception handlers and exceptions
"""
from rest_framework.views import exception_handler
from rest_framework.exceptions import APIException
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
import logging

logger = logging.getLogger(__name__)


class BusinessLogicError(APIException):
    """
    Exception for business logic violations
    """
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Business logic error occurred'
    default_code = 'business_logic_error'


class ResourceNotFoundError(APIException):
    """
    Exception for resource not found
    """
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Resource not found'
    default_code = 'not_found'


class PermissionDeniedError(APIException):
    """
    Exception for permission denied
    """
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'You do not have permission to perform this action'
    default_code = 'permission_denied'


class DuplicateResourceError(APIException):
    """
    Exception for duplicate resource creation
    """
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Resource already exists'
    default_code = 'duplicate_resource'


class InvalidOperationError(APIException):
    """
    Exception for invalid operations
    """
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid operation'
    default_code = 'invalid_operation'


def custom_exception_handler(exc, context):
    """
    Custom exception handler to provide consistent error responses

    Args:
        exc: The exception raised
        context: Context in which the exception was raised

    Returns:
        Response with standardized error format
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    # Log the exception
    if response is not None:
        log_message = f"Exception in {context.get('view', 'Unknown').__class__.__name__}: {str(exc)}"

        if response.status_code >= 500:
            logger.error(log_message, exc_info=True)
        else:
            logger.warning(log_message)

    # Handle Django ValidationError
    if isinstance(exc, DjangoValidationError):
        if hasattr(exc, 'message_dict'):
            errors = exc.message_dict
        elif hasattr(exc, 'messages'):
            errors = {'non_field_errors': exc.messages}
        else:
            errors = {'non_field_errors': [str(exc)]}

        response_data = {
            'success': False,
            'message': 'Validation error',
            'errors': errors
        }

        from rest_framework.response import Response
        return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

    # Handle IntegrityError (database constraints)
    if isinstance(exc, IntegrityError):
        logger.error(f"IntegrityError: {str(exc)}", exc_info=True)

        response_data = {
            'success': False,
            'message': 'Database integrity error',
            'errors': {'database': 'A database constraint was violated. This might be due to duplicate data or foreign key constraints.'}
        }

        from rest_framework.response import Response
        return Response(response_data, status=status.HTTP_409_CONFLICT)

    # Standardize response format for DRF exceptions
    if response is not None:
        custom_response_data = {
            'success': False,
            'message': 'An error occurred',
        }

        # Extract error message
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                custom_response_data['message'] = response.data['detail']
                del response.data['detail']

            if response.data:
                custom_response_data['errors'] = response.data
        elif isinstance(response.data, list):
            custom_response_data['message'] = response.data[0] if response.data else 'An error occurred'
        else:
            custom_response_data['message'] = str(response.data)

        response.data = custom_response_data

    return response


# Error messages constants
ERROR_MESSAGES = {
    'REQUIRED_FIELD': '{field} is required',
    'INVALID_FORMAT': '{field} has invalid format',
    'NOT_FOUND': '{resource} not found',
    'ALREADY_EXISTS': '{resource} already exists',
    'PERMISSION_DENIED': 'You do not have permission to {action} {resource}',
    'INVALID_OPERATION': 'Cannot {action} {resource} in current state',
    'INVALID_VALUE': '{field} has invalid value: {value}',
    'MIN_VALUE': '{field} must be at least {min_value}',
    'MAX_VALUE': '{field} cannot exceed {max_value}',
    'MIN_LENGTH': '{field} must be at least {min_length} characters',
    'MAX_LENGTH': '{field} cannot exceed {max_length} characters',
    'UNIQUE_CONSTRAINT': '{field} must be unique',
    'FOREIGN_KEY_CONSTRAINT': 'Cannot delete {resource} because it is referenced by other records',
}


def get_error_message(key: str, **kwargs) -> str:
    """
    Get formatted error message from ERROR_MESSAGES

    Args:
        key: Error message key
        **kwargs: Format parameters

    Returns:
        Formatted error message
    """
    template = ERROR_MESSAGES.get(key, 'An error occurred')
    return template.format(**kwargs)
