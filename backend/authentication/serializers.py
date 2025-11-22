from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from core.validators import validate_password_strength
from .models import User, Role, Resource, Permission


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model with RBAC support"""
    roles = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('id', 'employee_id', 'full_name', 'email', 'phone', 'is_active', 'is_superuser', 'is_staff', 'password', 'roles', 'permissions')
        read_only_fields = ('id', 'is_superuser', 'is_staff', 'roles', 'permissions')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def get_roles(self, obj):
        """Return list of role names"""
        return obj.roles_list

    def get_permissions(self, obj):
        """Return list of permission codenames"""
        return obj.permissions_list

    def validate(self, attrs):
        """Validate that password is provided on creation"""
        # On creation (no instance), password is required
        if not self.instance and not attrs.get('password'):
            raise serializers.ValidationError({'password': 'Password is required when creating a user'})
        return attrs

    def create(self, validated_data):
        """Create user with properly hashed password using custom manager"""
        password = validated_data.pop('password')
        # Use the custom create_user method which properly handles password hashing
        user = User.objects.create_user(
            employee_id=validated_data.get('employee_id'),
            email=validated_data.get('email'),
            full_name=validated_data.get('full_name'),
            password=password,
            phone=validated_data.get('phone', ''),
            is_active=validated_data.get('is_active', True)
        )
        return user

    def validate_password(self, value):
        """Validate password strength if provided"""
        if value:
            validate_password_strength(value)
        return value

    def update(self, instance, validated_data):
        """Update user, hash password if provided"""
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with RBAC support"""

    username_field = 'employee_id'  # Use employee_id for login

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims to JWT token
        token['employee_id'] = user.employee_id
        token['full_name'] = user.full_name
        token['email'] = user.email
        token['roles'] = user.roles_list
        token['permissions'] = user.permissions_list

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Add complete user info with roles and permissions to response
        data['user'] = UserSerializer(self.user).data

        return data


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""

    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'}, label='Confirm Password')

    class Meta:
        model = User
        fields = ('employee_id', 'full_name', 'email', 'password', 'password2', 'phone')

    def validate_password(self, value):
        """Validate password strength"""
        validate_password_strength(value)
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class ResourceSerializer(serializers.ModelSerializer):
    """Serializer for Resource model"""
    permissions_count = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = ('id', 'name', 'display_name', 'description', 'app_label', 'model_name',
                  'is_model_based', 'is_active', 'permissions_count', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_permissions_count(self, obj):
        """Return count of permissions for this resource"""
        return obj.permissions.count()


class PermissionSerializer(serializers.ModelSerializer):
    """Serializer for Permission model"""
    resource_name = serializers.CharField(source='resource.name', read_only=True)
    resource_display_name = serializers.CharField(source='resource.display_name', read_only=True)

    class Meta:
        model = Permission
        fields = ('id', 'resource', 'resource_name', 'resource_display_name', 'action', 'codename', 'description', 'created_at')
        read_only_fields = ('id', 'resource_name', 'resource_display_name', 'created_at')


class RoleSerializer(serializers.ModelSerializer):
    """Serializer for Role model with permissions support"""
    permissions_list = serializers.SerializerMethodField()
    permissions_count = serializers.SerializerMethodField()
    users_count = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = ('id', 'name', 'display_name', 'description', 'priority', 'is_active',
                  'permissions_list', 'permissions_count', 'users_count', 'created_at', 'updated_at')
        read_only_fields = ('id', 'permissions_list', 'permissions_count', 'users_count', 'created_at', 'updated_at')

    def get_permissions_list(self, obj):
        """Return list of permission codenames"""
        return [rp.permission.codename for rp in obj.role_permissions.select_related('permission')]

    def get_permissions_count(self, obj):
        """Return count of permissions"""
        return obj.role_permissions.count()

    def get_users_count(self, obj):
        """Return count of users with this role"""
        return obj.role_users.count()
