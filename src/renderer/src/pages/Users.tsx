import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { usePermissions } from '../hooks/usePermissions'
import {
  canCreateUserWithRole,
  getAssignableRoles,
  getPermissionName,
  getRolePermissions,
  Role,
  roleMetadata
} from '../utils/permissions'

interface User {
  id: string
  username: string
  fullName: string
  email?: string
  phone?: string
  role: Role
  branchId?: string
  createdBy?: string
  isActive?: boolean
}

interface Branch {
  id: string
  name: string
  code: string
}

export default function Users(): React.JSX.Element {
  const { hasPermission, user: currentUser } = usePermissions()
  const [users, setUsers] = useState<User[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | 'all'>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'cashier' as Role,
    branchId: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true)
      const [allUsers, allBranches] = await Promise.all([
        window.api.users.getAll(),
        window.api.branches.getAll()
      ])
      setUsers(allUsers)
      setBranches(allBranches)
      if (allBranches.length > 0) {
        setFormData((prev) => ({ ...prev, branchId: allBranches[0].id }))
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!hasPermission('create_user')) {
      toast.error('You do not have permission to create users')
      return
    }

    if (!currentUser) {
      toast.error('No current user found')
      return
    }

    // Check if current user can create a user with this role
    if (!canCreateUserWithRole(currentUser.role, formData.role)) {
      toast.error(`You do not have permission to create ${roleMetadata[formData.role].name}`)
      return
    }

    if (!formData.username || !formData.password || !formData.fullName || !formData.role) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await window.api.users.create({
        ...formData,
        createdBy: currentUser.id,
        isActive: true
      })
      toast.success('User created successfully')
      setShowCreateModal(false)
      setFormData({
        username: '',
        password: '',
        fullName: '',
        email: '',
        phone: '',
        role: 'cashier',
        branchId: branches[0]?.id || ''
      })
      loadData()
    } catch (error) {
      console.error('Failed to create user:', error)
      toast.error('Failed to create user. Username may already exist.')
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean): Promise<void> => {
    if (!hasPermission('edit_user')) {
      toast.error('You do not have permission to edit users')
      return
    }

    // Prevent users from deactivating themselves
    if (currentUser && userId === currentUser.id) {
      toast.error('You cannot deactivate your own account')
      return
    }

    try {
      await window.api.users.update(userId, { isActive: !currentStatus })
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
      loadData()
    } catch (error) {
      console.error('Failed to update user status:', error)
      toast.error('Failed to update user status')
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  const availableRoles = currentUser ? getAssignableRoles(currentUser.role) : []

  if (!hasPermission('view_users')) {
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
              You don&apos;t have permission to view users
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
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="text-sm text-gray-600 mt-1">Manage system users and their access</p>
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
              onChange={(e) => setSelectedRole(e.target.value as Role | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
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
            {hasPermission('create_user') && availableRoles.length > 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create User
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users Table - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">System Users</h2>
            <p className="text-sm text-gray-600 mt-1">Manage user accounts and access</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
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
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedUser(user)}
                      >
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
                        {hasPermission('edit_user') && (
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleStatus(user.id, user.isActive || false)
                              }}
                              disabled={currentUser?.id === user.id}
                              className={`px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors ${
                                currentUser?.id === user.id
                                  ? 'opacity-50 cursor-not-allowed text-gray-400'
                                  : user.isActive
                                    ? 'text-red-600 hover:bg-red-50'
                                    : 'text-green-600 hover:bg-green-50'
                              }`}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
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

        {/* User Details Panel - Takes 1 column */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectedUser ? 'Selected user information' : 'Select a user to view details'}
            </p>
          </div>
          <div className="p-6">
            {selectedUser ? (
              <div className="space-y-4">
                {/* User Avatar and Name */}
                <div className="text-center pb-4 border-b border-gray-200">
                  <div className="h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                    {selectedUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedUser.fullName}</h3>
                  <p className="text-sm text-gray-500">@{selectedUser.username}</p>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Role</label>
                    <div className="mt-1 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-gray-400"
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
                      <p className="text-sm text-gray-900">
                        {roleMetadata[selectedUser.role].name}
                      </p>
                    </div>
                  </div>

                  {selectedUser.email && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                      <div className="mt-1 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-sm text-gray-900">{selectedUser.email}</p>
                      </div>
                    </div>
                  )}

                  {selectedUser.phone && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Phone</label>
                      <div className="mt-1 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <p className="text-sm text-gray-900">{selectedUser.phone}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Branch</label>
                    <div className="mt-1 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <p className="text-sm text-gray-900">
                        {branches.find((b) => b.id === selectedUser.branchId)?.name || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedUser.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${selectedUser.isActive ? 'bg-green-600' : 'bg-red-600'}`}
                        ></span>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="pt-4 border-t border-gray-200">
                  <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">
                    Permissions
                  </label>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {getRolePermissions(selectedUser.role).map((permission) => (
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
                        <span className="text-xs">{getPermissionName(permission)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <p className="text-gray-500 text-sm">Click on a user to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Create New User</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {availableRoles.map((role) => (
                      <option key={role} value={role}>
                        {roleMetadata[role].name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {roleMetadata[formData.role].description}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} ({branch.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Permissions Preview */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Permissions for {roleMetadata[formData.role].name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {getRolePermissions(formData.role)
                    .slice(0, 10)
                    .map((permission) => (
                      <span
                        key={permission}
                        className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600"
                      >
                        {getPermissionName(permission)}
                      </span>
                    ))}
                  {getRolePermissions(formData.role).length > 10 && (
                    <span className="px-2 py-1 text-xs text-gray-500">
                      +{getRolePermissions(formData.role).length - 10} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
