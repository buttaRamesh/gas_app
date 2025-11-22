"""
Utility functions for RBAC auto-discovery
"""
from django.apps import apps
from django.conf import settings


def discover_resources_from_models():
    """
    Auto-discover resources from Django models.

    Returns:
        list: List of dictionaries with resource information
        [
            {
                'name': 'consumers',
                'display_name': 'Consumers',
                'description': 'Consumer records',
                'app_label': 'consumers',
                'model_name': 'Consumer',
                'is_model_based': True
            },
            ...
        ]
    """
    resources = []

    # Apps to exclude from auto-discovery
    excluded_apps = [
        'admin',
        'auth',
        'contenttypes',
        'sessions',
        'messages',
        'staticfiles',
        'rest_framework',
        'corsheaders',
        'django_extensions',
    ]

    # Models to exclude (RBAC internal models only)
    excluded_models = [
        'Role',
        'Permission',
        'UserRole',
        'RolePermission',
        'Resource',  # Don't create permissions for RBAC tables themselves
        'LogEntry',
        'Session',
        'ContentType',
    ]
    # Note: User model is NOT excluded - we need 'users' resource for user management

    # Get all installed apps
    for app_config in apps.get_app_configs():
        app_label = app_config.label

        # Skip excluded apps
        if app_label in excluded_apps:
            continue

        # Get all models for this app
        for model in app_config.get_models():
            model_name = model.__name__

            # Skip excluded models
            if model_name in excluded_models:
                continue

            # Get verbose_name_plural for display name
            display_name = model._meta.verbose_name_plural.title()

            # Generate resource name from verbose_name_plural
            # Convert to lowercase with underscores (slug format)
            # e.g., "Route Areas" -> "route_areas", "Consumers" -> "consumers"
            resource_name = model._meta.verbose_name_plural.lower().replace(' ', '_').replace('-', '_')

            # Get model docstring as description
            description = model.__doc__.strip() if model.__doc__ else f"Manage {display_name}"

            resources.append({
                'name': resource_name,
                'display_name': display_name,
                'description': description,
                'app_label': app_label,
                'model_name': model_name,
                'is_model_based': True,
                'is_active': True,
            })

    # Add non-model resources (custom features)
    # Note: roles resource is added here since Role model is excluded from auto-discovery
    custom_resources = [
        {
            'name': 'roles',
            'display_name': 'Roles',
            'description': 'Manage user roles and permissions',
            'app_label': 'authentication',
            'model_name': 'Role',
            'is_model_based': True,  # Treat like a model for full CRUD permissions
            'is_active': True,
        },
        {
            'name': 'lookups',
            'display_name': 'Lookups',
            'description': 'Manage system lookup tables (DCT types, market types, consumer categories, etc.)',
            'app_label': 'lookups',
            'model_name': '',
            'is_model_based': True,  # Treat like a model for full CRUD permissions
            'is_active': True,
        },
        {
            'name': 'statistics',
            'display_name': 'Statistics',
            'description': 'View and export system statistics and reports',
            'app_label': '',
            'model_name': '',
            'is_model_based': False,
            'is_active': True,
        },
        {
            'name': 'logs',
            'display_name': 'Logs',
            'description': 'View system logs and audit trails',
            'app_label': '',
            'model_name': '',
            'is_model_based': False,
            'is_active': True,
        },
        {
            'name': 'reports',
            'display_name': 'Reports',
            'description': 'Generate and export reports',
            'app_label': '',
            'model_name': '',
            'is_model_based': False,
            'is_active': True,
        },
        {
            'name': 'dashboard',
            'display_name': 'Dashboard',
            'description': 'Access dashboard and analytics',
            'app_label': '',
            'model_name': '',
            'is_model_based': False,
            'is_active': True,
        },
    ]

    resources.extend(custom_resources)

    return resources


def get_default_actions_for_resource(resource_name, is_model_based=True):
    """
    Get default actions for a resource.

    Args:
        resource_name: Name of the resource
        is_model_based: Whether this resource is model-based

    Returns:
        list: List of action names
    """
    if is_model_based:
        # Model-based resources get full CRUD + export
        return ['view', 'create', 'edit', 'delete', 'export']
    else:
        # Non-model resources typically just need view and export
        return ['view', 'export']
