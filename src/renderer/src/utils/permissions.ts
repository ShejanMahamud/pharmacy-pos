// Permission definitions for RBAC
export type Permission =
  // Dashboard
  | 'view_dashboard'
  // Sales
  | 'view_sales'
  | 'create_sale'
  | 'view_sale_details'
  | 'refund_sale'
  | 'print_invoice'
  // Products
  | 'view_products'
  | 'create_product'
  | 'edit_product'
  | 'delete_product'
  | 'manage_categories'
  // Inventory
  | 'view_inventory'
  | 'adjust_inventory'
  | 'transfer_stock'
  | 'view_low_stock'
  // Purchases
  | 'view_purchases'
  | 'create_purchase'
  | 'edit_purchase'
  | 'delete_purchase'
  // Customers
  | 'view_customers'
  | 'create_customer'
  | 'edit_customer'
  | 'delete_customer'
  // Reports
  | 'view_reports'
  | 'export_reports'
  // Users & Roles
  | 'view_users'
  | 'create_user'
  | 'edit_user'
  | 'delete_user'
  | 'manage_roles'
  // Settings
  | 'view_settings'
  | 'edit_settings'
  // Suppliers
  | 'view_suppliers'
  | 'create_supplier'
  | 'edit_supplier'
  | 'delete_supplier'
  // Audit
  | 'view_audit_logs'
  // Super Admin Only
  | 'manage_admins'
  | 'system_configuration'

export type Role = 'super_admin' | 'admin' | 'manager' | 'cashier' | 'pharmacist'

// Role-based permission mapping
export const rolePermissions: Record<Role, Permission[]> = {
  super_admin: [
    // Super admin has all permissions including admin management
    'view_dashboard',
    'view_sales',
    'create_sale',
    'view_sale_details',
    'refund_sale',
    'print_invoice',
    'view_products',
    'create_product',
    'edit_product',
    'delete_product',
    'manage_categories',
    'view_inventory',
    'adjust_inventory',
    'transfer_stock',
    'view_low_stock',
    'view_purchases',
    'create_purchase',
    'edit_purchase',
    'delete_purchase',
    'view_customers',
    'create_customer',
    'edit_customer',
    'delete_customer',
    'view_reports',
    'export_reports',
    'view_users',
    'create_user',
    'edit_user',
    'delete_user',
    'manage_roles',
    'manage_admins',
    'view_settings',
    'edit_settings',
    'system_configuration',
    'view_suppliers',
    'create_supplier',
    'edit_supplier',
    'delete_supplier',
    'view_audit_logs'
  ],
  admin: [
    // Admin has full access except managing other admins and system configuration
    'view_dashboard',
    'view_sales',
    'create_sale',
    'view_sale_details',
    'refund_sale',
    'print_invoice',
    'view_products',
    'create_product',
    'edit_product',
    'delete_product',
    'manage_categories',
    'view_inventory',
    'adjust_inventory',
    'transfer_stock',
    'view_low_stock',
    'view_purchases',
    'create_purchase',
    'edit_purchase',
    'delete_purchase',
    'view_customers',
    'create_customer',
    'edit_customer',
    'delete_customer',
    'view_reports',
    'export_reports',
    'view_users',
    'create_user',
    'edit_user',
    'delete_user',
    'manage_roles',
    'view_settings',
    'edit_settings',
    'view_suppliers',
    'create_supplier',
    'edit_supplier',
    'delete_supplier',
    'view_audit_logs'
  ],
  manager: [
    // Manager has most permissions except system settings and user management
    'view_dashboard',
    'view_sales',
    'create_sale',
    'view_sale_details',
    'refund_sale',
    'print_invoice',
    'view_products',
    'create_product',
    'edit_product',
    'delete_product',
    'manage_categories',
    'view_inventory',
    'adjust_inventory',
    'transfer_stock',
    'view_low_stock',
    'view_purchases',
    'create_purchase',
    'edit_purchase',
    'delete_purchase',
    'view_customers',
    'create_customer',
    'edit_customer',
    'delete_customer',
    'view_reports',
    'export_reports',
    'view_users',
    'view_settings',
    'view_suppliers',
    'create_supplier',
    'edit_supplier',
    'view_audit_logs'
  ],
  pharmacist: [
    // Pharmacist focuses on sales, products, and inventory
    'view_dashboard',
    'view_sales',
    'create_sale',
    'view_sale_details',
    'print_invoice',
    'view_products',
    'view_inventory',
    'view_low_stock',
    'view_customers',
    'create_customer',
    'edit_customer',
    'view_reports',
    'view_suppliers'
  ],
  cashier: [
    // Cashier has minimal permissions - mainly POS operations
    'view_dashboard',
    'view_sales',
    'create_sale',
    'view_sale_details',
    'print_invoice',
    'view_products',
    'view_inventory',
    'view_customers',
    'create_customer'
  ]
}

