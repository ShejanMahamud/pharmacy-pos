interface AuditLogFiltersProps {
  startDate: string
  endDate: string
  actionFilter: string
  entityTypeFilter: string
  searchUsername: string
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onActionFilterChange: (value: string) => void
  onEntityTypeFilterChange: (value: string) => void
  onSearchUsernameChange: (value: string) => void
  onApplyFilters: () => void
  onClearFilters: () => void
}

export default function AuditLogFilters({
  startDate,
  endDate,
  actionFilter,
  entityTypeFilter,
  searchUsername,
  onStartDateChange,
  onEndDateChange,
  onActionFilterChange,
  onEntityTypeFilterChange,
  onSearchUsernameChange,
  onApplyFilters,
  onClearFilters
}: AuditLogFiltersProps): React.JSX.Element {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
          <select
            value={actionFilter}
            onChange={(e) => onActionFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
          <select
            value={entityTypeFilter}
            onChange={(e) => onEntityTypeFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="user">User</option>
            <option value="product">Product</option>
            <option value="sale">Sale</option>
            <option value="purchase">Purchase</option>
            <option value="customer">Customer</option>
            <option value="supplier">Supplier</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
          <input
            type="text"
            value={searchUsername}
            onChange={(e) => onSearchUsernameChange(e.target.value)}
            placeholder="Search by username"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-3 mt-4">
        <button
          onClick={onClearFilters}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
        >
          Clear Filters
        </button>
        <button
          onClick={onApplyFilters}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
}
