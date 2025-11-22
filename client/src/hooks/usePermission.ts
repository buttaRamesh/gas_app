import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to check if user has a specific permission
 *
 * @param resource - The resource name (e.g., 'consumers', 'routes')
 * @param action - The action name (e.g., 'view', 'create', 'edit', 'delete', 'export')
 * @returns boolean indicating if user has the permission
 *
 * @example
 * const canCreateConsumer = usePermission('consumers', 'create');
 *
 * if (canCreateConsumer) {
 *   return <Button>Create Consumer</Button>
 * }
 */
export const usePermission = (resource: string, action: string): boolean => {
  const { hasPermission } = useAuth();
  return hasPermission(resource, action);
};

/**
 * Hook to check if user has any of the specified permissions
 *
 * @param permissions - Array of [resource, action] tuples
 * @returns boolean indicating if user has any of the permissions
 *
 * @example
 * const canViewOrEditConsumer = useHasAnyPermission([
 *   ['consumers', 'view'],
 *   ['consumers', 'edit']
 * ]);
 */
export const useHasAnyPermission = (
  permissions: Array<[string, string]>
): boolean => {
  const { hasAnyPermission } = useAuth();
  return hasAnyPermission(...permissions);
};

/**
 * Hook to check if user has all of the specified permissions
 *
 * @param permissions - Array of [resource, action] tuples
 * @returns boolean indicating if user has all of the permissions
 *
 * @example
 * const canManageConsumersAndRoutes = useHasAllPermissions([
 *   ['consumers', 'view'],
 *   ['routes', 'view']
 * ]);
 */
export const useHasAllPermissions = (
  permissions: Array<[string, string]>
): boolean => {
  const { hasAllPermissions } = useAuth();
  return hasAllPermissions(...permissions);
};

/**
 * Hook to check if user has any of the specified roles
 *
 * @param roles - Array of role names
 * @returns boolean indicating if user has any of the roles
 *
 * @example
 * const isAdminOrManager = useHasRole('admin', 'manager');
 */
export const useHasRole = (...roles: string[]): boolean => {
  const { hasRole } = useAuth();
  return hasRole(...roles);
};

/**
 * Hook to get all permissions for the current user
 *
 * @returns Array of permission codenames
 *
 * @example
 * const permissions = useUserPermissions();
 * console.log(permissions); // ['consumers.view', 'consumers.create', ...]
 */
export const useUserPermissions = (): string[] => {
  const { user } = useAuth();
  return user?.permissions || [];
};

/**
 * Hook to get all roles for the current user
 *
 * @returns Array of role names
 *
 * @example
 * const roles = useUserRoles();
 * console.log(roles); // ['admin', 'manager']
 */
export const useUserRoles = (): string[] => {
  const { user } = useAuth();
  return user?.roles || [];
};

/**
 * Hook to get permission checker functions with resource pre-filled
 * Useful for components that need to check multiple actions on the same resource
 *
 * @param resource - The resource name
 * @returns Object with action checking functions
 *
 * @example
 * const consumer = useResourcePermissions('consumers');
 *
 * return (
 *   <>
 *     {consumer.canView() && <ViewButton />}
 *     {consumer.canCreate() && <CreateButton />}
 *     {consumer.canEdit() && <EditButton />}
 *     {consumer.canDelete() && <DeleteButton />}
 *     {consumer.canExport() && <ExportButton />}
 *   </>
 * );
 */
export const useResourcePermissions = (resource: string) => {
  const { hasPermission } = useAuth();

  return {
    canView: () => hasPermission(resource, 'view'),
    canCreate: () => hasPermission(resource, 'create'),
    canEdit: () => hasPermission(resource, 'edit'),
    canDelete: () => hasPermission(resource, 'delete'),
    canExport: () => hasPermission(resource, 'export'),
    can: (action: string) => hasPermission(resource, action),
  };
};
