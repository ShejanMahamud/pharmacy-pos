import { Close } from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography
} from '@mui/material'
import { DamagedItem } from '../../types/return'
import PrintButtons from '../shared/PrintButtons'

interface DamagedItemDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  item: DamagedItem | null
}

export default function DamagedItemDetailsModal({
  isOpen,
  onClose,
  item
}: DamagedItemDetailsModalProps): React.JSX.Element {
  const handlePdfPrint = (): void => {
    // TODO: Implement PDF print functionality
    console.log('PDF Print damaged item:', item)
  }

  const handleThermalPrint = (): void => {
    // TODO: Implement thermal print functionality
    console.log('Thermal Print damaged item:', item)
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getReasonColor = (reason: string): 'warning' | 'error' | 'info' => {
    switch (reason) {
      case 'expired':
        return 'warning'
      case 'damaged':
        return 'error'
      default:
        return 'info'
    }
  }

  if (!item) {
    return (
      <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1">Loading damaged item details...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Damaged/Expired Item Details
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Product Name
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {item.productName}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Quantity
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {item.quantity}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Reason
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip
                label={item.reason.charAt(0).toUpperCase() + item.reason.slice(1)}
                size="small"
                color={getReasonColor(item.reason)}
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Batch Number
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {item.batchNumber || '-'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Expiry Date
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Reported By
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {item.reportedBy}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Date Reported
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {formatDate(item.createdAt)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <PrintButtons onPdfPrint={handlePdfPrint} onThermalPrint={handleThermalPrint} />
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
