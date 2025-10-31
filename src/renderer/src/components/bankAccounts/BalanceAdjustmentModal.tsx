import { Close } from '@mui/icons-material'
import {
  Alert,
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
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material'
import { BalanceAdjustmentData, BankAccount } from '../../types/bankAccount'

interface BalanceAdjustmentModalProps {
  show: boolean
  account: BankAccount | null
  adjustmentData: BalanceAdjustmentData
  loading: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onAdjustmentDataChange: (data: Partial<BalanceAdjustmentData>) => void
}

export default function BalanceAdjustmentModal({
  show,
  account,
  adjustmentData,
  loading,
  onClose,
  onSubmit,
  onAdjustmentDataChange
}: BalanceAdjustmentModalProps): React.JSX.Element | null {
  if (!account) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(e)
  }

  return (
    <Dialog
      open={show}
      onClose={onClose}
      maxWidth="sm"
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
          Adjust Account Balance
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'grey.400' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <Box component="span" sx={{ fontWeight: 600 }}>
                Account:
              </Box>{' '}
              {account.name}
            </Typography>
            <Typography variant="body2">
              <Box component="span" sx={{ fontWeight: 600 }}>
                Current Balance:
              </Box>{' '}
              <Box
                component="span"
                sx={{
                  fontWeight: 'bold',
                  color: account.currentBalance >= 0 ? 'success.main' : 'error.main'
                }}
              >
                ${Math.abs(account.currentBalance).toFixed(2)}
              </Box>
            </Typography>
          </Paper>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Adjustment Type</InputLabel>
              <Select
                value={adjustmentData.type}
                label="Adjustment Type"
                onChange={(e) =>
                  onAdjustmentDataChange({
                    type: e.target.value as 'credit' | 'debit'
                  })
                }
              >
                <MenuItem value="credit">Credit (Add Money)</MenuItem>
                <MenuItem value="debit">Debit (Deduct Money)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Amount"
              type="number"
              value={adjustmentData.amount}
              onChange={(e) => onAdjustmentDataChange({ amount: e.target.value })}
              fullWidth
              required
              placeholder="0.00"
              inputProps={{ step: '0.01' }}
            />

            <TextField
              label="Reason"
              value={adjustmentData.reason}
              onChange={(e) => onAdjustmentDataChange({ reason: e.target.value })}
              fullWidth
              required
              multiline
              rows={3}
              placeholder="Explain the reason for this adjustment (for audit trail)"
            />

            <Alert severity="warning" sx={{ fontSize: '0.75rem' }}>
              <strong>Note:</strong> This adjustment will be recorded for audit purposes. Make sure
              to provide a clear reason for the adjustment.
            </Alert>
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
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
          >
            {loading ? 'Adjusting...' : 'Adjust Balance'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
