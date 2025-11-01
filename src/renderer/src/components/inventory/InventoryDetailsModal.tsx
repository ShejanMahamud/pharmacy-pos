import { Close } from '@mui/icons-material'
import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography
} from '@mui/material'
import medicinePlaceholder from '../../assets/medicine.png'
import { Category, InventoryWithProduct } from '../../types/inventory'
import PrintButtons from '../shared/PrintButtons'

interface InventoryDetailsModalProps {
  isOpen: boolean
  item: InventoryWithProduct | null
  category: Category | null
  currencySymbol: string
  onClose: () => void
}

export default function InventoryDetailsModal({
  isOpen,
  item,
  category,
  currencySymbol,
  onClose
}: InventoryDetailsModalProps): React.JSX.Element | null {
  if (!item || !item.product) return null

  const product = item.product
  const isLowStock = item.quantity > 0 && item.quantity <= product.reorderLevel
  const isOutOfStock = item.quantity === 0
  const stockValue = item.quantity * product.costPrice
  const potentialRevenue = item.quantity * product.sellingPrice
  const potentialProfit = potentialRevenue - stockValue

  const handlePdfPrint = (): void => {
    // TODO: Implement PDF print functionality
    console.log('PDF Print:', item)
  }

  const handleThermalPrint = (): void => {
    // TODO: Implement thermal print functionality
    console.log('Thermal Print:', item)
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Inventory Details
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Product Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box
              component="img"
              src={product.imageUrl || medicinePlaceholder}
              alt={product.name}
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                objectFit: 'contain',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'grey.50',
                p: 0.5
              }}
            />
            <Box sx={{ display: 'none' }}>
              <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {product.name}
              </Typography>
              {product.genericName && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {product.genericName}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Status Chip */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isOutOfStock ? (
              <Chip label="Out of Stock" size="small" color="error" />
            ) : isLowStock ? (
              <Chip label="Low Stock" size="small" color="warning" />
            ) : (
              <Chip label="In Stock" size="small" color="success" />
            )}
            {category && (
              <Chip label={category.name} size="small" color="primary" variant="outlined" />
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Product Information */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          Product Information
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              SKU
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {product.sku}
            </Typography>
          </Box>
          {product.barcode && (
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Barcode
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {product.barcode}
              </Typography>
            </Box>
          )}
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Unit
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {product.unit}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Reorder Level
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {product.reorderLevel} {product.unit}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Stock Information */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          Stock Information
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Current Stock
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: isOutOfStock ? 'error.main' : isLowStock ? 'warning.main' : 'success.main'
              }}
            >
              {item.quantity} {product.unit}
            </Typography>
          </Box>
          {item.batchNumber && (
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Batch Number
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {item.batchNumber}
              </Typography>
            </Box>
          )}
          {item.expiryDate && (
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Expiry Date
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {new Date(item.expiryDate).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Pricing & Value */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          Pricing & Value
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Cost Price (per unit):
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {currencySymbol}
              {product.costPrice.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Selling Price (per unit):
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {currencySymbol}
              {product.sellingPrice.toFixed(2)}
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Total Stock Value:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {currencySymbol}
              {stockValue.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Potential Revenue:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
              {currencySymbol}
              {potentialRevenue.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Potential Profit:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.dark' }}>
              {currencySymbol}
              {potentialProfit.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        {(item.createdAt || item.updatedAt) && (
          <>
            <Divider sx={{ my: 2 }} />

            {/* Timestamps */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {item.createdAt && (
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Created At
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              )}
              {item.updatedAt && (
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Last Updated
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {new Date(item.updatedAt).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <PrintButtons
            onPdfPrint={handlePdfPrint}
            onThermalPrint={handleThermalPrint}
            disabled={false}
          />
        </Box>
      </DialogActions>
    </Dialog>
  )
}
