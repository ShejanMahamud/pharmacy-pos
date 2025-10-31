import { Close } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { BankAccount, Purchase } from '../../types/purchase'

interface ReturnItem {
  purchaseItemId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  maxQuantity: number
}

interface ReturnFormData {
  purchaseId: string
  accountId: string
  refundAmount: number
  reason: string
  notes: string
}

interface PurchaseReturnModalProps {
  isOpen: boolean
  purchases: Purchase[]
  accounts: BankAccount[]
  currencySymbol: string
  onClose: () => void
  onSuccess: () => void
}

export default function PurchaseReturnModal({
  isOpen,
  purchases,
  accounts,
  currencySymbol,
  onClose,
  onSuccess
}: PurchaseReturnModalProps): React.JSX.Element | null {
  const [returnFormData, setReturnFormData] = useState<ReturnFormData>({
    purchaseId: '',
    accountId: '',
    refundAmount: 0,
    reason: '',
    notes: ''
  })

  const [returnItems, setReturnItems] = useState<ReturnItem[]>([])

  const handleClose = (): void => {
    setReturnFormData({
      purchaseId: '',
      accountId: '',
      refundAmount: 0,
      reason: '',
      notes: ''
    })
    setReturnItems([])
    onClose()
  }

  const handlePurchaseSelect = async (purchaseId: string): Promise<void> => {
    setReturnFormData({ ...returnFormData, purchaseId })

    if (purchaseId) {
      try {
        const purchase = await window.api.purchases.getById(purchaseId)
        if (purchase && purchase.items) {
          setReturnItems(
            purchase.items.map((item) => ({
              purchaseItemId: item.id,
              productId: item.productId,
              productName: item.productName,
              quantity: 0,
              unitPrice: item.unitPrice,
              maxQuantity: item.quantity
            }))
          )
        }
      } catch (error) {
        toast.error('Failed to load purchase items')
        console.error(error)
      }
    } else {
      setReturnItems([])
    }
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    try {
      if (!returnFormData.purchaseId || returnItems.length === 0) {
        toast.error('Please fill all required fields')
        return
      }

      const purchase = await window.api.purchases.getById(returnFormData.purchaseId)
      if (!purchase) {
        toast.error('Purchase not found')
        return
      }

      const totalAmount = returnItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

      await window.api.purchaseReturns.create(
        {
          returnNumber: `PR-${Date.now()}`,
          purchaseId: returnFormData.purchaseId,
          supplierId: purchase.supplierId,
          accountId: returnFormData.accountId || null,
          userId: 'current-user',
          subtotal: totalAmount,
          taxAmount: 0,
          discountAmount: 0,
          totalAmount,
          refundAmount: returnFormData.refundAmount,
          refundStatus:
            returnFormData.refundAmount >= totalAmount
              ? 'refunded'
              : returnFormData.refundAmount > 0
                ? 'partial'
                : 'pending',
          reason: returnFormData.reason,
          notes: returnFormData.notes
        },
        returnItems
      )

      toast.success('Purchase return created successfully')
      handleClose()
      onSuccess()
    } catch (error) {
      toast.error('Failed to create purchase return')
      console.error(error)
    }
  }

  const totalReturnAmount = returnItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Create Purchase Return
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
              mb: 3
            }}
          >
            <FormControl fullWidth size="small" required>
              <InputLabel>Select Purchase</InputLabel>
              <Select
                value={returnFormData.purchaseId}
                label="Select Purchase"
                onChange={(e) => handlePurchaseSelect(e.target.value)}
              >
                <MenuItem value="">Select a purchase</MenuItem>
                {purchases.map((purchase) => (
                  <MenuItem key={purchase.id} value={purchase.id}>
                    {purchase.invoiceNumber} - {purchase.supplierName} ({currencySymbol}
                    {purchase.totalAmount.toFixed(2)})
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
                  setReturnFormData({ ...returnFormData, accountId: e.target.value })
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
                <FormHelperText>Money will be added back to this account</FormHelperText>
              )}
            </FormControl>
          </Box>

          {returnItems.length > 0 && (
            <Box
              sx={{
                border: 1,
                borderColor: 'grey.300',
                borderRadius: 1,
                p: 2,
                mb: 2
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Return Items
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {returnItems.map((item, index) => (
                  <Box
                    key={item.purchaseItemId}
                    sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.productName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Max: {item.maxQuantity} | Price: {currencySymbol}
                        {item.unitPrice.toFixed(2)}
                      </Typography>
                    </Box>
                    <TextField
                      size="small"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const qty = Math.min(parseInt(e.target.value) || 0, item.maxQuantity)
                        const updated = [...returnItems]
                        updated[index].quantity = qty
                        setReturnItems(updated)
                      }}
                      inputProps={{ min: 0, max: item.maxQuantity }}
                      placeholder="Qty"
                      sx={{ width: 100 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, width: 100, textAlign: 'right' }}
                    >
                      {currencySymbol}
                      {(item.quantity * item.unitPrice).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 2,
                  pt: 2,
                  borderTop: 1,
                  borderColor: 'grey.300'
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Total Return Amount:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {currencySymbol}
                  {totalReturnAmount.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
              mb: 2
            }}
          >
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Refund Amount"
              value={returnFormData.refundAmount}
              onChange={(e) =>
                setReturnFormData({
                  ...returnFormData,
                  refundAmount: parseFloat(e.target.value) || 0
                })
              }
              inputProps={{ step: '0.01' }}
            />

            <TextField
              fullWidth
              size="small"
              required
              label="Return Reason"
              value={returnFormData.reason}
              onChange={(e) => setReturnFormData({ ...returnFormData, reason: e.target.value })}
              placeholder="Damaged, Expired, etc."
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={returnFormData.notes}
            onChange={(e) => setReturnFormData({ ...returnFormData, notes: e.target.value })}
            placeholder="Additional notes..."
          />
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={returnItems.filter((i) => i.quantity > 0).length === 0}
          >
            Create Return
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
