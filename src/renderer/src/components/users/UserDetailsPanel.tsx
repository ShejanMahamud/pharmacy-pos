import { getPermissionName, getRolePermissions, Role, roleMetadata } from '../../utils/permissions'

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

interface UserDetailsPanelProps {
  selectedUser: User | null
  canResetPassword: (user: User) => boolean
  onResetPassword: (user: User) => void
}

export default function UserDetailsPanel({
  selectedUser,
  canResetPassword,
  onResetPassword
}: UserDetailsPanelProps): React.JSX.Element {
  return (
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
                  <p className="text-sm text-gray-900">{roleMetadata[selectedUser.role].name}</p>
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

            {/* Actions */}
            {canResetPassword(selectedUser) && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => onResetPassword(selectedUser)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                  Reset Password
                </button>
              </div>
            )}

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
  )
}
