from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db import models
from .serializers import UserSerializer, RoleSerializer, PermissionSerializer
from .permissions import IsAdmin
from .models import Role, UserRole, Permission, RolePermission

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users (admin only)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')

        # Search filter
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                models.Q(employee_id__icontains=search) |
                models.Q(full_name__icontains=search) |
                models.Q(email__icontains=search)
            )

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def assign_roles(self, request, pk=None):
        """Assign roles to a user"""
        user = self.get_object()
        role_ids = request.data.get('role_ids', [])

        if not role_ids:
            return Response(
                {'error': 'role_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Clear existing roles and assign new ones
        UserRole.objects.filter(user=user).delete()

        for role_id in role_ids:
            try:
                role = Role.objects.get(id=role_id)
                UserRole.objects.create(
                    user=user,
                    role=role,
                    assigned_by=request.user
                )
            except Role.DoesNotExist:
                return Response(
                    {'error': f'Role with id {role_id} does not exist'},
                    status=status.HTTP_404_NOT_FOUND
                )

        return Response(UserSerializer(user).data)

    @action(detail=True, methods=['post'])
    def remove_role(self, request, pk=None):
        """Remove a specific role from a user"""
        user = self.get_object()
        role_id = request.data.get('role_id')

        if not role_id:
            return Response(
                {'error': 'role_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            UserRole.objects.filter(user=user, role_id=role_id).delete()
            return Response(UserSerializer(user).data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class RoleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing roles (CRUD operations)
    """
    queryset = Role.objects.all().order_by('priority')
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        queryset = Role.objects.all().order_by('priority')

        # Search filter
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search) |
                models.Q(display_name__icontains=search) |
                models.Q(description__icontains=search)
            )

        return queryset

    @action(detail=True, methods=['post'])
    def assign_permissions(self, request, pk=None):
        """Assign permissions to a role"""
        role = self.get_object()
        permission_ids = request.data.get('permission_ids', [])

        if not permission_ids:
            return Response(
                {'error': 'permission_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Clear existing permissions and assign new ones
        RolePermission.objects.filter(role=role).delete()

        for permission_id in permission_ids:
            try:
                permission = Permission.objects.get(id=permission_id)
                RolePermission.objects.create(
                    role=role,
                    permission=permission
                )
            except Permission.DoesNotExist:
                return Response(
                    {'error': f'Permission with id {permission_id} does not exist'},
                    status=status.HTTP_404_NOT_FOUND
                )

        return Response(RoleSerializer(role).data)

    @action(detail=True, methods=['post'])
    def remove_permission(self, request, pk=None):
        """Remove a specific permission from a role"""
        role = self.get_object()
        permission_id = request.data.get('permission_id')

        if not permission_id:
            return Response(
                {'error': 'permission_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            RolePermission.objects.filter(role=role, permission_id=permission_id).delete()
            return Response(RoleSerializer(role).data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing permissions (read-only)
    """
    queryset = Permission.objects.all().order_by('resource', 'action')
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
