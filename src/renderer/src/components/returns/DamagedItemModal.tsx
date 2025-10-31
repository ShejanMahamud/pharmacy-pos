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
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material'
import { Product } from '../../types/return'

interface DamagedItemModalProps {
  isOpen: boolean
  onClose: () => void
  selectedProduct: Product | null
  productSearchTerm: string
  products: Product[]
  showProductDropdown: boolean
  quantity: number
  reason: 'expired' | 'damaged' | 'defective'
  batchNumber: string
  expiryDate: string
  notes: string
  onProductSearchChange: (term: string) => void
  onProductSelect: (product: Product) => void
  onQuantityChange: (quantity: number) => void
  onReasonChange: (reason: 'expired' | 'damaged' | 'defective') => void
  onBatchNumberChange: (batchNumber: string) => void
  onExpiryDateChange: (expiryDate: string) => void
  onNotesChange: (notes: string) => void
  onSubmit: () => void
}

export default function DamagedItemModal({
  isOpen,
  onClose,
  selectedProduct,
  productSearchTerm,
  products,
  showProductDropdown,
  quantity,
  reason,
  batchNumber,
  expiryDate,
  notes,
  onProductSearchChange,
  onProductSelect,
  onQuantityChange,
  onReasonChange,
  onBatchNumberChange,
  onExpiryDateChange,
  onNotesChange,
  onSubmit
}: DamagedItemModalProps): React.JSX.Element {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Report Damaged/Expired Item
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Product Search */}
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              label="Product"
              value={selectedProduct ? selectedProduct.name : productSearchTerm}
              onChange={(e) => onProductSearchChange(e.target.value)}
              placeholder="Search for product..."
            />
            {showProductDropdown && products.length > 0 && (
              <Paper
                sx={{
                  position: 'absolute',
                  zIndex: 10,
                  width: '100%',
                  mt: 1,
                  maxHeight: 240,
                  overflow: 'auto'
                }}
              >
                <List>
                  {products.map((product) => (
                    <ListItemButton key={product.id} onClick={() => onProductSelect(product)}>
                      <ListItemText
                        primary={product.name}
                        secondary={`SKU: ${product.sku}`}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
          {selectedProduct && (
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {selectedProduct.name}
              </Typography>
              <Typography variant="caption">SKU: {selectedProduct.sku}</Typography>
            </Alert>
          )}

          {/* Quantity */}
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
            inputProps={{ min: 1 }}
          />

          {/* Reason */}
          <FormControl fullWidth>
            <InputLabel>Reason</InputLabel>
            <Select
              value={reason}
              label="Reason"
              onChange={(e) =>
                onReasonChange(e.target.value as 'expired' | 'damaged' | 'defective')
              }
            >
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="damaged">Damaged</MenuItem>
              <MenuItem value="defective">Defective</MenuItem>
            </Select>
          </FormControl>

          {/* Batch Number */}
          <TextField
            fullWidth
            label="Batch Number (Optional)"
            value={batchNumber}
            onChange={(e) => onBatchNumberChange(e.target.value)}
            placeholder="Enter batch number"
          />

          {/* Expiry Date */}
          <TextField
            fullWidth
            label="Expiry Date (Optional)"
            type="date"
            value={expiryDate}
            onChange={(e) => onExpiryDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          {/* Notes */}
          <TextField
            fullWidth
            label="Notes (Optional)"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Add any additional notes..."
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="contained" color="error">
          Report Item
        </Button>
      </DialogActions>
    </Dialog>
  )
}
