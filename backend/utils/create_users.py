"""
Standalone script to create admin and test users for the application.
This file is in seeders/ and ignored by git for security.

Usage:
    python create_users.py                    # Create all users (prompts for passwords)
    python create_users.py --admin-only       # Create only admin user
    python create_users.py --test-only        # Create only test users
    python create_users.py --use-defaults     # Use default passwords (local dev only)

Run from: E:\\gas_app\\seeders\\
"""

import os
import sys
import django
import getpass
from pathlib import Path

# Add backend to path and setup Django
backend_dir = Path(__file__).resolve().parent.parent / 'backend'
sys.path.insert(0, str(backend_dir))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import transaction
from authentication.models import User, Role, UserRole


def create_admin_user(use_defaults=False):
    """Create the admin superuser"""
    print('\n' + '='*70)
    print('Creating Admin User')
    print('='*70)

    if User.objects.filter(employee_id='admin').exists():
        print('  -> Admin user already exists')
        print('    Employee ID: admin')
        return

    try:
        admin_role = Role.objects.get(name='admin')
    except Role.DoesNotExist:
        print('[ERROR] Admin role not found. Please run seed_rbac first.')
        return

    # Get password
    if use_defaults:
        password = 'admin123'
        print('  Using default password: admin123')
    else:
        print('\nEnter password for admin user:')
        while True:
            password = getpass.getpass('  Password: ')
            password_confirm = getpass.getpass('  Confirm Password: ')
            if password == password_confirm:
                if len(password) < 8:
                    print('  [ERROR] Password must be at least 8 characters long')
                    continue
                break
            else:
                print('  [ERROR] Passwords do not match. Try again.')

    admin_user = User.objects.create_superuser(
        employee_id='admin',
        email='admin@example.com',
        full_name='System Administrator',
        # password=password
    )
    admin_user.set_password(password)
    admin_user.save()
    # Assign admin role
    UserRole.objects.create(user=admin_user, role=admin_role)

    print('  [OK] Created admin user')
    print('    - Employee ID: admin')
    if use_defaults:
        print('    - Password: admin123')
    else:
        print('    - Password: ********')
    print('    - Role: Administrator')


