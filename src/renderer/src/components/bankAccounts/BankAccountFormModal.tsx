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
import { BankAccount, BankAccountFormData } from '../../types/bankAccount'

interface BankAccountFormModalProps {
  show: boolean
  editingAccount: BankAccount | null
  formData: BankAccountFormData
  loading: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onFormChange: (data: Partial<BankAccountFormData>) => void
}

export default function BankAccountFormModal({
  show,
  editingAccount,
  formData,
  loading,
  onClose,
  onSubmit,
  onFormChange
}: BankAccountFormModalProps): React.JSX.Element | null {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(e)
  }

  return (
    <Dialog
      open={show}
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
          {editingAccount ? 'Edit Account' : 'Add New Account'}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'grey.400' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2
            }}
          >
            <TextField
              label="Account Name"
              value={formData.name}
              onChange={(e) => onFormChange({ name: e.target.value })}
              required
              fullWidth
              placeholder="Cash in Hand / HSBC Account"
            />

            <FormControl fullWidth required>
              <InputLabel>Account Type</InputLabel>
              <Select
                value={formData.accountType}
                label="Account Type"
                onChange={(e) =>
                  onFormChange({
                    accountType: e.target.value as 'cash' | 'bank' | 'mobile_banking'
                  })
                }
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="bank">Bank Account</MenuItem>
                <MenuItem value="mobile_banking">Mobile Banking</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Account Number"
              value={formData.accountNumber}
              onChange={(e) => onFormChange({ accountNumber: e.target.value })}
              fullWidth
              placeholder="1234567890"
            />

            <TextField
              label={
                formData.accountType === 'bank'
                  ? 'Bank Name'
                  : formData.accountType === 'mobile_banking'
                    ? 'Provider Name'
                    : 'Bank/Provider'
              }
              value={formData.bankName}
              onChange={(e) => onFormChange({ bankName: e.target.value })}
              fullWidth
              placeholder={
                formData.accountType === 'bank'
                  ? 'HSBC Bank'
                  : formData.accountType === 'mobile_banking'
                    ? 'bKash / Nagad'
                    : 'Bank or Provider Name'
              }
            />

            {formData.accountType === 'bank' && (
              <TextField
                label="Branch Name"
                value={formData.branchName}
                onChange={(e) => onFormChange({ branchName: e.target.value })}
                fullWidth
                placeholder="Main Branch"
              />
            )}

            {formData.accountType !== 'cash' && (
              <TextField
                label="Account Holder"
                value={formData.accountHolder}
                onChange={(e) => onFormChange({ accountHolder: e.target.value })}
                fullWidth
                placeholder="John Doe"
              />
            )}

            <TextField
              label="Opening Balance"
              type="number"
              value={formData.openingBalance}
              onChange={(e) => onFormChange({ openingBalance: e.target.value })}
              fullWidth
              placeholder="0.00"
              disabled={!!editingAccount}
              helperText={editingAccount ? 'Opening balance cannot be changed after creation' : ''}
            />

            <TextField
              label="Description / Notes"
              value={formData.description}
              onChange={(e) => onFormChange({ description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="Additional notes about this account"
              sx={{ gridColumn: { md: 'span 2' } }}
            />
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
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : editingAccount ? 'Update Account' : 'Add Account'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
