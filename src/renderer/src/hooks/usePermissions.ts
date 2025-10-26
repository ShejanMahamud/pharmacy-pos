import { useAuthStore } from '../store/authStore'
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  Permission,
  Role
} from '../utils/permissions'

interface User {
  id: string
  username: string
  fullName: string
  email?: string
  role: Role
  branchId?: string
}

interface UsePermissionsReturn {
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  role: Role
  user: User | null
}

export function usePermissions(): UsePermissionsReturn {
  const user = useAuthStore((state) => state.user)
  const role = (user?.role || 'cashier') as Role

  return {
    hasPermission: (permission: Permission) => hasPermission(role, permission),
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(role, permissions),
    hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(role, permissions),
    role,
    user
  }
}
