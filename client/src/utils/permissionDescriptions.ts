/**
 * Human-readable descriptions for permissions
 * Helps administrators understand what each permission allows
 */

export const permissionDescriptions: Record<string, string> = {
  // Consumers
  'consumers.view': 'View consumer/customer records and details',
  'consumers.create': 'Add new consumers to the system',
  'consumers.edit': 'Update existing consumer information',
  'consumers.delete': 'Remove consumers from the system',
  'consumers.export': 'Export consumer data to Excel/PDF',

  // Routes
  'routes.view': 'View delivery routes and route details',
  'routes.create': 'Create new delivery routes',
  'routes.edit': 'Modify existing route information',
  'routes.delete': 'Remove routes from the system',
  'routes.export': 'Export route data and reports',

  // Route Areas
  'route_areas.view': 'View geographic areas assigned to routes',
  'route_areas.create': 'Add new areas to routes',
  'route_areas.edit': 'Update route area assignments',
  'route_areas.delete': 'Remove areas from routes',
  'route_areas.export': 'Export route area data',

  // Delivery Persons
  'delivery_persons.view': 'View delivery personnel records',
  'delivery_persons.create': 'Add new delivery persons',
  'delivery_persons.edit': 'Update delivery person information',
  'delivery_persons.delete': 'Remove delivery persons',
  'delivery_persons.export': 'Export delivery person data',

  // Products
  'products.view': 'View product catalog and details',
  'products.create': 'Add new products to catalog',
  'products.edit': 'Update product information and pricing',
  'products.delete': 'Remove products from catalog',
  'products.export': 'Export product catalog data',

  // Product Variants
  'variants.view': 'View product variants (sizes, types)',
  'variants.create': 'Create new product variants',
  'variants.edit': 'Update variant details and pricing',
  'variants.delete': 'Remove product variants',
  'variants.export': 'Export variant data',

  // Units
  'units.view': 'View units of measurement',
  'units.create': 'Add new units of measurement',
  'units.edit': 'Update unit definitions',
  'units.delete': 'Remove units from system',
  'units.export': 'Export units data',

  // Lookups
  'lookups.view': 'View lookup tables (categories, types, etc.)',
  'lookups.create': 'Add new lookup values',
  'lookups.edit': 'Update lookup table values',
  'lookups.delete': 'Remove lookup values',
  'lookups.export': 'Export lookup table data',

  // Schemes
  'schemes.view': 'View government schemes and subsidies',
  'schemes.create': 'Add new scheme definitions',
  'schemes.edit': 'Update scheme information',
  'schemes.delete': 'Remove schemes',
  'schemes.export': 'Export scheme data',

  // Connections
  'connections.view': 'View connection records',
  'connections.create': 'Create new connections',
  'connections.edit': 'Update connection details',
  'connections.delete': 'Remove connections',
  'connections.export': 'Export connection data',

  // Users
  'users.view': 'View user accounts and details',
  'users.create': 'Create new user accounts',
  'users.edit': 'Update user information and roles',
  'users.delete': 'Deactivate or remove user accounts',
  'users.export': 'Export user data',

  // Roles
  'roles.view': 'View roles and their permissions',
  'roles.create': 'Create new roles',
  'roles.edit': 'Update role definitions and permissions',
  'roles.delete': 'Remove roles from system',
  'roles.export': 'Export role and permission data',

  // Statistics
  'statistics.view': 'View analytics and statistics dashboards',

  // Logs
  'logs.view': 'View system logs and audit trails',

  // Reports
  'reports.view': 'Access and generate system reports',

  // Dashboard
  'dashboard.view': 'Access main dashboard',
};

/**
 * Get description for a permission
 */
export const getPermissionDescription = (resource: string, action: string): string => {
  const key = `${resource}.${action}`;
  return permissionDescriptions[key] || `${action} ${resource}`;
};

/**
 * Permission action icons
 */
export const permissionIcons: Record<string, string> = {
  view: '👁️',
  create: '➕',
  edit: '✏️',
  delete: '🗑️',
  export: '📊',
};

/**
 * Get icon for permission action
 */
export const getPermissionIcon = (action: string): string => {
  return permissionIcons[action] || '🔒';
};
