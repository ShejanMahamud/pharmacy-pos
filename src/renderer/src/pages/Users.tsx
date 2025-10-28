import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ActionBar from '../components/users/ActionBar'
import AttendanceTab from '../components/users/AttendanceTab'
import CreateUserModal from '../components/users/CreateUserModal'
import PermissionMatrixTab from '../components/users/PermissionMatrixTab'
import ResetPasswordModal from '../components/users/ResetPasswordModal'
import SalaryTab from '../components/users/SalaryTab'
import TabNavigation, { TabType } from '../components/users/TabNavigation'
import UserDetailsPanel from '../components/users/UserDetailsPanel'
import UserTable from '../components/users/UserTable'
import { usePermissions } from '../hooks/usePermissions'
import { canCreateUserWithRole, getAssignableRoles, Role, roleMetadata } from '../utils/permissions'

interface User {
  id: string
  username: string
  fullName: string
  email?: string
  phone?: string
  role: Role
  createdBy?: string
  isActive?: boolean
}

export default function Users(): React.JSX.Element {
  const { hasPermission, user: currentUser } = usePermissions()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | 'all'>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [activeTab, setActiveTab] = useState<TabType>('users')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true)
      const allUsers = await window.api.users.getAll()
      setUsers(allUsers)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (formData: {
    username: string
    password: string
    fullName: string
    email: string
    phone: string
    role: Role
  }): Promise<void> => {
    if (!hasPermission('create_user')) {
      toast.error('You do not have permission to create users')
      return
    }

    if (!currentUser) {
      toast.error('No current user found')
      return
    }

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

  const handleRoleChange = async (
    userId: string,
    _targetUser: User,
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

    if (currentUser.id === userId) {
      toast.error('You cannot change your own role')
      return
    }

    try {
      await window.api.users.update(userId, { role: newRole })
      toast.success('User role updated successfully')
      loadData()
    } catch (error) {
      console.error('Failed to update user role:', error)
      toast.error('Failed to update user role')
    }
  }

  const handleResetPassword = (user: User): void => {
    if (!currentUser) {
      toast.error('No current user found')
      return
    }

    const canReset =
      (currentUser.role === 'super_admin' && ['super_admin', 'admin'].includes(user.role)) ||
      (currentUser.role === 'admin' && ['manager', 'pharmacist', 'cashier'].includes(user.role))

    if (!canReset) {
      toast.error(`You cannot reset password for ${roleMetadata[user.role].name}`)
      return
    }

    setResetPasswordUser(user)
    setShowResetPasswordModal(true)
  }

  const handleSubmitResetPassword = async (newPassword: string): Promise<void> => {
    if (!currentUser || !resetPasswordUser) {
      toast.error('No current user found')
      return
    }

    try {
      await window.api.users.resetPassword(resetPasswordUser.id, newPassword, currentUser.id)
      toast.success('Password reset successfully. User must change password on next login.')
      setShowResetPasswordModal(false)
      setResetPasswordUser(null)
    } catch (error: any) {
      console.error('Failed to reset password:', error)
      toast.error(error.message || 'Failed to reset password')
    }
  }

  const canResetPassword = (user: User): boolean => {
    if (!currentUser) return false

    if (currentUser.role === 'super_admin') {
      return ['super_admin', 'admin'].includes(user.role)
    }

    if (currentUser.role === 'admin') {
      return ['manager', 'pharmacist', 'cashier'].includes(user.role)
    }

    return false
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User & Role Management</h1>
        <p className="text-sm text-gray-600 mt-1">Manage system users, roles, and permissions</p>
      </div>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'users' ? (
        <>
          <ActionBar
            searchTerm={searchTerm}
            selectedRole={selectedRole}
            filteredCount={filteredUsers.length}
            hasCreatePermission={hasPermission('create_user')}
            hasAvailableRoles={availableRoles.length > 0}
            onSearchChange={setSearchTerm}
            onRoleFilterChange={setSelectedRole}
            onCreateClick={() => setShowCreateModal(true)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <UserTable
                users={paginatedUsers}
                currentUser={currentUser}
                hasEditPermission={hasPermission('edit_user')}
                onUserSelect={setSelectedUser}
                onRoleChange={handleRoleChange}
                onToggleStatus={handleToggleStatus}
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(items) => {
                  setItemsPerPage(items)
                  setCurrentPage(1)
                }}
              />
            </div>

            <UserDetailsPanel
              selectedUser={selectedUser}
              canResetPassword={canResetPassword}
              onResetPassword={handleResetPassword}
            />
          </div>

          <CreateUserModal
            isOpen={showCreateModal}
            availableRoles={availableRoles}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateUser}
          />

          <ResetPasswordModal
            isOpen={showResetPasswordModal}
            user={resetPasswordUser}
            onClose={() => {
              setShowResetPasswordModal(false)
              setResetPasswordUser(null)
            }}
            onSubmit={handleSubmitResetPassword}
          />
        </>
      ) : activeTab === 'attendance' ? (
        <AttendanceTab users={users} currentUser={currentUser} />
      ) : activeTab === 'salary' ? (
        <SalaryTab users={users} currentUser={currentUser} />
      ) : (
        <PermissionMatrixTab />
      )}
    </div>
  )
}
