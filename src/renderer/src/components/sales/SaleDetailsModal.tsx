import { Close } from '@mui/icons-material'
import {
  Box,
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
import toast from 'react-hot-toast'
import { Sale, SaleItem } from '../../types/sale'
import { printPDFReceipt } from '../../utils/pdfPrint'
import { printThermalReceipt } from '../../utils/thermalPrint'
import PrintButtons from '../shared/PrintButtons'

interface SaleDetailsModalProps {
  isOpen: boolean
  sale: Sale | null
  saleItems: SaleItem[]
  currencySymbol: string
  storeName?: string
  storeAddress?: string
  storePhone?: string
  onClose: () => void
}

export default function SaleDetailsModal({
  isOpen,
  sale,
  saleItems,
  currencySymbol,
  storeName,
  storeAddress,
  storePhone,
  onClose
}: SaleDetailsModalProps): React.JSX.Element | null {
  if (!sale) return null

  const handlePdfPrint = (): void => {
    try {
      const receiptData = {
        invoiceNumber: sale.invoiceNumber,
        customerName: sale.customerName || 'Walk-in Customer',
        date: new Date(sale.createdAt).toLocaleString(),
        items: saleItems.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal
        })),
        subtotal: sale.totalAmount,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: sale.totalAmount,
        paidAmount: sale.paidAmount,
        changeAmount: sale.changeAmount,
        paymentMethod: sale.paymentMethod,
        storeName,
        storeAddress,
        storePhone
      }

      printPDFReceipt(receiptData, currencySymbol)
      toast.success('PDF receipt generated successfully')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF receipt')
    }
  }

  const handleThermalPrint = (): void => {
    try {
      const receiptData = {
        invoiceNumber: sale.invoiceNumber,
        customerName: sale.customerName || 'Walk-in Customer',
        date: new Date(sale.createdAt).toLocaleString(),
        items: saleItems.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal
        })),
        subtotal: sale.totalAmount,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: sale.totalAmount,
        paidAmount: sale.paidAmount,
        changeAmount: sale.changeAmount,
        paymentMethod: sale.paymentMethod,
        storeName,
        storeAddress,
        storePhone
      }

      printThermalReceipt(receiptData, currencySymbol)
      toast.success('Thermal receipt sent to printer')
    } catch (error) {
      console.error('Error printing thermal receipt:', error)
      toast.error('Failed to print thermal receipt')
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

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Sale Details
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
              {sale.invoiceNumber}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Date & Time
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {new Date(sale.createdAt).toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Customer
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {sale.customerName || 'Walk-in Customer'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Payment Method
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
              {sale.paymentMethod}
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
                <StyledTableCell>Qty</StyledTableCell>
                <StyledTableCell>Price</StyledTableCell>
                <StyledTableCell>Discount</StyledTableCell>
                <StyledTableCell align="right">Subtotal</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {saleItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {currencySymbol}
                    {item.unitPrice.toFixed(2)}
                  </TableCell>
                  <TableCell>{item.discountPercent}%</TableCell>
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
              Paid Amount:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {currencySymbol}
              {sale.paidAmount.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Change:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {currencySymbol}
              {sale.changeAmount.toFixed(2)}
            </Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Total Amount:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {currencySymbol}
              {sale.totalAmount.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1, flexDirection: 'row' }}>
        <PrintButtons onPdfPrint={handlePdfPrint} onThermalPrint={handleThermalPrint} />
      </DialogActions>
    </Dialog>
  )
}
