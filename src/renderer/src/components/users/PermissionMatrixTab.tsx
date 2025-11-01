import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { green, grey } from '@mui/material/colors'
import {
  getPermissionName,
  getRolePermissions,
  Permission,
  permissionCategories,
  Role,
  roleMetadata
} from '../../utils/permissions'

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: grey[300],
    fontWeight: 600,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14
  }
}))

const StickyTableCell = styled(TableCell)({
  position: 'sticky',
  left: 0,
  backgroundColor: '#fff',
  zIndex: 10,
  fontWeight: 500
})

const CategoryRow = styled(TableRow)({
  backgroundColor: grey[50]
})

const CategoryCell = styled(TableCell)({
  position: 'sticky',
  left: 0,
  backgroundColor: grey[50],
  fontWeight: 700,
  fontSize: 13
})

export default function PermissionMatrixTab(): React.JSX.Element {
  return (
    <Paper sx={{ border: 1, borderColor: 'divider' }}>
      <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Complete Permission Matrix
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Overview of all {(Object.keys(roleMetadata) as Role[]).length} roles and their permissions
        </Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell
                  sx={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 11,
                    backgroundColor: grey[300]
                  }}
                >
                  Category / Permission
                </StyledTableCell>
                {(Object.keys(roleMetadata) as Role[]).map((role) => (
                  <StyledTableCell key={role} align="center">
                    {roleMetadata[role].name}
                  </StyledTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(permissionCategories).map(([category, permissions]) => (
                <>
                  <CategoryRow key={category}>
                    <CategoryCell colSpan={6}>{category}</CategoryCell>
                  </CategoryRow>
                  {permissions.map((permission) => (
                    <TableRow key={permission} hover>
                      <StickyTableCell>
                        {getPermissionName(permission as Permission)}
                      </StickyTableCell>
                      {(Object.keys(roleMetadata) as Role[]).map((role) => {
                        const hasAccess = getRolePermissions(role).includes(
                          permission as Permission
                        )
                        return (
                          <TableCell key={role} align="center">
                            {hasAccess ? (
                              <CheckIcon sx={{ color: green[600], fontSize: 20 }} />
                            ) : (
                              <CloseIcon sx={{ color: grey[300], fontSize: 20 }} />
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  )
}
