from rest_framework.permissions import BasePermission
from functools import wraps
from rest_framework.exceptions import PermissionDenied


# ============================================
# LEGACY ROLE-BASED PERMISSION CLASSES
# (Keep for backward compatibility)
# ============================================

class IsAdmin(BasePermission):
    """Permission class for admin-only access"""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.has_any_role('admin')


class IsManagerOrAbove(BasePermission):
    """Permission class for manager and admin access"""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.has_any_role('admin', 'manager')


class IsStaffOrAbove(BasePermission):
    """Permission class for staff, manager, and admin access"""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.has_any_role('admin', 'manager', 'staff')


class IsAuthenticatedUser(BasePermission):
    """Permission class for any authenticated user"""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


# ============================================
# NEW RBAC PERMISSION CLASSES
# ============================================

class HasPermission(BasePermission):
    """
    Permission class that checks if user has specific permission.

    Usage:
        class MyViewSet(viewsets.ModelViewSet):
            permission_classes = [HasPermission]
            required_resource = 'consumers'
            required_action = 'view'  # or 'create', 'edit', 'delete', 'export'
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        resource = getattr(view, 'required_resource', None)
        action = getattr(view, 'required_action', None)

        if not resource or not action:
            # If not specified, allow access (or you could deny)
            return True

        return request.user.has_permission(resource, action)


class HasAnyPermission(BasePermission):
    """
    Permission class that checks if user has any of the specified permissions.

    Usage:
        class MyViewSet(viewsets.ModelViewSet):
            permission_classes = [HasAnyPermission]
            required_permissions = [
                ('consumers', 'view'),
                ('consumers', 'edit'),
            ]
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        required_permissions = getattr(view, 'required_permissions', [])
        if not required_permissions:
            return True

        for resource, action in required_permissions:
            if request.user.has_permission(resource, action):
                return True

        return False


class HasAllPermissions(BasePermission):
    """
    Permission class that checks if user has all of the specified permissions.

    Usage:
        class MyViewSet(viewsets.ModelViewSet):
            permission_classes = [HasAllPermissions]
            required_permissions = [
                ('consumers', 'view'),
                ('routes', 'view'),
            ]
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        required_permissions = getattr(view, 'required_permissions', [])
        if not required_permissions:
            return True

        for resource, action in required_permissions:
            if not request.user.has_permission(resource, action):
                return False

        return True


class HasResourcePermission(BasePermission):
    """
    Permission class that automatically determines required permission
    based on HTTP method and view resource.

    Usage:
        class ConsumersViewSet(viewsets.ModelViewSet):
            permission_classes = [HasResourcePermission]
            resource_name = 'consumers'
    """

    # Map HTTP methods to actions
    METHOD_ACTION_MAP = {
        'GET': 'view',
        'POST': 'create',
        'PUT': 'edit',
        'PATCH': 'edit',
        'DELETE': 'delete',
    }

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        resource = getattr(view, 'resource_name', None)
        if not resource:
            return True

        action = self.METHOD_ACTION_MAP.get(request.method, 'view')
        return request.user.has_permission(resource, action)


# ============================================
# DECORATOR FOR FUNCTION-BASED VIEWS
# ============================================

def require_permission(resource, action):
    """
    Decorator to require specific permission for function-based views.

    Usage:
        @require_permission('consumers', 'create')
        @api_view(['POST'])
        def create_consumer(request):
            # Only users with consumers.create permission can access
            pass
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            if not request.user or not request.user.is_authenticated:
                raise PermissionDenied("Authentication required")

            if not request.user.has_permission(resource, action):
                raise PermissionDenied(
                    f"You don't have permission to {action} {resource}"
                )

            return view_func(request, *args, **kwargs)
        return wrapped_view
    return decorator


def require_any_permission(*permissions):
    """
    Decorator to require any of the specified permissions.

    Usage:
        @require_any_permission(
            ('consumers', 'view'),
            ('consumers', 'edit')
        )
        @api_view(['GET'])
        def view_or_edit_consumer(request, pk):
            pass
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            if not request.user or not request.user.is_authenticated:
                raise PermissionDenied("Authentication required")

            for resource, action in permissions:
                if request.user.has_permission(resource, action):
                    return view_func(request, *args, **kwargs)

            raise PermissionDenied(
                "You don't have the required permissions to access this resource"
            )
        return wrapped_view
    return decorator


def require_all_permissions(*permissions):
    """
    Decorator to require all of the specified permissions.

    Usage:
        @require_all_permissions(
            ('consumers', 'view'),
            ('routes', 'view')
        )
        @api_view(['GET'])
        def consumer_route_report(request):
            pass
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            if not request.user or not request.user.is_authenticated:
                raise PermissionDenied("Authentication required")

            for resource, action in permissions:
                if not request.user.has_permission(resource, action):
                    raise PermissionDenied(
                        f"You don't have permission to {action} {resource}"
                    )

            return view_func(request, *args, **kwargs)
        return wrapped_view
    return decorator


def require_role(*role_names):
    """
    Decorator to require specific role(s).

    Usage:
        @require_role('admin', 'manager')
        @api_view(['GET'])
        def admin_or_manager_only(request):
            pass
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            if not request.user or not request.user.is_authenticated:
                raise PermissionDenied("Authentication required")

            if not request.user.has_any_role(*role_names):
                raise PermissionDenied(
                    f"You must have one of these roles: {', '.join(role_names)}"
                )

            return view_func(request, *args, **kwargs)
        return wrapped_view
    return decorator


# ============================================
# HELPER FUNCTIONS
# ============================================

def user_has_permission(user, resource, action):
    """
    Helper function to check if a user has a specific permission.

    Usage:
        if user_has_permission(request.user, 'consumers', 'create'):
            # Do something
    """
    if not user or not user.is_authenticated:
        return False
    return user.has_permission(resource, action)


def user_has_any_permission(user, *permissions):
    """
    Helper function to check if user has any of the specified permissions.

    Usage:
        if user_has_any_permission(
            request.user,
            ('consumers', 'view'),
            ('consumers', 'edit')
        ):
            # Do something
    """
    if not user or not user.is_authenticated:
        return False

    for resource, action in permissions:
        if user.has_permission(resource, action):
            return True
    return False


def user_has_all_permissions(user, *permissions):
    """
    Helper function to check if user has all of the specified permissions.

    Usage:
        if user_has_all_permissions(
            request.user,
            ('consumers', 'view'),
            ('routes', 'view')
        ):
            # Do something
    """
    if not user or not user.is_authenticated:
        return False

    for resource, action in permissions:
        if not user.has_permission(resource, action):
            return False
    return True


def user_has_role(user, *role_names):
    """
    Helper function to check if user has any of the specified roles.

    Usage:
        if user_has_role(request.user, 'admin', 'manager'):
            # Do something
    """
    if not user or not user.is_authenticated:
        return False
    return user.has_any_role(*role_names)
