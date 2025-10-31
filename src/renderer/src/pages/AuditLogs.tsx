import { Warning as WarningIcon } from '@mui/icons-material'
import { Alert, Box, CircularProgress, Container, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import AuditLogDetailsModal from '../components/auditLogs/AuditLogDetailsModal'
import AuditLogFilters from '../components/auditLogs/AuditLogFilters'
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

  const loadAuditLogs = async (filters?: FilterType): Promise<void> => {
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

  const loadStats = async (): Promise<void> => {
    try {
      const data = await window.api.auditLogs.getStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load audit stats:', error)
    }
  }

  const handleApplyFilters = (): void => {
    const filters: FilterType = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate
    if (actionFilter) filters.action = actionFilter
    if (entityTypeFilter) filters.entityType = entityTypeFilter
    loadAuditLogs(filters)
  }

  const handleClearFilters = (): void => {
    setStartDate('')
    setEndDate('')
    setActionFilter('')
    setEntityTypeFilter('')
    setSearchUsername('')
    loadAuditLogs()
  }

  const viewDetails = (log: AuditLog): void => {
    setSelectedLog(log)
    setShowDetailsModal(true)
  }

  // Filter logs by username search
  const filteredLogs = logs.filter((log) =>
    searchUsername ? log.username?.toLowerCase().includes(searchUsername.toLowerCase()) : true
  )

  // Show loading while checking authentication
  if (!user) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!canViewAuditLogs) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert
          severity="error"
          icon={<WarningIcon fontSize="large" />}
          sx={{
            '& .MuiAlert-icon': {
              fontSize: '3rem'
            }
          }}
        >
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body2">
            You do not have permission to view audit logs. Only Super Admins and Admins can access
            this page.
          </Typography>
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Audit Logs
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Track all system activities and changes
        </Typography>
      </Box>

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
      <AuditLogsTable logs={filteredLogs} loading={loading} onViewDetails={viewDetails} />

      {/* Details Modal */}
      <AuditLogDetailsModal
        show={showDetailsModal}
        log={selectedLog}
        onClose={() => setShowDetailsModal(false)}
      />
    </Container>
  )
}
