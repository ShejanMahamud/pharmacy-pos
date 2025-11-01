import {
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Key as KeyIcon,
  Person as PersonIcon,
  Phone as PhoneIcon
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography
} from '@mui/material'
import { getPermissionName, getRolePermissions, Role, roleMetadata } from '../../utils/permissions'

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

interface UserDetailsPanelProps {
  selectedUser: User | null
  canResetPassword: (user: User) => boolean
  onResetPassword: (user: User) => void
}

export default function UserDetailsPanel({
  selectedUser,
  canResetPassword,
  onResetPassword
}: UserDetailsPanelProps): React.JSX.Element {
  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          User Details
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {selectedUser ? 'Selected user information' : 'Select a user to view details'}
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        {selectedUser ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* User Avatar and Name */}
            <Box
              sx={{ textAlign: 'center', pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 80,
                  height: 80,
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  mx: 'auto',
                  mb: 2
                }}
              >
                {selectedUser.fullName.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedUser.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                @{selectedUser.username}
              </Typography>
            </Box>

            {/* Details */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}
                >
                  Role
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <PersonIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                  <Typography variant="body2">{roleMetadata[selectedUser.role].name}</Typography>
                </Box>
              </Box>

              {selectedUser.email && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}
                  >
                    Email
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <EmailIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                    <Typography variant="body2">{selectedUser.email}</Typography>
                  </Box>
                </Box>
              )}

              {selectedUser.phone && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}
                  >
                    Phone
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <PhoneIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                    <Typography variant="body2">{selectedUser.phone}</Typography>
                  </Box>
                </Box>
              )}

              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}
                >
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={selectedUser.isActive ? 'Active' : 'Inactive'}
                    color={selectedUser.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>

            {/* Actions */}
            {canResetPassword(selectedUser) && (
              <>
                <Divider />
                <Button
                  variant="contained"
                  color="warning"
                  fullWidth
                  startIcon={<KeyIcon />}
                  onClick={() => onResetPassword(selectedUser)}
                  sx={{ py: 1.5 }}
                >
                  Reset Password
                </Button>
              </>
            )}

            {/* Permissions */}
            <Divider />
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  mb: 1,
                  display: 'block'
                }}
              >
                Permissions
              </Typography>
              <List
                dense
                sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'grey.50', borderRadius: 1 }}
              >
                {getRolePermissions(selectedUser.role).map((permission) => (
                  <ListItem key={permission}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircleIcon sx={{ fontSize: '1rem', color: 'success.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={getPermissionName(permission)}
                      primaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Click on a user to view details
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  )
}
