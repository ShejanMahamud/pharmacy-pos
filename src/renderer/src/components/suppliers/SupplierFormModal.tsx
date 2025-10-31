import { AutoAwesome, Close } from '@mui/icons-material'
import {
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
import { Supplier, SupplierFormData } from '../../types/supplier'

interface SupplierFormModalProps {
  show: boolean
  editingSupplier: Supplier | null
  formData: SupplierFormData
  loading: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onFormChange: (data: Partial<SupplierFormData>) => void
  onGenerateCode: () => void
}

export default function SupplierFormModal({
  show,
  editingSupplier,
  formData,
  loading,
  onClose,
  onSubmit,
  onFormChange,
  onGenerateCode
}: SupplierFormModalProps): React.JSX.Element {
  return (
    <Dialog open={show} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" fontWeight="bold">
            {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box component="form" id="supplier-form" onSubmit={onSubmit}>
          <Box sx={{ display: 'grid', gap: 3 }}>
            {/* Basic Information */}
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}
            >
              <TextField
                fullWidth
                required
                label="Supplier Name"
                value={formData.name}
                onChange={(e) => onFormChange({ name: e.target.value })}
                placeholder="ABC Pharmaceuticals"
              />

              <TextField
                fullWidth
                required
                label="Supplier Code"
                value={formData.code}
                onChange={(e) => onFormChange({ code: e.target.value })}
                placeholder="SUP001"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={onGenerateCode}
                      size="small"
                      sx={{
                        color: 'primary.main',
                        '&:hover': { bgcolor: 'primary.50' }
                      }}
                      title="Generate Code"
                    >
                      <AutoAwesome fontSize="small" />
                    </IconButton>
                  )
                }}
              />
            </Box>

            <TextField
              fullWidth
              label="Contact Person"
              value={formData.contactPerson}
              onChange={(e) => onFormChange({ contactPerson: e.target.value })}
              placeholder="John Doe"
            />

            {/* Contact Information */}
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}
            >
              <TextField
                fullWidth
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => onFormChange({ phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => onFormChange({ email: e.target.value })}
                placeholder="supplier@example.com"
              />
            </Box>

            <TextField
              fullWidth
              label="Address"
              multiline
              rows={3}
              value={formData.address}
              onChange={(e) => onFormChange({ address: e.target.value })}
              placeholder="123 Main Street, City, Country"
            />

            <TextField
              fullWidth
              label="Tax Number / VAT ID"
              value={formData.taxNumber}
              onChange={(e) => onFormChange({ taxNumber: e.target.value })}
              placeholder="TAX123456"
            />

            {/* Accounting Information */}
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">
              Accounting Information
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 2
              }}
            >
              <TextField
                fullWidth
                label="Opening Balance"
                type="number"
                inputProps={{ step: '0.01' }}
                value={formData.openingBalance}
                onChange={(e) => onFormChange({ openingBalance: e.target.value })}
                placeholder="0.00"
                helperText="Positive = Payable, Negative = Receivable"
              />

              <TextField
                fullWidth
                label="Credit Limit"
                type="number"
                inputProps={{ step: '0.01' }}
                value={formData.creditLimit}
                onChange={(e) => onFormChange({ creditLimit: e.target.value })}
                placeholder="0.00"
                helperText="Maximum credit allowed"
              />

              <TextField
                fullWidth
                label="Credit Days"
                type="number"
                value={formData.creditDays}
                onChange={(e) => onFormChange({ creditDays: e.target.value })}
                placeholder="0"
                helperText="Payment terms in days"
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" form="supplier-form" variant="contained" disabled={loading}>
          {loading ? 'Saving...' : editingSupplier ? 'Update Supplier' : 'Add Supplier'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
