"""
Custom hooks for drf-spectacular to filter API documentation.

This module provides preprocessing hooks to control which endpoints
are included in the Swagger/OpenAPI documentation.
"""


def filter_endpoints_by_app(endpoints):
    """
    Filter endpoints to only include specific apps.

    Currently configured to show only:
    - consumers
    - routes

    To add more apps, update the ALLOWED_APPS list.

    Args:
        endpoints: List of (path, path_regex, method, callback) tuples

    Returns:
        Filtered list of endpoints
    """
    # Define which apps to include in documentation
    ALLOWED_APPS = [
        'consumers',
        'routes',
    ]

    filtered = []

    for path, path_regex, method, callback in endpoints:
        # Check if the endpoint belongs to an allowed app
        include_endpoint = False

        # Check by URL path
        for app in ALLOWED_APPS:
            if f'/api/{app}' in path or f'/{app}/' in path:
                include_endpoint = True
                break

        # Also check by callback module if available
        if hasattr(callback, 'cls'):
            module = callback.cls.__module__
            for app in ALLOWED_APPS:
                if f'{app}.' in module or module.startswith(app):
                    include_endpoint = True
                    break

        if include_endpoint:
            filtered.append((path, path_regex, method, callback))

    return filtered


def customize_schema(result, generator, request, public):
    """
    Customize the generated OpenAPI schema.

    This hook runs after the schema is generated and can be used
    to modify the schema structure, add custom descriptions, etc.

    Args:
        result: The generated OpenAPI schema dict
        generator: The SchemaGenerator instance
        request: The request object (if available)
        public: Boolean indicating if this is a public schema

    Returns:
        Modified schema dict
    """
    # Add custom description highlighting which apps are documented
    if 'info' in result:
        result['info']['description'] = """
API documentation for Gas App - a comprehensive gas distribution management system.

**Currently Documenting:**
- 🛒 **Consumers API** - Consumer management, registration, and tracking
- 🗺️ **Routes API** - Route management, assignments, and optimization

*Other APIs will be added incrementally as the codebase is reorganized.*
        """.strip()

    # Add tags for better organization
    if 'tags' not in result:
        result['tags'] = []

    # Define tags for the documented apps
    tags = [
        {
            'name': 'consumers',
            'description': 'Consumer management endpoints - create, update, and manage gas consumers'
        },
        {
            'name': 'routes',
            'description': 'Route management endpoints - manage delivery routes and assignments'
        },
    ]

    # Add tags if they don't exist
    existing_tag_names = {tag['name'] for tag in result.get('tags', [])}
    for tag in tags:
        if tag['name'] not in existing_tag_names:
            result['tags'].append(tag)

    return result
