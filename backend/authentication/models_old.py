from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model with user_id for authentication and role-based access control

    Fields explanation:
    - user_id: Login credential (e.g., EMP001, STAFF123) - manually assigned by admin
    - username: Person's name (e.g., "John Doe", "Ravi Kumar") - inherited from AbstractUser
    - email: Email address
    """
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('delivery', 'Delivery Person'),
        ('staff', 'Staff'),
        ('viewer', 'Viewer'),
    ]

    # User ID for login (manually assigned by admin)
    user_id = models.CharField(
        max_length=50,
        unique=True,
        help_text="Unique user ID for login (e.g., EMP001, STAFF123)"
    )

    # Role for access control
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='viewer',
        help_text="User role determines access permissions"
    )

    # Additional fields
    phone = models.CharField(max_length=15, blank=True, null=True)

    # Link to delivery person if role is 'delivery'
    delivery_person = models.ForeignKey(
        'delivery.DeliveryPerson',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_account'
    )

    # Use user_id for authentication instead of username
    # username field (from AbstractUser) stores the person's actual name
    USERNAME_FIELD = 'user_id'
    REQUIRED_FIELDS = ['username', 'email']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['user_id']

    def __str__(self):
        return f"{self.user_id} ({self.get_role_display()})"

    def has_role(self, *roles):
        """Check if user has any of the specified roles"""
        return self.role in roles
