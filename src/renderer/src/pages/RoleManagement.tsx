import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { usePermissions } from '../hooks/usePermissions'
import {
  canChangeUserRole,
  getAssignableRoles,
  getPermissionName,
  getRolePermissions,
  Permission,
  permissionCategories,
  Role,
  roleMetadata
} from '../utils/permissions'

interface User {
  id: string
  username: string
  fullName: string
  email?: string
  role: Role
  isActive?: boolean
  createdBy?: string
}

export default function RoleManagement(): React.JSX.Element {
  const { hasPermission, user: currentUser } = usePermissions()
  const [users, setUsers] = useState<User[]>([])
  const [selectedRole, setSelectedRole] = useState<Role>('super_admin')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async (): Promise<void> => {
    try {
      setLoading(true)
      const allUsers = await window.api.users.getAll()
      setUsers(allUsers)
    } catch (error) {
      console.error('Failed to load users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (
    userId: string,
    targetUser: User,
    newRole: Role
  ): Promise<void> => {
    if (!hasPermission('edit_user')) {
      toast.error('You do not have permission to edit users')
      return
    }

    if (!currentUser) {
      toast.error('No current user found')
      return
    }

    // Prevent users from changing their own role
    if (currentUser.id === userId) {
      toast.error('You cannot change your own role')
      return
    }

    // Check if current user can change this user's role
    if (!canChangeUserRole(currentUser.role, targetUser.role, newRole)) {
      toast.error('You do not have permission to assign this role')
      return
    }

    try {
      await window.api.users.update(userId, { role: newRole })
      toast.success('User role updated successfully')
      loadUsers()
    } catch (error) {
      console.error('Failed to update user role:', error)
      toast.error('Failed to update user role')
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!hasPermission('manage_roles')) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don&apos;t have permission to access role management
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Role Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage user roles and permissions across the system
        </p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search users by name, username, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Role)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {(Object.keys(roleMetadata) as Role[]).map((role) => (
                <option key={role} value={role}>
                  {roleMetadata[role].name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users Table - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">User Roles</h2>
            <p className="text-sm text-gray-600 mt-1">Manage user role assignments</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {hasPermission('edit_user') && (
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={hasPermission('edit_user') ? 4 : 3}
                      className="px-6 py-12 text-center"
                    >
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <p className="text-gray-500 text-sm">No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const userRoleMeta = roleMetadata[user.role]
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{user.fullName}</p>
                              <p className="text-xs text-gray-500">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            {userRoleMeta.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        {hasPermission('edit_user') && currentUser && (
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <select
                              value={user.role}
                              onChange={(e) =>
                                handleRoleChange(user.id, user, e.target.value as Role)
                              }
                              disabled={
                                currentUser.id === user.id ||
                                !canChangeUserRole(currentUser.role, user.role, user.role)
                              }
                              className={`px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                                currentUser.id === user.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {getAssignableRoles(currentUser.role).map((role) => (
                                <option key={role} value={role}>
                                  {roleMetadata[role].name}
                                </option>
                              ))}
                            </select>
                          </td>
                        )}
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Permissions Panel - Takes 1 column */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {roleMetadata[selectedRole].name} Permissions
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {getRolePermissions(selectedRole).length} permissions assigned
            </p>
          </div>
          <div className="p-6 max-h-[600px] overflow-y-auto">
            <div className="space-y-4">
              {Object.entries(permissionCategories).map(([category, permissions]) => {
                const rolePerms = getRolePermissions(selectedRole)
                const categoryPerms = permissions.filter((p) => rolePerms.includes(p as Permission))

                if (categoryPerms.length === 0) return null

                return (
                  <div key={category}>
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">{category}</h4>
                    <div className="space-y-1">
                      {categoryPerms.map((permission) => (
                        <div
                          key={permission}
                          className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg"
                        >
                          <svg
                            className="h-4 w-4 text-green-600 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-xs">
                            {getPermissionName(permission as Permission)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Complete Permission Matrix</h2>
          <p className="text-sm text-gray-600 mt-1">
            Overview of all {(Object.keys(roleMetadata) as Role[]).length} roles and their
            permissions
          </p>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-white z-10">
                  Category / Permission
                </th>
                {(Object.keys(roleMetadata) as Role[]).map((role) => (
                  <th
                    key={role}
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {roleMetadata[role].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(permissionCategories).map(([category, permissions]) => (
                <>
                  <tr key={category} className="bg-gray-50">
                    <td
                      colSpan={6}
                      className="px-4 py-2 text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50"
                    >
                      {category}
                    </td>
                  </tr>
                  {permissions.map((permission) => (
                    <tr key={permission} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 sticky left-0 bg-white">
                        {getPermissionName(permission as Permission)}
                      </td>
                      {(Object.keys(roleMetadata) as Role[]).map((role) => {
                        const hasAccess = getRolePermissions(role).includes(
                          permission as Permission
                        )
                        return (
                          <td key={role} className="px-4 py-3 text-center">
                            {hasAccess ? (
                              <svg
                                className="h-5 w-5 text-green-600 mx-auto"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="h-5 w-5 text-gray-300 mx-auto"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
