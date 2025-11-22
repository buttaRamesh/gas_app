from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Role, Resource, Permission, UserRole, RolePermission


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for custom User model"""

    list_display = ('employee_id', 'full_name', 'email', 'is_active', 'is_staff')
    list_filter = ('is_active', 'is_staff')
    search_fields = ('employee_id', 'full_name', 'email')
    ordering = ('employee_id',)

    fieldsets = (
        (None, {'fields': ('employee_id', 'password')}),
        ('Personal info', {'fields': ('full_name', 'email', 'phone')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Custom Fields', {'fields': ('delivery_person',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('employee_id', 'full_name', 'email', 'password1', 'password2'),
        }),
        ('Custom Fields', {'fields': ('phone', 'delivery_person')}),
    )


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_name', 'priority', 'is_active', 'created_at')
    list_filter = ('is_active', 'priority')
    search_fields = ('name', 'display_name')
    ordering = ('priority', 'name')


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_name', 'app_label', 'model_name', 'is_model_based', 'is_active', 'created_at')
    list_filter = ('is_model_based', 'is_active', 'app_label')
    search_fields = ('name', 'display_name', 'description')
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('codename', 'resource', 'action', 'created_at')
    list_filter = ('resource', 'action')
    search_fields = ('codename', 'description')
    ordering = ('resource__name', 'action')
    raw_id_fields = ('resource',)


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'assigned_at', 'expires_at', 'assigned_by')
    list_filter = ('role', 'assigned_at')
    search_fields = ('user__employee_id', 'user__full_name', 'role__name')
    ordering = ('-assigned_at',)


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ('role', 'permission', 'assigned_at')
    list_filter = ('role', 'permission__resource')
    search_fields = ('role__name', 'permission__codename')
    ordering = ('role', 'permission')
