import { CheckCircle, Close, Error as ErrorIcon } from '@mui/icons-material'
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
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { BankAccount, PaymentFormData, PaymentReceipt, Supplier } from '../../types/supplier'

interface PaymentModalProps {
  show: boolean
  supplier: Supplier | null
  bankAccounts: BankAccount[]
  paymentData: PaymentFormData
  loading: boolean
  storeName?: string
  storePhone?: string
  storeEmail?: string
  storeAddress?: string
  currency: string
  userName?: string
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onPaymentDataChange: (data: Partial<PaymentFormData>) => void
}

export default function PaymentModal({
  show,
  supplier,
  bankAccounts,
  paymentData,
  loading,
  onClose,
  onSubmit,
  onPaymentDataChange
}: PaymentModalProps): React.JSX.Element {
  const totalBalance = supplier
    ? (supplier.openingBalance || 0) + (supplier.currentBalance || 0)
    : 0
  const selectedAccount = bankAccounts.find((acc) => acc.id === paymentData.accountId)
  const paymentAmount = parseFloat(paymentData.amount)

  return (
    <Dialog open={show && !!supplier} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" fontWeight="bold">
            Record Payment
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      {supplier && (
        <form onSubmit={onSubmit}>
          <DialogContent dividers>
            {/* Supplier Info */}
            <Paper sx={{ bgcolor: 'primary.50', p: 2, mb: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Supplier
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {supplier.name}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Current Balance:{' '}
                <Typography component="span" sx={{ fontWeight: 600, color: 'error.main' }}>
                  ${totalBalance.toFixed(2)} (Payable)
                </Typography>
              </Typography>
            </Paper>

            <Box sx={{ display: 'grid', gap: 3 }}>
              <TextField
                fullWidth
                required
                label="Payment Amount"
                type="number"
                inputProps={{ min: '0.01', step: '0.01' }}
                value={paymentData.amount}
                onChange={(e) => onPaymentDataChange({ amount: e.target.value })}
                placeholder="0.00"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />

              <FormControl fullWidth required>
                <InputLabel>Payment Account</InputLabel>
                <Select
                  value={paymentData.accountId}
                  label="Payment Account"
                  onChange={(e) => onPaymentDataChange({ accountId: e.target.value })}
                >
                  <MenuItem value="">-- Select Payment Account --</MenuItem>
                  {bankAccounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.name} - Balance: ${account.currentBalance.toFixed(2)}
                    </MenuItem>
                  ))}
                </Select>
                {paymentData.accountId && paymentData.amount && selectedAccount && (
                  <>
                    {!isNaN(paymentAmount) && selectedAccount.currentBalance < paymentAmount ? (
                      <Alert severity="error" sx={{ mt: 1 }} icon={<ErrorIcon />}>
                        Insufficient balance! Available: $
                        {selectedAccount.currentBalance.toFixed(2)}
                      </Alert>
                    ) : !isNaN(paymentAmount) ? (
                      <Alert severity="success" sx={{ mt: 1 }} icon={<CheckCircle />}>
                        Remaining balance after payment: $
                        {(selectedAccount.currentBalance - paymentAmount).toFixed(2)}
                      </Alert>
                    ) : null}
                  </>
                )}
                {bankAccounts.length === 0 && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    No accounts available. Please create a bank account first.
                  </Alert>
                )}
              </FormControl>

              <TextField
                fullWidth
                required
                label="Payment Date"
                type="date"
                value={paymentData.paymentDate}
                onChange={(e) => onPaymentDataChange({ paymentDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={paymentData.notes}
                onChange={(e) => onPaymentDataChange({ notes: e.target.value })}
                placeholder="Add payment notes..."
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={onClose} variant="outlined" disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
            >
              {loading ? 'Processing...' : 'Record Payment'}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  )
}

// Export the PDF generation function separately
export function generatePaymentPDF(
  supplier: Supplier,
  payment: PaymentReceipt,
  storeInfo: {
    storeName?: string
    storePhone?: string
    storeEmail?: string
    storeAddress?: string
    currency: string
    userName?: string
  }
): void {
  const doc = new jsPDF()
  const { storeName, storePhone, storeEmail, storeAddress, currency, userName } = storeInfo

  // Add company logo/header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(storeName || 'Pharmacy POS', 105, 20, { align: 'center' })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (storeAddress) doc.text(storeAddress, 105, 28, { align: 'center' })
  if (storePhone) doc.text(`Phone: ${storePhone}`, 105, 34, { align: 'center' })
  if (storeEmail) doc.text(`Email: ${storeEmail}`, 105, 40, { align: 'center' })

  // Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('PAYMENT RECEIPT', 105, 55, { align: 'center' })

  // Line separator
  doc.setLineWidth(0.5)
  doc.line(20, 60, 190, 60)

  // Payment details
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')

  let yPos = 70

  // Left column
  doc.setFont('helvetica', 'bold')
  doc.text('Receipt No:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(payment.referenceNumber, 70, yPos)

  yPos += 8
  doc.setFont('helvetica', 'bold')
  doc.text('Date:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(new Date(payment.paymentDate).toLocaleDateString(), 70, yPos)

  yPos += 8
  doc.setFont('helvetica', 'bold')
  doc.text('Payment Account:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(payment.accountName, 70, yPos)

  // Supplier information
  yPos += 15
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('PAID TO:', 20, yPos)

  yPos += 8
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Supplier: ${supplier.name}`, 20, yPos)

  yPos += 6
  doc.text(`Code: ${supplier.code}`, 20, yPos)

  if (supplier.contactPerson) {
    yPos += 6
    doc.text(`Contact Person: ${supplier.contactPerson}`, 20, yPos)
  }

  if (supplier.phone) {
    yPos += 6
    doc.text(`Phone: ${supplier.phone}`, 20, yPos)
  }

  if (supplier.email) {
    yPos += 6
    doc.text(`Email: ${supplier.email}`, 20, yPos)
  }

  // Payment amount box
  yPos += 15
  doc.setLineWidth(0.5)
  doc.rect(20, yPos, 170, 25)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Amount Paid:', 25, yPos + 10)

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  const currencySymbol = currency === 'BDT' ? '৳' : '$'
  doc.text(`${currencySymbol}${payment.amount.toFixed(2)}`, 185, yPos + 15, { align: 'right' })

  // Notes
  if (payment.notes) {
    yPos += 35
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Notes:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    const splitNotes = doc.splitTextToSize(payment.notes, 170)
    doc.text(splitNotes, 20, yPos + 6)
    yPos += 6 * splitNotes.length + 10
  }

  // Footer
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text('Thank you for your business!', 105, 270, { align: 'center' })
  doc.text(`Generated on: ${new Date().toLocaleString()} by ${userName || 'System'}`, 105, 277, {
    align: 'center'
  })

  // Save PDF
  const fileName = `Payment_${payment.referenceNumber}_${supplier.code}.pdf`
  doc.save(fileName)
}
