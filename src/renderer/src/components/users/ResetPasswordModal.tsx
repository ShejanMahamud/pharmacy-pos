import CloseIcon from '@mui/icons-material/Close'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Typography
} from '@mui/material'
import { useState } from 'react'
import { Role } from '../../utils/permissions'

interface User {
  id: string
  username: string
  fullName: string
  role: Role
}

interface ResetPasswordModalProps {
  isOpen: boolean
  user: User | null
  onClose: () => void
  onSubmit: (password: string) => Promise<void>
}

export default function ResetPasswordModal({
  isOpen,
  user,
  onClose,
  onSubmit
}: ResetPasswordModalProps): React.JSX.Element | null {
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!newPassword || !confirmNewPassword) {
      return
    }

    if (newPassword.length < 6) {
      return
    }

    if (newPassword !== confirmNewPassword) {
      return
    }

    await onSubmit(newPassword)
    setNewPassword('')
    setConfirmNewPassword('')
  }

  const handleClose = (): void => {
    setNewPassword('')
    setConfirmNewPassword('')
    onClose()
  }

  return (
    <Dialog open={isOpen && !!user} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Reset password for <strong>{user?.fullName}</strong>
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Important
            </Typography>
            <Typography variant="body2">
              The user will be required to change this password on their next login.
            </Typography>
          </Alert>

          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
            fullWidth
            inputProps={{ minLength: 6 }}
            helperText="Minimum 6 characters"
            sx={{ mb: 2 }}
          />

          <TextField
            label="Confirm New Password"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            fullWidth
            inputProps={{ minLength: 6 }}
          />
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="warning">
            Reset Password
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
