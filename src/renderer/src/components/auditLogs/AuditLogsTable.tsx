import { Description as DescriptionIcon, Visibility as VisibilityIcon } from '@mui/icons-material'
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  styled,
  tableCellClasses
} from '@mui/material'
import { useState } from 'react'
import { AuditLog } from '../../types/auditLog'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.grey[300],
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    letterSpacing: '0.05em'
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14
  }
}))

interface AuditLogsTableProps {
  logs: AuditLog[]
  loading: boolean
  onViewDetails: (log: AuditLog) => void
}

export default function AuditLogsTable({
  logs,
  loading,
  onViewDetails
}: AuditLogsTableProps): React.JSX.Element {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

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

  const handleChangePage = (_event: unknown, newPage: number): void => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{ p: 8, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}
      >
        <CircularProgress />
      </Paper>
    )
  }

  if (logs.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{ p: 8, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}
      >
        <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No Audit Logs Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No activity has been logged yet or matches your filters.
        </Typography>
      </Paper>
    )
  }

  const paginatedLogs = logs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <TableContainer sx={{ maxHeight: 540 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell>Timestamp</StyledTableCell>
              <StyledTableCell>User</StyledTableCell>
              <StyledTableCell>Action</StyledTableCell>
              <StyledTableCell>Entity Type</StyledTableCell>
              <StyledTableCell>Entity Name</StyledTableCell>
              <StyledTableCell>IP Address</StyledTableCell>
              <StyledTableCell align="right">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedLogs.map((log) => (
              <TableRow key={log.id} hover>
                <TableCell>{formatDate(log.createdAt)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'primary.main',
                        fontSize: '0.875rem'
                      }}
                    >
                      {log.username?.charAt(0).toUpperCase() || '?'}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {log.username || 'Unknown'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.action}
                    color={getActionColor(log.action)}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell sx={{ textTransform: 'capitalize' }}>{log.entityType}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{log.entityName || '-'}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{log.ipAddress || '-'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => onViewDetails(log)}
                      sx={{ color: 'primary.main' }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={logs.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  )
}
