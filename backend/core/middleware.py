"""
Custom middleware for security, logging, and monitoring
"""
import time
import logging
import json
from django.utils import timezone
from django.core.cache import cache
from django.http import JsonResponse
from typing import Callable

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware:
    """
    Middleware to log all API requests and responses
    """

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request):
        # Skip logging for static files and admin
        if request.path.startswith('/static/') or request.path.startswith('/admin/'):
            return self.get_response(request)

        # Log request
        start_time = time.time()

        request_data = {
            'method': request.method,
            'path': request.path,
            'user': str(request.user) if request.user.is_authenticated else 'Anonymous',
            'ip': self.get_client_ip(request),
        }

        logger.info(f"Request: {request.method} {request.path} by {request_data['user']}")

        # Process request
        response = self.get_response(request)

        # Log response
        duration = time.time() - start_time
        logger.info(
            f"Response: {request.method} {request.path} - "
            f"Status: {response.status_code} - "
            f"Duration: {duration:.2f}s"
        )

        # Add processing time header
        response['X-Processing-Time'] = f"{duration:.2f}s"

        return response

    @staticmethod
    def get_client_ip(request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class RateLimitMiddleware:
    """
    Middleware to implement rate limiting per user/IP
    """

    def __init__(self, get_response: Callable):
        self.get_response = get_response
        self.rate_limit = 100  # requests per minute
        self.time_window = 60  # seconds

    def __call__(self, request):
        # Skip rate limiting for static files and admin
        if request.path.startswith('/static/') or request.path.startswith('/admin/'):
            return self.get_response(request)

        # Get identifier (user ID or IP)
        if request.user.is_authenticated:
            identifier = f"user:{request.user.id}"
        else:
            identifier = f"ip:{RequestLoggingMiddleware.get_client_ip(request)}"

        # Check rate limit
        cache_key = f"rate_limit:{identifier}"
        request_count = cache.get(cache_key, 0)

        if request_count >= self.rate_limit:
            logger.warning(f"Rate limit exceeded for {identifier}")
            return JsonResponse({
                'success': False,
                'message': 'Rate limit exceeded. Please try again later.',
                'error': 'too_many_requests'
            }, status=429)

        # Increment counter
        cache.set(cache_key, request_count + 1, self.time_window)

        return self.get_response(request)


class SecurityHeadersMiddleware:
    """
    Middleware to add security headers to responses
    """

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Add security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        # Only add HSTS in production
        if not settings.DEBUG:
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'

        return response


class APIVersionMiddleware:
    """
    Middleware to handle API versioning
    """

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request):
        # Extract API version from header or URL
        api_version = request.META.get('HTTP_API_VERSION', 'v1')
        request.api_version = api_version

        response = self.get_response(request)

        # Add API version to response
        response['API-Version'] = api_version

        return response


class RequestIDMiddleware:
    """
    Middleware to add unique request ID for tracking
    """

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request):
        import uuid

        # Generate unique request ID
        request_id = str(uuid.uuid4())
        request.request_id = request_id

        response = self.get_response(request)

        # Add request ID to response headers
        response['X-Request-ID'] = request_id

        return response


class ExceptionHandlingMiddleware:
    """
    Middleware to catch and handle unhandled exceptions
    """

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as e:
            logger.error(f"Unhandled exception: {str(e)}", exc_info=True)

            return JsonResponse({
                'success': False,
                'message': 'An internal server error occurred',
                'error': 'internal_server_error'
            }, status=500)


class CORSDebugMiddleware:
    """
    Middleware to help debug CORS issues in development
    """

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request):
        # Log CORS-related headers in development
        if settings.DEBUG:
            origin = request.META.get('HTTP_ORIGIN')
            if origin:
                logger.debug(f"CORS Request from origin: {origin}")

        return self.get_response(request)


class UserActivityMiddleware:
    """
    Middleware to track user activity and update last_login
    """

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Update user's last activity if authenticated
        if request.user.is_authenticated:
            # Update last_login field periodically (every 5 minutes)
            cache_key = f"user_activity:{request.user.id}"
            last_update = cache.get(cache_key)

            if not last_update:
                request.user.last_login = timezone.now()
                request.user.save(update_fields=['last_login'])
                cache.set(cache_key, True, 300)  # 5 minutes

        return response


# Import settings at the end to avoid circular imports
from django.conf import settings
