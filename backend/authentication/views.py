from rest_framework import status, generics, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import CustomTokenObtainPairSerializer, UserSerializer, RegisterSerializer, RoleSerializer, ResourceSerializer, PermissionSerializer
from .models import User, Role, Resource, Permission, UserRole, RolePermission
from .permissions import IsAdmin, HasResourcePermission


class CustomTokenObtainPairView(TokenObtainPairView):
    """Login view - returns JWT tokens and user info"""
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """Register new user (admin only - will be protected)"""
    queryset = User.objects.all()
    permission_classes = [AllowAny]  # Change to IsAdmin in production
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response({
            'user': UserSerializer(user).data,
            'message': 'User created successfully'
        }, status=status.HTTP_201_CREATED)


class LogoutView(generics.GenericAPIView):
    """Logout view - blacklists the refresh token"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(generics.RetrieveAPIView):
    """Get current logged-in user info"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User management

    Provides:
    - list: Get all users
    - retrieve: Get single user
    - create: Create new user
    - update: Update user
    - destroy: Delete user

    Custom actions:
    - assign_role: Assign role(s) to user
    - remove_role: Remove role from user
    - roles: Get user's roles
    """
    queryset = User.objects.prefetch_related('user_roles__role').all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, HasResourcePermission]
    resource_name = 'users'

    @action(detail=True, methods=['post'])
    def assign_roles(self, request, pk=None):
        """
        Assign one or more roles to a user

        POST /api/users/{id}/assign_roles/
        Body: {
            "role_ids": [1, 2, 3]
        }
        """
        user = self.get_object()
        role_ids = request.data.get('role_ids', [])

        if not role_ids:
            return Response(
                {'error': 'role_ids list is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        assigned_roles = []
        already_assigned = []

        for role_id in role_ids:
            try:
                role = Role.objects.get(id=role_id)

                # Check if already assigned
                if UserRole.objects.filter(user=user, role=role).exists():
                    already_assigned.append(role.display_name)
                else:
                    UserRole.objects.create(
                        user=user,
                        role=role,
                        assigned_by=request.user
                    )
                    assigned_roles.append(role.display_name)

            except Role.DoesNotExist:
                return Response(
                    {'error': f'Role with ID {role_id} not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

        return Response({
            'message': f'Roles assigned to {user.full_name}',
            'assigned': assigned_roles,
            'already_assigned': already_assigned,
            'user': UserSerializer(user).data
        })

    @action(detail=True, methods=['post'])
    def remove_role(self, request, pk=None):
        """
        Remove role from user

        POST /api/users/{id}/remove_role/
        Body: {
            "role_id": 1
        }
        """
        user = self.get_object()
        role_id = request.data.get('role_id')

        if not role_id:
            return Response(
                {'error': 'role_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_role = UserRole.objects.get(user=user, role_id=role_id)
            role_name = user_role.role.display_name
            user_role.delete()

            return Response({
                'message': f'Role "{role_name}" removed from {user.full_name}',
                'user': UserSerializer(user).data
            })
        except UserRole.DoesNotExist:
            return Response(
                {'error': 'User does not have this role'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def roles(self, request, pk=None):
        """
        Get all roles for a user

        GET /api/users/{id}/roles/
        """
        user = self.get_object()
        user_roles = UserRole.objects.filter(user=user).select_related('role', 'assigned_by')

        roles_data = [{
            'id': ur.role.id,
            'name': ur.role.name,
            'display_name': ur.role.display_name,
            'assigned_at': ur.assigned_at,
            'assigned_by': ur.assigned_by.full_name if ur.assigned_by else None
        } for ur in user_roles]

        return Response({
            'user': user.full_name,
            'total_roles': len(roles_data),
            'roles': roles_data
        })


class RoleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Role management

    Provides:
    - list: Get all roles
    - retrieve: Get single role
    - create: Create new role
    - update: Update role
    - destroy: Delete role

    Custom actions:
    - assign_permissions: Assign permissions to role
    - remove_permission: Remove permission from role
    - users: Get users with this role
    """
    queryset = Role.objects.prefetch_related('role_permissions__permission').all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    @action(detail=True, methods=['post'])
    def assign_permissions(self, request, pk=None):
        """
        Assign permissions to a role (replaces existing permissions)

        POST /api/roles/{id}/assign_permissions/
        Body: {
            "permission_ids": [1, 2, 3]
        }
        """
        role = self.get_object()
        permission_ids = request.data.get('permission_ids', [])

        # Validate all permission IDs exist before making changes
        permissions = []
        for perm_id in permission_ids:
            try:
                permission = Permission.objects.get(id=perm_id)
                permissions.append(permission)
            except Permission.DoesNotExist:
                return Response(
                    {'error': f'Permission with ID {perm_id} not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

        # Replace all permissions (delete old, add new)
        RolePermission.objects.filter(role=role).delete()

        assigned_permissions = []
        for permission in permissions:
            RolePermission.objects.create(role=role, permission=permission)
            assigned_permissions.append(permission.codename)

        return Response({
            'message': f'Permissions updated for role {role.display_name}',
            'assigned': assigned_permissions,
            'total': len(assigned_permissions),
            'role': RoleSerializer(role).data
        })

    @action(detail=True, methods=['post'])
    def remove_permission(self, request, pk=None):
        """
        Remove permission from role

        POST /api/roles/{id}/remove_permission/
        Body: {
            "permission_id": 1
        }
        """
        role = self.get_object()
        permission_id = request.data.get('permission_id')

        if not permission_id:
            return Response(
                {'error': 'permission_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            role_permission = RolePermission.objects.get(role=role, permission_id=permission_id)
            perm_name = role_permission.permission.codename
            role_permission.delete()

            return Response({
                'message': f'Permission "{perm_name}" removed from role {role.display_name}',
                'role': RoleSerializer(role).data
            })
        except RolePermission.DoesNotExist:
            return Response(
                {'error': 'Role does not have this permission'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def users(self, request, pk=None):
        """
        Get all users with this role

        GET /api/roles/{id}/users/
        """
        role = self.get_object()
        user_roles = UserRole.objects.filter(role=role).select_related('user')

        users_data = [{
            'id': ur.user.id,
            'employee_id': ur.user.employee_id,
            'full_name': ur.user.full_name,
            'email': ur.user.email,
            'assigned_at': ur.assigned_at
        } for ur in user_roles]

        return Response({
            'role': role.display_name,
            'total_users': len(users_data),
            'users': users_data
        })


class ResourceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Resource management (CRUD)

    Resources can be auto-discovered from Django models or manually created
    """
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        queryset = Resource.objects.all().order_by('name')

        # Filter by is_active
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        return queryset

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active resources"""
        resources = Resource.objects.filter(is_active=True)
        serializer = self.get_serializer(resources, many=True)
        return Response(serializer.data)


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Permission viewing (read-only)

    Permissions are auto-generated from resources and should not be modified via API
    """
    queryset = Permission.objects.select_related('resource').all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Permission.objects.select_related('resource').all().order_by('resource__name', 'action')

        # Filter by resource
        resource_id = self.request.query_params.get('resource', None)
        if resource_id:
            queryset = queryset.filter(resource_id=resource_id)

        return queryset

    @action(detail=False, methods=['get'])
    def by_resource(self, request):
        """
        Get permissions grouped by resource

        GET /api/permissions/by_resource/
        """
        resources = Resource.objects.filter(is_active=True)

        grouped_permissions = {}
        for resource in resources:
            perms = Permission.objects.filter(resource=resource)
            grouped_permissions[resource.name] = {
                'resource': ResourceSerializer(resource).data,
                'permissions': PermissionSerializer(perms, many=True).data
            }

        return Response(grouped_permissions)
