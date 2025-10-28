import { canChangeUserRole, getAssignableRoles, Role, roleMetadata } from '../../utils/permissions'
import Pagination from '../Pagination'

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

interface UserTableProps {
  users: User[]
  currentUser: User | null
  hasEditPermission: boolean
  onUserSelect: (user: User) => void
  onRoleChange: (userId: string, targetUser: User, newRole: Role) => void
  onToggleStatus: (userId: string, currentStatus: boolean) => void
  currentPage: number
  totalPages: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
}

export default function UserTable({
  users,
  currentUser,
  hasEditPermission,
  onUserSelect,
  onRoleChange,
  onToggleStatus,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}: UserTableProps): React.JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
              {hasEditPermission && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={hasEditPermission ? 4 : 3} className="px-6 py-12 text-center">
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
              users.map((user) => {
                const userRoleMeta = roleMetadata[user.role]
                return (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onUserSelect(user)}
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
                      {hasEditPermission && currentUser ? (
                        <select
                          value={user.role}
                          onChange={(e) => {
                            e.stopPropagation()
                            onRoleChange(user.id, user, e.target.value as Role)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          disabled={
                            currentUser.id === user.id ||
                            !canChangeUserRole(currentUser.role, user.role, user.role)
                          }
                          className={`px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                            currentUser.id === user.id ||
                            !canChangeUserRole(currentUser.role, user.role, user.role)
                              ? 'opacity-50 cursor-not-allowed text-gray-500'
                              : 'text-gray-800 hover:border-blue-500 cursor-pointer'
                          }`}
                        >
                          {getAssignableRoles(currentUser.role).map((role) => (
                            <option key={role} value={role}>
                              {roleMetadata[role].name}
                            </option>
                          ))}
                        </select>
                      ) : (
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
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {hasEditPermission && (
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleStatus(user.id, user.isActive || false)
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

      {/* Pagination */}
      {users.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={users.length}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      )}
    </div>
  )
}
