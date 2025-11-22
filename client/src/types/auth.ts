/**
 * Authentication and RBAC Type Definitions
 */

// User type with RBAC support
export interface User {
  id: number;
  employee_id: string;      // Login credential (e.g., "admin", "EMP001")
  full_name: string;         // Person's actual name
  email: string;
  phone?: string;
  is_active: boolean;
  roles: string[];           // Array of role names (e.g., ["admin", "manager"])
  permissions: string[];     // Array of permission codenames (e.g., ["consumers.view", "consumers.create"])
}

// Role type
export interface Role {
  id: number;
  name: string;              // Internal role name (e.g., "admin", "manager")
  display_name: string;      // Display name for UI (e.g., "Administrator", "Manager")
  description: string;
  priority: number;          // Role hierarchy (1 = highest priority)
  is_active: boolean;
  created_at: string;
  updated_at: string;
  permissions?: Permission[]; // Optional: full permission objects
  permissions_list?: string[]; // Optional: just permission codenames
  permissions_count?: number; // Optional: count of permissions
  users_count?: number;       // Optional: count of users with this role
}

// Resource model - represents entities that can be permissioned
export interface ResourceDetail {
  id: number;
  name: string;              // Internal resource name (e.g., "routes", "consumers")
  display_name: string;      // Display name for UI (e.g., "Routes", "Consumers")
  description: string;
  app_label: string;         // Django app this resource belongs to
  model_name: string;        // Django model name if this resource maps to a model
  is_model_based: boolean;   // Whether this resource represents a Django model
  is_active: boolean;        // Whether this resource should appear in permission lists
  permissions_count?: number; // Number of permissions for this resource
  created_at: string;
  updated_at: string;
}

// Permission type
export interface Permission {
  id: number;
  resource: number;          // Resource ID (ForeignKey to Resource)
  resource_name?: string;    // Resource name (from serializer)
  resource_display_name?: string; // Resource display name (from serializer)
  action: PermissionAction;  // Action name
  codename: string;          // Full permission code (e.g., "consumers.view")
  description: string;
  created_at: string;
}

// Permission actions
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export';

// Resource name type (for backward compatibility)
// This is dynamically populated from the database, but we keep common ones typed
export type ResourceName = string;

// User-Role assignment
export interface UserRole {
  id: number;
  user: number;              // User ID
  role: number;              // Role ID
  assigned_at: string;
  assigned_by?: number;      // User ID of who assigned
  expires_at?: string;       // Optional expiration date
}

// Role-Permission assignment
export interface RolePermission {
  id: number;
  role: number;              // Role ID
  permission: number;        // Permission ID
  assigned_at: string;
}

// Login request
export interface LoginRequest {
  employee_id: string;
  password: string;
}

// Login response
export interface LoginResponse {
  access: string;            // JWT access token
  refresh: string;           // JWT refresh token
  user: User;                // User data with roles and permissions
}

// Token refresh request
export interface TokenRefreshRequest {
  refresh: string;
}

// Token refresh response
export interface TokenRefreshResponse {
  access: string;
}

// Logout request
export interface LogoutRequest {
  refresh: string;
}

// User creation/update request
export interface UserCreateRequest {
  employee_id: string;
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  is_active?: boolean;
}

export interface UserUpdateRequest {
  employee_id?: string;
  full_name?: string;
  email?: string;
  password?: string;
  phone?: string;
  is_active?: boolean;
}

// Role creation/update request
export interface RoleCreateRequest {
  name: string;
  display_name: string;
  description?: string;
  priority?: number;
  is_active?: boolean;
}

export interface RoleUpdateRequest {
  name?: string;
  display_name?: string;
  description?: string;
  priority?: number;
  is_active?: boolean;
}

// Assign roles to user request
export interface AssignRolesRequest {
  user_id: number;
  role_ids: number[];
  expires_at?: string;       // Optional expiration for all roles
}

// Assign permissions to role request
export interface AssignPermissionsRequest {
  role_id: number;
  permission_ids: number[];
}

// API response types
export interface UsersListResponse {
  results: User[];
  count: number;
  next?: string;
  previous?: string;
}

export interface RolesListResponse {
  results: Role[];
  count: number;
  next?: string;
  previous?: string;
}

export interface PermissionsListResponse {
  results: Permission[];
  count: number;
  next?: string;
  previous?: string;
}

export interface ResourcesListResponse {
  results: ResourceDetail[];
  count: number;
  next?: string;
  previous?: string;
}
