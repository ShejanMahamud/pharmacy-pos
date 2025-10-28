import { Role, roleMetadata } from '../../utils/permissions'

interface ActionBarProps {
  searchTerm: string
  selectedRole: Role | 'all'
  filteredCount: number
  hasCreatePermission: boolean
  hasAvailableRoles: boolean
  onSearchChange: (value: string) => void
  onRoleFilterChange: (role: Role | 'all') => void
  onCreateClick: () => void
}

export default function ActionBar({
  searchTerm,
  selectedRole,
  filteredCount,
  hasCreatePermission,
  hasAvailableRoles,
  onSearchChange,
  onRoleFilterChange,
  onCreateClick
}: ActionBarProps): React.JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search users by name, username, or role..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
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
            onChange={(e) => onRoleFilterChange(e.target.value as Role | 'all')}
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
            {filteredCount} user{filteredCount !== 1 ? 's' : ''} found
          </span>
          {hasCreatePermission && hasAvailableRoles && (
            <button
              onClick={onCreateClick}
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
  )
}
