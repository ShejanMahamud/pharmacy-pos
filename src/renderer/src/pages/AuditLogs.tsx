import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import AuditLogDetailsModal from '../components/auditLogs/AuditLogDetailsModal'
import AuditLogFilters from '../components/auditLogs/AuditLogFilters'
import AuditLogHeader from '../components/auditLogs/AuditLogHeader'
import AuditLogsTable from '../components/auditLogs/AuditLogsTable'
import AuditLogStats from '../components/auditLogs/AuditLogStats'
import { useAuthStore } from '../store/authStore'
import { AuditLog, AuditStats, AuditLogFilters as FilterType } from '../types/auditLog'

export default function AuditLogs(): React.JSX.Element {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<AuditStats>({
    totalLogs: 0,
    recentActivity: [],
    userActivity: []
  })
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  // Filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [entityTypeFilter, setEntityTypeFilter] = useState('')
  const [searchUsername, setSearchUsername] = useState('')

  const user = useAuthStore((state) => state.user)

  // Check if user has permission to view audit logs
  const canViewAuditLogs = user?.role === 'super_admin' || user?.role === 'admin'

  useEffect(() => {
    console.log('AuditLogs component mounted', { user, canViewAuditLogs })
    if (canViewAuditLogs) {
      loadAuditLogs()
      loadStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canViewAuditLogs])

  const loadAuditLogs = async (filters?: FilterType) => {
    try {
      setLoading(true)
      const data = await window.api.auditLogs.getAll(filters)
      setLogs(data)
    } catch (error) {
      console.error('Failed to load audit logs:', error)
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await window.api.auditLogs.getStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load audit stats:', error)
    }
  }

  const handleApplyFilters = () => {
    const filters: FilterType = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate
    if (actionFilter) filters.action = actionFilter
    if (entityTypeFilter) filters.entityType = entityTypeFilter
    setCurrentPage(1)
    loadAuditLogs(filters)
  }

  const handleClearFilters = () => {
    setStartDate('')
    setEndDate('')
    setActionFilter('')
    setEntityTypeFilter('')
    setSearchUsername('')
    setCurrentPage(1)
    loadAuditLogs()
  }

  const viewDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setShowDetailsModal(true)
  }

  // Filter logs by username search
  const filteredLogs = logs.filter((log) =>
    searchUsername ? log.username?.toLowerCase().includes(searchUsername.toLowerCase()) : true
  )

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!canViewAuditLogs) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
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
          <h2 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">
            You do not have permission to view audit logs. Only Super Admins and Admins can access
            this page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <AuditLogHeader />

      {/* Stats Cards */}
      <AuditLogStats stats={stats} />

      {/* Filters */}
      <AuditLogFilters
        startDate={startDate}
        endDate={endDate}
        actionFilter={actionFilter}
        entityTypeFilter={entityTypeFilter}
        searchUsername={searchUsername}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onActionFilterChange={setActionFilter}
        onEntityTypeFilterChange={setEntityTypeFilter}
        onSearchUsernameChange={setSearchUsername}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Audit Logs Table */}
      <AuditLogsTable
        logs={paginatedLogs}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={filteredLogs.length}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onViewDetails={viewDetails}
      />

      {/* Details Modal */}
      <AuditLogDetailsModal
        show={showDetailsModal}
        log={selectedLog}
        onClose={() => setShowDetailsModal(false)}
      />
    </div>
  )
}
