import { AuditLog } from '../../types/auditLog'

interface AuditLogDetailsModalProps {
  show: boolean
  log: AuditLog | null
  onClose: () => void
}

export default function AuditLogDetailsModal({
  show,
  log,
  onClose
}: AuditLogDetailsModalProps): React.JSX.Element | null {
  if (!show || !log) return null

  const getActionBadgeColor = (action: string): string => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800'
      case 'update':
        return 'bg-blue-100 text-blue-800'
      case 'delete':
        return 'bg-red-100 text-red-800'
      case 'login':
        return 'bg-purple-100 text-purple-800'
      case 'logout':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const parseChanges = (changes?: string) => {
    if (!changes) return null
    try {
      return JSON.parse(changes)
    } catch {
      return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Audit Log Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Timestamp</p>
                <p className="text-sm text-gray-900 mt-1">{formatDate(log.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">User</p>
                <p className="text-sm text-gray-900 mt-1">{log.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Action</p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getActionBadgeColor(log.action)}`}
                >
                  {log.action}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Entity Type</p>
                <p className="text-sm text-gray-900 mt-1 capitalize">{log.entityType}</p>
              </div>
              {log.entityName && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Entity Name</p>
                  <p className="text-sm text-gray-900 mt-1">{log.entityName}</p>
                </div>
              )}
              {log.entityId && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Entity ID</p>
                  <p className="text-sm text-gray-900 mt-1 font-mono">{log.entityId}</p>
                </div>
              )}
              {log.ipAddress && (
                <div>
                  <p className="text-sm font-medium text-gray-600">IP Address</p>
                  <p className="text-sm text-gray-900 mt-1">{log.ipAddress}</p>
                </div>
              )}
              {log.userAgent && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-600">User Agent</p>
                  <p className="text-sm text-gray-900 mt-1">{log.userAgent}</p>
                </div>
              )}
            </div>
          </div>

          {/* Changes */}
          {log.changes && parseChanges(log.changes) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Changes</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-900 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(parseChanges(log.changes), null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