// Check if a role has a specific permission
export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) || false
}

// Check if a role has any of the specified permissions
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission))
}

// Check if a role has all of the specified permissions
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission))
}

// Get all permissions for a role
export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] || []
}

// Role metadata
export const roleMetadata: Record<
  Role,
  { name: string; description: string; color: string; icon: string }
> = {
  super_admin: {
    name: 'Super Administrator',
    description: 'Ultimate system access with ability to manage admins',
    color: 'indigo',
    icon: ''
  },
  admin: {
    name: 'Administrator',
    description: 'Full system access, can create and manage users',
    color: 'red',
    icon: ''
  },
  manager: {
    name: 'Manager',
    description: 'Manage operations, inventory, and reports',
    color: 'blue',
    icon: ''
  },
  pharmacist: {
    name: 'Pharmacist',
    description: 'Handle prescriptions, sales, and customer service',
    color: 'green',
    icon: ''
  },
  cashier: {
    name: 'Cashier',
    description: 'Process sales and customer transactions',
    color: 'purple',
    icon: ''
  }
}

// Permission categories for UI organization
export const permissionCategories = {
  Dashboard: ['view_dashboard'],
  Sales: ['view_sales', 'create_sale', 'view_sale_details', 'refund_sale', 'print_invoice'],
  Products: [
    'view_products',
    'create_product',
    'edit_product',
    'delete_product',
    'manage_categories'
  ],
  Inventory: ['view_inventory', 'adjust_inventory', 'transfer_stock', 'view_low_stock'],
  Purchases: ['view_purchases', 'create_purchase', 'edit_purchase', 'delete_purchase'],
  Customers: ['view_customers', 'create_customer', 'edit_customer', 'delete_customer'],
  Reports: ['view_reports', 'export_reports'],
  'Users & Roles': ['view_users', 'create_user', 'edit_user', 'delete_user', 'manage_roles'],
  'Admin Management': ['manage_admins'],
  Settings: ['view_settings', 'edit_settings', 'system_configuration'],
  Suppliers: ['view_suppliers', 'create_supplier', 'edit_supplier', 'delete_supplier'],
  Audit: ['view_audit_logs']
}

// Get human-readable permission name
export function getPermissionName(permission: Permission): string {
  return permission
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Role hierarchy for user management
export const roleHierarchy: Record<Role, number> = {
  super_admin: 5,
  admin: 4,
  manager: 3,
  pharmacist: 2,
  cashier: 1
}

// Check if a role can manage another role
export function canManageRole(managerRole: Role, targetRole: Role): boolean {
  // Super admin can manage everyone including other admins
  if (managerRole === 'super_admin') {
    return true
  }

  // Admin can manage everyone except super_admin and other admins
  if (managerRole === 'admin') {
    return targetRole !== 'super_admin' && targetRole !== 'admin'
  }

  // Other roles cannot manage anyone
  return false
}

// Check if a role can create users with a specific role
export function canCreateUserWithRole(creatorRole: Role, newUserRole: Role): boolean {
  return canManageRole(creatorRole, newUserRole)
}

// Check if a role can change another user's role
export function canChangeUserRole(
  managerRole: Role,
  currentUserRole: Role,
  newUserRole: Role
): boolean {
  // Must be able to manage both the current and new role
  return canManageRole(managerRole, currentUserRole) && canManageRole(managerRole, newUserRole)
}

// Get available roles that a user can assign
export function getAssignableRoles(userRole: Role): Role[] {
  if (userRole === 'super_admin') {
    return ['super_admin', 'admin', 'manager', 'pharmacist', 'cashier']
  }

  if (userRole === 'admin') {
    return ['manager', 'pharmacist', 'cashier']
  }

  return []
}
