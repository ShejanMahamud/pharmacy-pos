import { Person as PersonIcon } from '@mui/icons-material'
import {
  Avatar,
  Box,
  Button,
  Chip,
  FormControl,
  MenuItem,
  Paper,
  Select,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from '@mui/material'
import { useState } from 'react'
import { canChangeUserRole, getAssignableRoles, Role, roleMetadata } from '../../utils/permissions'

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

interface UserTableProps {
  users: User[]
  currentUser: User | null
  hasEditPermission: boolean
  onUserSelect: (user: User) => void
  onRoleChange: (userId: string, targetUser: User, newRole: Role) => void
  onToggleStatus: (userId: string, currentStatus: boolean) => void
  currentPage: number
  totalPages: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
}

export default function UserTable({
  users,
  currentUser,
  hasEditPermission,
  onUserSelect,
  onRoleChange,
  onToggleStatus
}: UserTableProps): React.JSX.Element {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  const handleChangePage = (_event: unknown, newPage: number): void => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  if (users.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{ p: 8, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}
      >
        <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No Users Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No users match your search criteria
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          System Users
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage user accounts and access
        </Typography>
      </Box>

      <TableContainer sx={{ maxHeight: 540 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell>User</StyledTableCell>
              <StyledTableCell>Role</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              {hasEditPermission && <StyledTableCell align="center">Actions</StyledTableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow
                key={user.id}
                hover
                onClick={() => onUserSelect(user)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                      {user.fullName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {user.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        @{user.username}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {hasEditPermission && currentUser ? (
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <Select
                        value={user.role}
                        onChange={(e) => {
                          e.stopPropagation()
                          onRoleChange(user.id, user, e.target.value as Role)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        disabled={
                          currentUser.id === user.id ||
                          !canChangeUserRole(currentUser.role, user.role, user.role)
                        }
                      >
                        {getAssignableRoles(currentUser.role).map((role) => (
                          <MenuItem key={role} value={role}>
                            {roleMetadata[role].name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Chip
                      icon={<PersonIcon />}
                      label={roleMetadata[user.role].name}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? 'Active' : 'Inactive'}
                    color={user.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                {hasEditPermission && (
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      color={user.isActive ? 'error' : 'success'}
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleStatus(user.id, user.isActive || false)
                      }}
                      disabled={currentUser?.id === user.id}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={users.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  )
}
