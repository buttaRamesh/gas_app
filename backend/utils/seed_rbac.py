"""
Standalone script to seed RBAC data (roles, permissions, resources).
Performs auto-discovery of resources from Django models.

Usage:
    python seed_rbac.py                 # Full seeding with auto-discovery
    python seed_rbac.py --skip-discovery # Skip resource auto-discovery

Run from: E:\\gas_app\\seeders\\
"""

import os
import sys
import django
from pathlib import Path

# Add backend to path and setup Django
backend_dir = Path(__file__).resolve().parent.parent / 'backend'
sys.path.insert(0, str(backend_dir))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from authentication.models import Role, Permission, RolePermission, Resource
from authentication.utils import discover_resources_from_models, get_default_actions_for_resource


def rbac_seeder(skip_discovery=False):
    """Seed RBAC data with auto-discovery"""

    print('\n' + '='*70)
    print('Seeding RBAC Data with Auto-Discovery')
    print('='*70 + '\n')

    # STEP 1: Auto-discover and create resources
    if not skip_discovery:
        print('[Step 1/3] Auto-discovering resources from Django models...')
        discovered_resources = discover_resources_from_models()

        resources_created = 0
        resources_skipped = 0

        for resource_data in discovered_resources:
            resource, created = Resource.objects.get_or_create(
                name=resource_data['name'],
                defaults={
                    'display_name': resource_data['display_name'],
                    'description': resource_data['description'],
                    'app_label': resource_data['app_label'],
                    'model_name': resource_data['model_name'],
                    'is_model_based': resource_data['is_model_based'],
                    'is_active': resource_data['is_active'],
                }
            )
            if created:
                resources_created += 1
                print(f'  [CREATED] {resource.display_name} ({resource.name})')
            else:
                resources_skipped += 1

        print(f'\n  Resources: {resources_created} created, {resources_skipped} already existed\n')
    else:
        print('[Step 1/3] Skipping resource discovery\n')

    # STEP 2: Create permissions for all resources
    print('[Step 2/3] Creating permissions for all resources...')

    all_actions = ['view', 'create', 'edit', 'delete', 'export']
    permissions_created = 0
    permissions_skipped = 0

    for resource in Resource.objects.filter(is_active=True):
        # Determine which actions to create for this resource
        if resource.is_model_based:
            actions = all_actions
        else:
            actions = get_default_actions_for_resource(resource.name, resource.is_model_based)

        for action in actions:
            codename = f"{resource.name}.{action}"
            perm, created = Permission.objects.get_or_create(
                codename=codename,
                defaults={
                    'resource': resource,
                    'action': action,
                    'description': f'Can {action} {resource.display_name}'
                }
            )
            if created:
                permissions_created += 1
            else:
                permissions_skipped += 1

    print(f'\n  Permissions: {permissions_created} created, {permissions_skipped} already existed\n')

    # STEP 3: Create roles and assign permissions
    print('[Step 3/3] Creating roles...')

    # Define role configurations
    role_definitions = {
        'admin': {
            'display_name': 'Administrator',
            'description': 'Full system access to all resources',
            'priority': 1,
            'permissions': 'all'  # Gets all permissions
        },
        'manager': {
            'display_name': 'Manager',
            'description': 'Manage operations and view reports',
            'priority': 10,
            'exclude_resources': ['users', 'roles'],  # Can't manage users/roles
            'exclude_actions': ['delete'],  # Can't delete anything
        },
        'staff': {
            'display_name': 'Staff',
            'description': 'Basic operational access',
            'priority': 20,
            'include_actions': ['view', 'create', 'edit'],
            'exclude_resources': ['users', 'roles', 'statistics', 'logs'],
        },
        'delivery': {
            'display_name': 'Delivery Person',
            'description': 'View assigned routes, consumers, and orders',
            'priority': 30,
            'include_actions': ['view'],
            'include_resources': ['routes', 'route_areas', 'consumers', 'order_book'],
        },
        'viewer': {
            'display_name': 'Viewer',
            'description': 'Read-only access to all resources',
            'priority': 40,
            'include_actions': ['view'],
        },
    }

    for role_name, role_data in role_definitions.items():
        role, created = Role.objects.get_or_create(
            name=role_name,
            defaults={
                'display_name': role_data['display_name'],
                'description': role_data['description'],
                'priority': role_data['priority'],
            }
        )
        if created:
            print(f'  [CREATED] {role.display_name}')

        # Assign permissions based on role configuration
        if role_data.get('permissions') == 'all':
            # Admin gets all permissions
            all_perms = Permission.objects.all()
            for perm in all_perms:
                RolePermission.objects.get_or_create(role=role, permission=perm)
            print(f'    -> Assigned ALL permissions ({all_perms.count()}) to {role.display_name}')

        else:
            # Build permission query based on filters
            perm_query = Permission.objects.all()

            # Filter by included actions
            if 'include_actions' in role_data:
                perm_query = perm_query.filter(action__in=role_data['include_actions'])

            # Filter by included resources
            if 'include_resources' in role_data:
                perm_query = perm_query.filter(resource__name__in=role_data['include_resources'])

            # Exclude specific resources
            if 'exclude_resources' in role_data:
                perm_query = perm_query.exclude(resource__name__in=role_data['exclude_resources'])

            # Exclude specific actions
            if 'exclude_actions' in role_data:
                perm_query = perm_query.exclude(action__in=role_data['exclude_actions'])

            # Assign filtered permissions
            perm_count = 0
            for perm in perm_query:
                RolePermission.objects.get_or_create(role=role, permission=perm)
                perm_count += 1

            print(f'    -> Assigned {perm_count} permissions to {role.display_name}')

    # Summary
    print('\n' + '='*70)
    print('RBAC Seeding Completed Successfully!')
    print('='*70)
    print(f'\nResources: {Resource.objects.filter(is_active=True).count()}')
    print(f'Permissions: {Permission.objects.count()}')
    print(f'Roles: {Role.objects.count()}')
    print('\nNote: Run create_users.py to create admin and test users')
    print('  Location: E:/gas_app/cmds/create_users.py\n')


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description='Seed RBAC data')
    parser.add_argument('--skip-discovery', action='store_true',
                       help='Skip auto-discovery of resources from models')

    args = parser.parse_args()

    rbac_seeder(skip_discovery=args.skip_discovery)


if __name__ == '__main__':
    main()
