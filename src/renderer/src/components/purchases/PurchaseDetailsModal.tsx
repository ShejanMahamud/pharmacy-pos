import { Close } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { Purchase, PurchaseItem } from '../../types/purchase'

interface PurchaseDetailsModalProps {
  isOpen: boolean
  purchase: Purchase | null
  items: PurchaseItem[]
  currencySymbol: string
  onClose: () => void
}

export default function PurchaseDetailsModal({
  isOpen,
  purchase,
  items,
  currencySymbol,
  onClose
}: PurchaseDetailsModalProps): React.JSX.Element | null {
  if (!purchase) return null

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.grey[100],
      color: theme.palette.text.secondary,
      fontWeight: 600,
      textTransform: 'uppercase',
      fontSize: '0.75rem',
      letterSpacing: '0.5px'
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14
    }
  }))

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Purchase Details
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Invoice Number
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {purchase.invoiceNumber}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Date & Time
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {new Date(purchase.createdAt).toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Supplier
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {purchase.supplierName || 'N/A'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Payment Status
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
              {purchase.paymentStatus}
            </Typography>
          </Box>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Items
        </Typography>
        <TableContainer sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <StyledTableCell>Product</StyledTableCell>
                <StyledTableCell>Batch</StyledTableCell>
                <StyledTableCell>Qty</StyledTableCell>
                <StyledTableCell>Price</StyledTableCell>
                <StyledTableCell align="right">Subtotal</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.batchNumber || 'N/A'}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
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
        </TableContainer>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Total Amount:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {currencySymbol}
              {purchase.totalAmount.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Paid:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
              {currencySymbol}
              {purchase.paidAmount.toFixed(2)}
            </Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Due Amount:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
              {currencySymbol}
              {purchase.dueAmount.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
