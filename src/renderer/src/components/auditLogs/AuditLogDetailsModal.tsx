import { Close as CloseIcon } from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Typography
} from '@mui/material'
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

  const getActionColor = (
    action: string
  ): 'success' | 'primary' | 'error' | 'secondary' | 'default' | 'warning' => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'success'
      case 'update':
        return 'primary'
      case 'delete':
        return 'error'
      case 'login':
        return 'secondary'
      case 'logout':
        return 'default'
      default:
        return 'warning'
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

  const parseChanges = (changes?: string): unknown => {
    if (!changes) return null
    try {
      return JSON.parse(changes)
    } catch {
      return null
    }
  }

  return (
    <Dialog open={show} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Audit Log Details
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {/* Basic Information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Basic Information
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 3
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Timestamp
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {formatDate(log.createdAt)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                User
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {log.username}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Action
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={log.action}
                  color={getActionColor(log.action)}
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Entity Type
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, textTransform: 'capitalize' }}>
                {log.entityType}
              </Typography>
            </Box>

            {log.entityName && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Entity Name
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {log.entityName}
                </Typography>
              </Box>
            )}

            {log.entityId && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Entity ID
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, fontFamily: 'monospace' }}>
                  {log.entityId}
                </Typography>
              </Box>
            )}

            {log.ipAddress && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  IP Address
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {log.ipAddress}
                </Typography>
              </Box>
            )}

            {log.userAgent && (
              <Box sx={{ gridColumn: { sm: 'span 2' } }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  User Agent
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {log.userAgent}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Changes */}
        {log.changes && parseChanges(log.changes) && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Changes
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {JSON.stringify(parseChanges(log.changes), null, 2)}
              </pre>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button variant="contained" onClick={onClose} fullWidth>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
