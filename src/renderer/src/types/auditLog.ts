export interface AuditLog {
  id: string
  userId?: string
  username?: string
  action: string
  entityType: string
  entityId?: string
  entityName?: string
  changes?: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export interface AuditStats {
  totalLogs: number
  recentActivity: { action: string; count: number }[]
  userActivity: { username: string; count: number }[]
}

export interface AuditLogFilters {
  startDate?: string
  endDate?: string
  action?: string
  entityType?: string
}
