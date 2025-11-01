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
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material'
import { useState } from 'react'
import { getPermissionName, getRolePermissions, Role, roleMetadata } from '../../utils/permissions'

interface CreateUserModalProps {
  isOpen: boolean
  availableRoles: Role[]
  onClose: () => void
  onSubmit: (formData: {
    username: string
    password: string
    fullName: string
    email: string
    phone: string
    role: Role
  }) => Promise<void>
}

export default function CreateUserModal({
  isOpen,
  availableRoles,
  onClose,
  onSubmit
}: CreateUserModalProps): React.JSX.Element | null {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'cashier' as Role
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    await onSubmit(formData)
    setFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      phone: '',
      role: 'cashier'
    })
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Create New User
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2
            }}
          >
            <TextField
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              fullWidth
              sx={{ gridColumn: { md: 'span 2' } }}
            />

            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
            />

            <TextField
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />

            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              >
                {availableRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {roleMetadata[role].name}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {roleMetadata[formData.role].description}
              </Typography>
            </FormControl>
          </Box>

          {/* Permissions Preview */}
          <Paper elevation={0} sx={{ mt: 3, p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Permissions for {roleMetadata[formData.role].name}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {getRolePermissions(formData.role)
                .slice(0, 10)
                .map((permission) => (
                  <Chip
                    key={permission}
                    label={getPermissionName(permission)}
                    size="small"
                    variant="outlined"
                  />
                ))}
              {getRolePermissions(formData.role).length > 10 && (
                <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                  +{getRolePermissions(formData.role).length - 10} more
                </Typography>
              )}
            </Box>
          </Paper>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Create User
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
