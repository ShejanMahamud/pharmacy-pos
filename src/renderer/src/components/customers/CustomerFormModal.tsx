import { Close } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material'
import { Customer, CustomerFormData } from '../../types/customer'

interface CustomerFormModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
  formData: CustomerFormData
  onFormDataChange: (data: CustomerFormData) => void
  onSubmit: (e: React.FormEvent) => void
}

export default function CustomerFormModal({
  isOpen,
  onClose,
  customer,
  formData,
  onFormDataChange,
  onSubmit
}: CustomerFormModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(e)
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'grey.200',
          pb: 2
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'grey.900' }}>
          {customer ? 'Edit Customer' : 'Add New Customer'}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'grey.400' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'grey.900', mb: 2 }}>
              Basic Information
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: 2
              }}
            >
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                required
                fullWidth
                placeholder="Enter customer name"
              />

              <TextField
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => onFormDataChange({ ...formData, phone: e.target.value })}
                required
                fullWidth
                placeholder="Enter phone number"
              />

              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
                fullWidth
                placeholder="Enter email address"
              />

              <TextField
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => onFormDataChange({ ...formData, dateOfBirth: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Address"
                value={formData.address}
                onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
                fullWidth
                multiline
                rows={3}
                placeholder="Enter full address"
                sx={{ gridColumn: { md: 'span 2' } }}
              />

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => onFormDataChange({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            borderTop: '1px solid',
            borderColor: 'grey.200',
            px: 3,
            py: 2
          }}
        >
          <Button onClick={onClose} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            {customer ? 'Update Customer' : 'Add Customer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
