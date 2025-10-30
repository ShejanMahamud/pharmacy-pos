import { Close } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material'
import { BankAccount, ReturnFormData, ReturnItem, Sale } from '../../types/sale'

interface SaleReturnModalProps {
  isOpen: boolean
  sales: Sale[]
  accounts: BankAccount[]
  returnFormData: ReturnFormData
  returnItems: ReturnItem[]
  currencySymbol: string
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onReturnFormDataChange: (data: ReturnFormData) => void
  onReturnItemsChange: (items: ReturnItem[]) => void
  onSaleSelect: (saleId: string) => void
}

export default function SaleReturnModal({
  isOpen,
  sales,
  accounts,
  returnFormData,
  returnItems,
  currencySymbol,
  onClose,
  onSubmit,
  onReturnFormDataChange,
  onReturnItemsChange,
  onSaleSelect
}: SaleReturnModalProps): React.JSX.Element | null {
  const totalReturnAmount = returnItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Create Sales Return
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={onSubmit}>
        <DialogContent dividers>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
              mb: 3
            }}
          >
            <FormControl fullWidth size="small" required>
              <InputLabel>Select Sale</InputLabel>
              <Select
                value={returnFormData.saleId}
                label="Select Sale"
                onChange={(e) => onSaleSelect(e.target.value)}
              >
                <MenuItem value="">Select a sale</MenuItem>
                {sales.map((sale) => (
                  <MenuItem key={sale.id} value={sale.id}>
                    {sale.invoiceNumber} - {sale.customerName || 'Walk-in'} ({currencySymbol}
                    {sale.totalAmount.toFixed(2)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Refund Account (Optional)</InputLabel>
              <Select
                value={returnFormData.accountId}
                label="Refund Account (Optional)"
                onChange={(e) =>
                  onReturnFormDataChange({ ...returnFormData, accountId: e.target.value })
                }
              >
                <MenuItem value="">No Account</MenuItem>
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name} - {currencySymbol}
                    {account.currentBalance.toFixed(2)}
                  </MenuItem>
                ))}
              </Select>
              {returnFormData.accountId && (
                <FormHelperText>Money will be deducted from this account</FormHelperText>
              )}
            </FormControl>
          </Box>

          {returnItems.length > 0 && (
            <Paper sx={{ p: 3, mt: 3, mb: 3, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Return Items
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {returnItems.map((item, index) => (
                  <Box key={item.saleItemId} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.productName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Max: {item.maxQuantity} | Price: {currencySymbol}
                        {item.unitPrice.toFixed(2)}
                      </Typography>
                    </Box>
                    <TextField
                      type="number"
                      size="small"
                      inputProps={{ min: 0, max: item.maxQuantity }}
                      value={item.quantity}
                      onChange={(e) => {
                        const qty = Math.min(parseInt(e.target.value) || 0, item.maxQuantity)
                        const updated = [...returnItems]
                        updated[index].quantity = qty
                        onReturnItemsChange(updated)
                      }}
                      placeholder="Qty"
                      sx={{ width: 100 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, width: 100, textAlign: 'right' }}
                    >
                      {currencySymbol}
                      {(item.quantity * item.unitPrice).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Total Return Amount:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {currencySymbol}
                  {totalReturnAmount.toFixed(2)}
                </Typography>
              </Box>
            </Paper>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
              mt: 2,
              mb: 2
            }}
          >
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Refund Amount"
              inputProps={{ step: 0.01 }}
              value={returnFormData.refundAmount}
              onChange={(e) =>
                onReturnFormDataChange({
                  ...returnFormData,
                  refundAmount: parseFloat(e.target.value) || 0
                })
              }
            />

            <TextField
              fullWidth
              size="small"
              required
              label="Return Reason"
              value={returnFormData.reason}
              onChange={(e) =>
                onReturnFormDataChange({ ...returnFormData, reason: e.target.value })
              }
              placeholder="Damaged, Wrong item, etc."
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              label="Notes"
              value={returnFormData.notes}
              onChange={(e) => onReturnFormDataChange({ ...returnFormData, notes: e.target.value })}
              placeholder="Additional notes..."
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" fullWidth>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={returnItems.filter((i) => i.quantity > 0).length === 0}
            sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
          >
            Create Return
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
