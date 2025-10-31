import { Close } from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
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
import { PurchaseReturn, SalesReturn } from '../../types/return'

interface ReturnDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  returnItem: SalesReturn | PurchaseReturn | null
}

export default function ReturnDetailsModal({
  isOpen,
  onClose,
  returnItem
}: ReturnDetailsModalProps): React.JSX.Element {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getRefundStatusColor = (status: string): 'warning' | 'info' | 'success' | 'default' => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'partial':
        return 'info'
      case 'refunded':
        return 'success'
      default:
        return 'default'
    }
  }

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

  if (!returnItem) {
    return (
      <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1">Loading return details...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    )
  }

  const isSalesReturn = 'customerName' in returnItem

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {isSalesReturn ? 'Sales Return Details' : 'Purchase Return Details'}
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
              Return Number
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {returnItem.returnNumber}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              {isSalesReturn ? 'Customer' : 'Supplier'}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {isSalesReturn
                ? (returnItem as SalesReturn).customerName || 'Walk-in'
                : (returnItem as PurchaseReturn).supplierName}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Total Amount
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {formatCurrency(returnItem.totalAmount)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Refund Status
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip
                label={
                  returnItem.refundStatus.charAt(0).toUpperCase() + returnItem.refundStatus.slice(1)
                }
                size="small"
                color={getRefundStatusColor(returnItem.refundStatus)}
              />
            </Box>
          </Box>
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Reason
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {returnItem.reason || '-'}
            </Typography>
          </Box>
          {returnItem.notes && (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Notes
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {returnItem.notes}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Return Items
        </Typography>
        {returnItem.items && returnItem.items.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Product</StyledTableCell>
                  <StyledTableCell>Quantity</StyledTableCell>
                  <StyledTableCell>Unit Price</StyledTableCell>
                  <StyledTableCell>Subtotal</StyledTableCell>
                  <StyledTableCell>Reason</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {returnItem.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell>{formatCurrency(item.subtotal)}</TableCell>
                    <TableCell>{item.reason || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No items found for this return
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
