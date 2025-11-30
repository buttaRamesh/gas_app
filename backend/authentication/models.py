from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """Custom user manager for User model without username field"""

    def create_user(self, employee_id, email, full_name, password=None, **extra_fields):
        if not employee_id:
            raise ValueError('The Employee ID must be set')
        if not email:
            raise ValueError('The Email must be set')
        if not full_name:
            raise ValueError('The Full Name must be set')

        email = self.normalize_email(email)
        user = self.model(employee_id=employee_id, email=email, full_name=full_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, employee_id, email, full_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(employee_id, email, full_name, password, **extra_fields)


class User(AbstractUser):
    """
    Custom User model with employee_id for authentication and RBAC

    Fields explanation:
    - employee_id: Login credential (e.g., EMP001, STAFF123) - manually assigned by admin
    - full_name: Person's actual name (e.g., "John Doe", "Ravi Kumar")
    - email: Email address
    """
    # Remove Django's username field to avoid confusion
    username = None

    # Employee ID for login (manually assigned by admin)
    employee_id = models.CharField(
        max_length=50,
        unique=True,
        help_text="Unique employee ID for login (e.g., EMP001, ADMIN, STAFF123)"
    )

    # Person's actual name
    full_name = models.CharField(
        max_length=255,
        help_text="Person's full name"
    )

    # Contact information
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)

    # Link to delivery person if user is a delivery person
    # delivery_person = models.ForeignKey(
    #     'delivery.DeliveryPerson',
    #     on_delete=models.SET_NULL,
    #     null=True,
    #     blank=True,
    #     related_name='user_account'
    # )

    # Use employee_id for authentication instead of username
    USERNAME_FIELD = 'employee_id'
    REQUIRED_FIELDS = ['email', 'full_name']

    # Use custom manager
    objects = UserManager()

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['employee_id']

    def __str__(self):
        return f"{self.employee_id} - {self.full_name}"

    @property
    def roles_list(self):
        """Get list of role names for this user"""
        return [ur.role.name for ur in self.user_roles.all()]

    @property
    def permissions_list(self):
        """Get list of permission codenames for this user"""
        role_ids = self.user_roles.values_list('role_id', flat=True)
        return list(
            RolePermission.objects.filter(role_id__in=role_ids)
            .values_list('permission__codename', flat=True)
            .distinct()
        )

    def has_permission(self, resource, action):
        """Check if user has specific permission"""
        # Superusers have all permissions
        if self.is_superuser:
            return True
        codename = f"{resource}.{action}"
        return codename in self.permissions_list

    def has_any_role(self, *role_names):
        """Check if user has any of the specified roles"""
        return any(role in self.roles_list for role in role_names)


class Role(models.Model):
    """Role definition for RBAC"""
    name = models.CharField(
        max_length=50,
        unique=True,
        help_text="Internal role name (e.g., 'admin', 'manager')"
    )
    display_name = models.CharField(
        max_length=100,
        help_text="Display name for UI (e.g., 'Administrator', 'Manager')"
    )
    description = models.TextField(
        blank=True,
        help_text="Description of what this role can do"
    )
    priority = models.IntegerField(
        default=0,
        help_text="Role hierarchy (1=highest priority, used for conflict resolution)"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this role can be assigned to users"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['priority', 'name']
        verbose_name = 'Role'
        verbose_name_plural = 'Roles'

    def __str__(self):
        return self.display_name

    @property
    def permissions_list(self):
        """Get list of permission codenames for this role"""
        return list(
            self.role_permissions.values_list('permission__codename', flat=True)
        )


class Resource(models.Model):
    """Resource definition for RBAC - represents entities that can be permissioned"""
    name = models.CharField(
        max_length=50,
        unique=True,
        help_text="Internal resource name (e.g., 'routes', 'consumers', 'order_book')"
    )
    display_name = models.CharField(
        max_length=100,
        help_text="Display name for UI (e.g., 'Routes', 'Consumers', 'Order Book')"
    )
    description = models.TextField(
        blank=True,
        help_text="Description of what this resource represents"
    )
    app_label = models.CharField(
        max_length=50,
        blank=True,
        help_text="Django app this resource belongs to (auto-detected from models)"
    )
    model_name = models.CharField(
        max_length=50,
        blank=True,
        help_text="Django model name if this resource maps to a model"
    )
    is_model_based = models.BooleanField(
        default=True,
        help_text="Whether this resource represents a Django model"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this resource should appear in permission lists"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Resource'
        verbose_name_plural = 'Resources'

    def __str__(self):
        return self.display_name


class Permission(models.Model):
    """Granular permissions for RBAC"""

    ACTIONS = [
        ('view', 'View'),
        ('create', 'Create'),
        ('edit', 'Edit'),
        ('delete', 'Delete'),
        ('export', 'Export'),
    ]

    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        related_name='permissions',
        help_text="Resource this permission applies to"
    )
    action = models.CharField(
        max_length=20,
        choices=ACTIONS,
        help_text="Action that can be performed"
    )
    codename = models.CharField(
        max_length=100,
        unique=True,
        help_text="Permission codename (e.g., 'routes.view', 'consumers.create')"
    )
    description = models.TextField(
        blank=True,
        help_text="Description of what this permission allows"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['resource', 'action']]
        ordering = ['resource__name', 'action']
        verbose_name = 'Permission'
        verbose_name_plural = 'Permissions'

    def __str__(self):
        return self.codename

    def save(self, *args, **kwargs):
        # Auto-generate codename if not provided
        if not self.codename:
            self.codename = f"{self.resource.name}.{self.action}"
        super().save(*args, **kwargs)


class UserRole(models.Model):
    """Junction table for User-Role many-to-many relationship"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='user_roles'
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name='role_users'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_user_roles',
        help_text="User who assigned this role"
    )
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this role assignment expires (optional)"
    )

    class Meta:
        unique_together = [['user', 'role']]
        verbose_name = 'User Role Assignment'
        verbose_name_plural = 'User Role Assignments'

    def __str__(self):
        return f"{self.user.employee_id} -> {self.role.name}"

    def is_active(self):
        """Check if this role assignment is still active"""
        if self.expires_at:
            from django.utils import timezone
            return timezone.now() < self.expires_at
        return True


class RolePermission(models.Model):
    """Junction table for Role-Permission many-to-many relationship"""
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name='role_permissions'
    )
    permission = models.ForeignKey(
        Permission,
        on_delete=models.CASCADE,
        related_name='permission_roles'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['role', 'permission']]
        verbose_name = 'Role Permission'
        verbose_name_plural = 'Role Permissions'

    def __str__(self):
        return f"{self.role.name} -> {self.permission.codename}"
