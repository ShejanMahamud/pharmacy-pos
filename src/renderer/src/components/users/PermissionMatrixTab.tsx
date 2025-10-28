import {
  getPermissionName,
  getRolePermissions,
  Permission,
  permissionCategories,
  Role,
  roleMetadata
} from '../../utils/permissions'

export default function PermissionMatrixTab(): React.JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Complete Permission Matrix</h2>
        <p className="text-sm text-gray-600 mt-1">
          Overview of all {(Object.keys(roleMetadata) as Role[]).length} roles and their permissions
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
                      const hasAccess = getRolePermissions(role).includes(permission as Permission)
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
  )
}