def create_test_users(use_defaults=False):
    """Create test users with different roles for RBAC testing"""
    print('\n' + '='*70)
    print('Creating Test Users for RBAC Testing')
    print('='*70 + '\n')

    # Get roles from database
    try:
        admin_role = Role.objects.get(name='admin')
        manager_role = Role.objects.get(name='manager')
        staff_role = Role.objects.get(name='staff')
        delivery_role = Role.objects.get(name='delivery')
        viewer_role = Role.objects.get(name='viewer')
    except Role.DoesNotExist as e:
        print(f'[ERROR] Required role not found: {e}')
        print('[WARNING] Please run seed_rbac first')
        return

    test_users = [
        {
            'employee_id': 'manager01',
            'full_name': 'Manager Test User',
            'email': 'manager@test.com',
            'phone': '9999900001',
            'default_password': 'manager123',
            'roles': [manager_role],
            'description': 'Manager with full access except user/role management'
        },
        {
            'employee_id': 'staff01',
            'full_name': 'Staff Test User',
            'email': 'staff@test.com',
            'phone': '9999900002',
            'default_password': 'staff123',
            'roles': [staff_role],
            'description': 'Staff with limited create/edit permissions'
        },
        {
            'employee_id': 'viewer01',
            'full_name': 'Viewer Test User',
            'email': 'viewer@test.com',
            'phone': '9999900003',
            'default_password': 'viewer123',
            'roles': [viewer_role],
            'description': 'Read-only access to most resources'
        },
        {
            'employee_id': 'delivery01',
            'full_name': 'Delivery Test User',
            'email': 'delivery@test.com',
            'phone': '9999900004',
            'default_password': 'delivery123',
            'roles': [delivery_role],
            'description': 'Delivery person with limited access'
        },
        {
            'employee_id': 'multi01',
            'full_name': 'Multi-Role Test User',
            'email': 'multi@test.com',
            'phone': '9999900005',
            'default_password': 'multi123',
            'roles': [staff_role, viewer_role],
            'description': 'User with multiple roles (staff + viewer)'
        },
    ]

    created_count = 0
    updated_count = 0

    # Collect passwords for all users first if prompting
    user_passwords = {}
    if not use_defaults:
        print('Enter passwords for test users:')
        for user_data in test_users:
            employee_id = user_data['employee_id']
            print(f'\n{employee_id} ({user_data["full_name"]}):')
            while True:
                password = getpass.getpass('  Password: ')
                password_confirm = getpass.getpass('  Confirm Password: ')
                if password == password_confirm:
                    # if len(password) < 8:
                    #     print('  [ERROR] Password must be at least 8 characters long')
                    #     continue
                    user_passwords[employee_id] = password
                    break
                else:
                    print('  [ERROR] Passwords do not match. Try again.')
        print()

    with transaction.atomic():
        for user_data in test_users:
            employee_id = user_data['employee_id']
            roles = user_data.pop('roles')
            description = user_data.pop('description')
            default_password = user_data.pop('default_password')

            # Use prompted password or default
            password = user_passwords.get(employee_id, default_password) if not use_defaults else default_password

            # Check if user exists
            user, created = User.objects.get_or_create(
                employee_id=employee_id,
                defaults={
                    'full_name': user_data['full_name'],
                    'email': user_data['email'],
                    'phone': user_data.get('phone'),
                    'is_active': True,
                }
            )

            if created:
                user.set_password(password)
                user.save()
                created_count += 1
                status = '[CREATED]'
            else:
                # Update password for existing user
                user.set_password(password)
                user.save()
                updated_count += 1
                status = '[UPDATED]'

            # Clear existing roles and assign new ones
            UserRole.objects.filter(user=user).delete()

            for role in roles:
                UserRole.objects.create(user=user, role=role)

            role_names = ', '.join([r.display_name for r in roles])

            print(f'{status:10} {employee_id:15} | {user_data["full_name"]:25} | Roles: {role_names:30} | {description}')

    print('\n' + '='*70)
    print('Summary')
    print('='*70)
    print(f'   - Created: {created_count} users')
    print(f'   - Updated: {updated_count} users')
    print(f'   - Total: {created_count + updated_count} users')

    print('\n' + '='*70)
    print('Test User Credentials')
    print('='*70)

    if use_defaults:
        print('Employee ID    | Password    | Description')
        print('-' * 70)
        print('admin          | admin123    | Full admin access')
        print('manager01      | manager123  | Manager - full access except admin features')
        print('staff01        | staff123    | Staff - limited create/edit permissions')
        print('viewer01       | viewer123   | Viewer - read-only access')
        print('delivery01     | delivery123 | Delivery - minimal access')
        print('multi01        | multi123    | Multiple roles (staff + viewer)')
    else:
        print('Employee ID    | Description')
        print('-' * 70)
        print('admin          | Full admin access')
        print('manager01      | Manager - full access except admin features')
        print('staff01        | Staff - limited create/edit permissions')
        print('viewer01       | Viewer - read-only access')
        print('delivery01     | Delivery - minimal access')
        print('multi01        | Multiple roles (staff + viewer)')
        print('\nPasswords were set during user creation.')
    print('')


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description='Create admin and test users')
    parser.add_argument('--admin-only', action='store_true', help='Create only admin user')
    parser.add_argument('--test-only', action='store_true', help='Create only test users')
    parser.add_argument('--use-defaults', action='store_true',
                       help='Use default passwords (for local dev only, NOT secure)')

    args = parser.parse_args()

    # Show warning if using defaults
    if args.use_defaults:
        print('\n' + '='*70)
        print('[WARNING] Using default passwords - for LOCAL DEVELOPMENT ONLY!')
        print('='*70)

    if args.admin_only:
        create_admin_user(use_defaults=args.use_defaults)
    elif args.test_only:
        create_test_users(use_defaults=args.use_defaults)
    else:
        # Create both
        create_admin_user(use_defaults=args.use_defaults)
        create_test_users(use_defaults=args.use_defaults)

    print('\n' + '='*70)
    print('User creation completed!')
    print('='*70 + '\n')


if __name__ == '__main__':
    main()
