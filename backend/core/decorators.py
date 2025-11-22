"""
Custom decorators for views and methods
"""
from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
from django.db import transaction
import logging
import time

logger = logging.getLogger(__name__)


def log_execution_time(func):
    """
    Decorator to log execution time of a function
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        duration = time.time() - start_time
        logger.info(f"{func.__name__} executed in {duration:.2f}s")
        return result
    return wrapper


def cache_response(timeout=300):
    """
    Decorator to cache view responses

    Args:
        timeout: Cache timeout in seconds (default: 5 minutes)
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            # Generate cache key based on view name, user, and query params
            user_id = request.user.id if request.user.is_authenticated else 'anonymous'
            query_string = request.META.get('QUERY_STRING', '')
            cache_key = f"view_cache:{func.__name__}:{user_id}:{query_string}"

            # Check cache
            cached_response = cache.get(cache_key)
            if cached_response is not None:
                logger.debug(f"Cache hit for {cache_key}")
                return cached_response

            # Execute view
            response = func(self, request, *args, **kwargs)

            # Cache successful responses only
            if response.status_code == 200:
                cache.set(cache_key, response, timeout)
                logger.debug(f"Cached response for {cache_key}")

            return response
        return wrapper
    return decorator


def require_permission(resource, action):
    """
    Decorator to check if user has specific permission

    Args:
        resource: Resource name (e.g., 'products')
        action: Action name (e.g., 'view', 'create')
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            if not hasattr(request.user, 'has_permission'):
                return Response({
                    'success': False,
                    'message': 'Permission checking not available'
                }, status=status.HTTP_403_FORBIDDEN)

            if not request.user.has_permission(resource, action):
                logger.warning(
                    f"Permission denied: {request.user.employee_id} "
                    f"attempted {action} on {resource}"
                )
                return Response({
                    'success': False,
                    'message': f'You do not have permission to {action} {resource}'
                }, status=status.HTTP_403_FORBIDDEN)

            return func(self, request, *args, **kwargs)
        return wrapper
    return decorator


def atomic_transaction(func):
    """
    Decorator to wrap function in atomic database transaction
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        with transaction.atomic():
            return func(*args, **kwargs)
    return wrapper


def retry_on_failure(max_retries=3, delay=1):
    """
    Decorator to retry function on failure

    Args:
        max_retries: Maximum number of retry attempts
        delay: Delay between retries in seconds
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        logger.error(f"{func.__name__} failed after {max_retries} attempts: {str(e)}")
                        raise
                    logger.warning(f"{func.__name__} attempt {attempt + 1} failed, retrying...")
                    time.sleep(delay * (attempt + 1))  # Exponential backoff
            return None
        return wrapper
    return decorator


def validate_request_data(*required_fields):
    """
    Decorator to validate request data contains required fields

    Args:
        *required_fields: Required field names
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            missing_fields = [
                field for field in required_fields
                if field not in request.data or not request.data[field]
            ]

            if missing_fields:
                return Response({
                    'success': False,
                    'message': 'Missing required fields',
                    'errors': {field: f"{field} is required" for field in missing_fields}
                }, status=status.HTTP_400_BAD_REQUEST)

            return func(self, request, *args, **kwargs)
        return wrapper
    return decorator


def admin_only(func):
    """
    Decorator to restrict access to admin users only
    """
    @wraps(func)
    def wrapper(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({
                'success': False,
                'message': 'Authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)

        if not request.user.is_superuser:
            logger.warning(f"Admin-only access denied for {request.user.employee_id}")
            return Response({
                'success': False,
                'message': 'Admin access required'
            }, status=status.HTTP_403_FORBIDDEN)

        return func(self, request, *args, **kwargs)
    return wrapper


def rate_limit(max_requests=10, time_window=60):
    """
    Decorator to implement rate limiting for specific views

    Args:
        max_requests: Maximum number of requests allowed
        time_window: Time window in seconds
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            # Get identifier
            if request.user.is_authenticated:
                identifier = f"user:{request.user.id}"
            else:
                ip = request.META.get('REMOTE_ADDR', 'unknown')
                identifier = f"ip:{ip}"

            # Check rate limit
            cache_key = f"rate_limit:{func.__name__}:{identifier}"
            request_count = cache.get(cache_key, 0)

            if request_count >= max_requests:
                logger.warning(f"Rate limit exceeded for {identifier} on {func.__name__}")
                return Response({
                    'success': False,
                    'message': 'Rate limit exceeded. Please try again later.'
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)

            # Increment counter
            cache.set(cache_key, request_count + 1, time_window)

            return func(self, request, *args, **kwargs)
        return wrapper
    return decorator


def log_action(action_name):
    """
    Decorator to log user actions

    Args:
        action_name: Name of the action being performed
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            user = request.user.employee_id if request.user.is_authenticated else 'Anonymous'
            logger.info(f"Action: {action_name} by {user}")

            result = func(self, request, *args, **kwargs)

            if hasattr(result, 'status_code'):
                if result.status_code < 400:
                    logger.info(f"Action {action_name} completed successfully by {user}")
                else:
                    logger.warning(f"Action {action_name} failed with status {result.status_code} for {user}")

            return result
        return wrapper
    return decorator


def deprecated(replacement=None):
    """
    Decorator to mark views as deprecated

    Args:
        replacement: Name of replacement view/method
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            message = f"{func.__name__} is deprecated"
            if replacement:
                message += f". Use {replacement} instead"

            logger.warning(message)

            result = func(*args, **kwargs)

            # Add deprecation header to response
            if hasattr(result, '__setitem__'):
                result['X-Deprecated'] = 'true'
                if replacement:
                    result['X-Replacement'] = replacement

            return result
        return wrapper
    return decorator


def require_https(func):
    """
    Decorator to require HTTPS for sensitive operations
    """
    @wraps(func)
    def wrapper(self, request, *args, **kwargs):
        if not request.is_secure() and not settings.DEBUG:
            return Response({
                'success': False,
                'message': 'HTTPS required for this operation'
            }, status=status.HTTP_403_FORBIDDEN)

        return func(self, request, *args, **kwargs)
    return wrapper


# Import settings at the end
from django.conf import settings
