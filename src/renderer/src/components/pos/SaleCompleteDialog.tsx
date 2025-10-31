import { CheckCircle, Close } from '@mui/icons-material'
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import PrintButtons from '../shared/PrintButtons'

interface SaleItem {
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
  discountPercent?: number
  taxRate?: number
}

interface SaleDetails {
  invoiceNumber: string
  customerName?: string
  date: string
  items: SaleItem[]
  subtotal: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  paidAmount: number
  changeAmount: number
  paymentMethod: string
  pointsRedeemed?: number
}

interface SaleCompleteDialogProps {
  open: boolean
  saleDetails: SaleDetails | null
  currencySymbol: string
  onClose: () => void
  onPdfPrint: () => void
  onThermalPrint: () => void
}

export default function SaleCompleteDialog({
  open,
  saleDetails,
  currencySymbol,
  onClose,
  onPdfPrint,
  onThermalPrint
}: SaleCompleteDialogProps): React.JSX.Element {
  if (!saleDetails) return <></>

  const getPaymentMethodLabel = (method: string): string => {
    if (method === 'cash') return 'Cash'
    if (method === 'bank') return 'Bank'
    if (method === 'mobile_banking') return 'Mobile Banking'
    return method
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle sx={{ color: 'success.main', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Sale Completed Successfully
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Invoice Header */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Invoice Number
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {saleDetails.invoiceNumber}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                Date & Time
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {new Date(saleDetails.date).toLocaleDateString()}{' '}
                {new Date(saleDetails.date).toLocaleTimeString()}
              </Typography>
            </Box>
          </Box>

          {saleDetails.customerName && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Customer
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {saleDetails.customerName}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Items Table */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Items
        </Typography>
        <Table size="small" sx={{ mb: 3 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                Qty
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Price
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Total
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {saleDetails.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.productName}</TableCell>
                <TableCell align="center">{item.quantity}</TableCell>
                <TableCell align="right">
                  {currencySymbol}
                  {item.unitPrice.toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  {currencySymbol}
                  {item.subtotal.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Divider sx={{ my: 2 }} />

        {/* Payment Summary */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Subtotal
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {currencySymbol}
              {saleDetails.subtotal.toFixed(2)}
            </Typography>
          </Box>

          {saleDetails.discountAmount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Discount
                {saleDetails.pointsRedeemed && saleDetails.pointsRedeemed > 0 && (
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{ ml: 0.5, color: 'success.main' }}
                  >
                    (incl. {saleDetails.pointsRedeemed} points)
                  </Typography>
                )}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'error.main' }}>
                -{currencySymbol}
                {saleDetails.discountAmount.toFixed(2)}
              </Typography>
            </Box>
          )}

          {saleDetails.taxAmount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Tax
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {currencySymbol}
                {saleDetails.taxAmount.toFixed(2)}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {currencySymbol}
              {saleDetails.totalAmount.toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Payment Method
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {getPaymentMethodLabel(saleDetails.paymentMethod)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Paid Amount
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {currencySymbol}
              {saleDetails.paidAmount.toFixed(2)}
            </Typography>
          </Box>

          {saleDetails.changeAmount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Change
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                {currencySymbol}
                {saleDetails.changeAmount.toFixed(2)}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Print Buttons */}
        <PrintButtons onPdfPrint={onPdfPrint} onThermalPrint={onThermalPrint} />
      </DialogContent>
    </Dialog>
  )
}
