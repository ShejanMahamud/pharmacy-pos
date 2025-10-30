import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material'
import { InventoryItem, Product, StockAdjustmentFormData } from '../../types/inventory'

interface StockAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  editingItem: InventoryItem | null
  products: Product[]
  formData: StockAdjustmentFormData
  onFormDataChange: (data: StockAdjustmentFormData) => void
  onSubmit: (e: React.FormEvent) => void
}

export default function StockAdjustmentModal({
  isOpen,
  onClose,
  editingItem,
  products,
  formData,
  onFormDataChange,
  onSubmit
}: StockAdjustmentModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(e)
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editingItem ? 'Adjust Stock' : 'Add Stock'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Product</InputLabel>
              <Select
                value={formData.productId}
                onChange={(e) => onFormDataChange({ ...formData, productId: e.target.value })}
                disabled={!!editingItem}
                label="Product"
              >
                <MenuItem value="">
                  <em>Select Product</em>
                </MenuItem>
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              required
              fullWidth
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                onFormDataChange({ ...formData, quantity: parseInt(e.target.value) || 0 })
              }
              inputProps={{ min: 0 }}
            />

            <TextField
              fullWidth
              label="Batch Number"
              value={formData.batchNumber}
              onChange={(e) => onFormDataChange({ ...formData, batchNumber: e.target.value })}
            />

            <TextField
              fullWidth
              label="Expiry Date"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => onFormDataChange({ ...formData, expiryDate: e.target.value })}
              InputLabelProps={{
                shrink: true
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {editingItem ? 'Update Stock' : 'Add Stock'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
