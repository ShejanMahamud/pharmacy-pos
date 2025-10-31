import { Add, Close, Delete, Info } from '@mui/icons-material'
import {
  Alert,
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
import { BankAccount, Product, Supplier } from '../../types/purchase'

interface PurchaseFormData {
  supplierId: string
  invoiceNumber: string
  accountId: string
  paymentStatus: string
  paidAmount: number
  notes: string
}

interface PurchaseItem {
  productId: string
  quantity: number
  unitPrice: number
  batchNumber: string
  expiryDate: string
}

interface AddPurchaseModalProps {
  isOpen: boolean
  suppliers: Supplier[]
  products: Product[]
  accounts: BankAccount[]
  currencySymbol: string
  onClose: () => void
  onSuccess: () => void
}

export default function AddPurchaseModal({
  isOpen,
  suppliers,
  products,
  accounts,
  currencySymbol,
  onClose,
  onSuccess
}: AddPurchaseModalProps): React.JSX.Element | null {
  const [formData, setFormData] = useState<PurchaseFormData>({
    supplierId: '',
    invoiceNumber: '',
    accountId: '',
    paymentStatus: 'pending',
    paidAmount: 0,
    notes: ''
  })

  const [items, setItems] = useState<PurchaseItem[]>([
    { productId: '', quantity: 1, unitPrice: 0, batchNumber: '', expiryDate: '' }
  ])

  const handleClose = (): void => {
    setFormData({
      supplierId: '',
      invoiceNumber: '',
      accountId: '',
      paymentStatus: 'pending',
      paidAmount: 0,
      notes: ''
    })
    setItems([{ productId: '', quantity: 1, unitPrice: 0, batchNumber: '', expiryDate: '' }])
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!formData.supplierId) {
      toast.error('Please select a supplier')
      return
    }

    if (items.length === 0 || !items[0].productId) {
      toast.error('Please add at least one product')
      return
    }

    try {
      const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

      const purchase = {
        supplierId: formData.supplierId,
        invoiceNumber: formData.invoiceNumber || `PO-${Date.now()}`,
        accountId: formData.accountId || null,
        totalAmount,
        paidAmount: formData.paidAmount,
        dueAmount: totalAmount - formData.paidAmount,
        paymentStatus: formData.paymentStatus,
        status: 'received',
        notes: formData.notes
      }

      await window.api.purchases.create(purchase, items)
      toast.success('Purchase order created successfully')
      handleClose()
      onSuccess()
    } catch {
      toast.error('Failed to create purchase order')
    }
  }

  const addItem = (): void => {
    setItems([
      ...items,
      { productId: '', quantity: 1, unitPrice: 0, batchNumber: '', expiryDate: '' }
    ])
  }

  const removeItem = (index: number): void => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: string, value: string | number): void => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    // Auto-fill unit price when product is selected
    if (field === 'productId') {
      const product = products.find((p) => p.id === value)
      if (product) {
        // If product has package unit, calculate package price
        const hasPackageUnit =
          product.packageUnit && product.unitsPerPackage && product.unitsPerPackage > 1
        if (hasPackageUnit) {
          newItems[index].unitPrice = product.costPrice * (product.unitsPerPackage || 1)
        } else {
          newItems[index].unitPrice = product.costPrice
        }
      }
    }

    setItems(newItems)
  }

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            New Purchase Order
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {/* Info Banner */}
          <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Purchase in Package Units
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, fontSize: '0.875rem' }}>
              When purchasing from suppliers, enter quantities in <strong>package units</strong>{' '}
              (Box, Bottle, etc.) if configured. The system will automatically convert to base units
              (tablets, strips, ml) for inventory tracking and customer sales.
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              💡 <strong>Prices auto-fill</strong> from product settings but can be edited if
              supplier offers different rates (bulk discounts, price changes, etc.). Modified prices
              will be highlighted in orange.
            </Typography>
          </Alert>

          {/* Purchase Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Purchase Information
            </Typography>
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}
            >
              <FormControl fullWidth size="small" required>
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={formData.supplierId}
                  label="Supplier"
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                >
                  <MenuItem value="">Select Supplier</MenuItem>
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name} {supplier.company ? `- ${supplier.company}` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                size="small"
                label="Invoice Number"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder="Auto-generated if empty"
              />

              <FormControl fullWidth size="small">
                <InputLabel>Account (Optional)</InputLabel>
                <Select
                  value={formData.accountId}
                  label="Account (Optional)"
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                >
                  <MenuItem value="">Select Account (No Account)</MenuItem>
                  {accounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.name} - Balance: {currencySymbol}
                      {account.currentBalance.toFixed(2)}
                    </MenuItem>
                  ))}
                </Select>
                {formData.accountId && (
                  <FormHelperText>
                    Money will be deducted from this account when paid amount &gt; 0
                  </FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={formData.paymentStatus}
                  label="Payment Status"
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="partial">Partial</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                size="small"
                type="number"
                label="Paid Amount"
                value={formData.paidAmount}
                onChange={(e) =>
                  setFormData({ ...formData, paidAmount: parseFloat(e.target.value) || 0 })
                }
                inputProps={{ step: '0.01' }}
              />
            </Box>
          </Box>

          {/* Items */}
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Items
              </Typography>
              <Button variant="contained" size="small" startIcon={<Add />} onClick={addItem}>
                Add Item
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {items.map((item, index) => {
                const selectedProduct = products.find((p) => p.id === item.productId)
                const hasPackageUnit =
                  selectedProduct?.packageUnit &&
                  selectedProduct?.unitsPerPackage &&
                  selectedProduct.unitsPerPackage > 1

                const expectedPrice = selectedProduct
                  ? hasPackageUnit
                    ? selectedProduct.costPrice * (selectedProduct.unitsPerPackage || 1)
                    : selectedProduct.costPrice
                  : 0

                const isPriceModified =
                  item.productId &&
                  item.unitPrice > 0 &&
                  Math.abs(item.unitPrice - expectedPrice) > 0.01

                return (
                  <Box key={index} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Box
                        sx={{
                          flex: 1,
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' },
                          gap: 2
                        }}
                      >
                        <FormControl
                          size="small"
                          required
                          sx={{ gridColumn: { xs: '1', md: 'span 2' } }}
                        >
                          <InputLabel>Product</InputLabel>
                          <Select
                            value={item.productId}
                            onChange={(e) => updateItem(index, 'productId', e.target.value)}
                            label="Product"
                          >
                            <MenuItem value="">Select Product</MenuItem>
                            {products.map((product) => (
                              <MenuItem key={product.id} value={product.id}>
                                {product.name} ({product.sku})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          size="small"
                          type="number"
                          required
                          label={`Quantity ${hasPackageUnit ? `(${selectedProduct.packageUnit}s)` : ''}`}
                          placeholder={
                            hasPackageUnit ? `${selectedProduct.packageUnit}s` : 'Quantity'
                          }
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, 'quantity', parseInt(e.target.value) || 1)
                          }
                          inputProps={{ min: 1 }}
                        />
                        <Box sx={{ position: 'relative' }}>
                          <TextField
                            size="small"
                            type="number"
                            required
                            label={`Price ${hasPackageUnit ? `per ${selectedProduct.packageUnit}` : 'per unit'}`}
                            placeholder="Price"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)
                            }
                            inputProps={{ step: '0.01' }}
                            sx={{
                              '& .MuiOutlinedInput-root': isPriceModified
                                ? {
                                    bgcolor: 'warning.50',
                                    '& fieldset': { borderColor: 'warning.main' }
                                  }
                                : {}
                            }}
                          />
                          {isPriceModified && (
                            <IconButton
                              size="small"
                              onClick={() => updateItem(index, 'unitPrice', expectedPrice)}
                              sx={{
                                position: 'absolute',
                                right: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'warning.main',
                                '&:hover': { color: 'warning.dark' }
                              }}
                              title="Reset to standard price"
                            >
                              <svg
                                style={{ width: 16, height: 16 }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                              </svg>
                            </IconButton>
                          )}
                          {isPriceModified && (
                            <Typography variant="caption" color="warning.main" sx={{ mt: 0.5 }}>
                              Standard: {currencySymbol}
                              {expectedPrice.toFixed(2)}
                            </Typography>
                          )}
                        </Box>
                        <TextField
                          size="small"
                          label="Batch Number"
                          placeholder="Batch #"
                          value={item.batchNumber}
                          onChange={(e) => updateItem(index, 'batchNumber', e.target.value)}
                        />
                      </Box>
                      {items.length > 1 && (
                        <IconButton
                          color="error"
                          onClick={() => removeItem(index)}
                          sx={{ mt: 5 }}
                          title="Remove item"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>

                    {/* Show conversion info */}
                    {hasPackageUnit && item.quantity > 0 && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          fontSize: '0.75rem',
                          color: 'info.main',
                          bgcolor: 'info.50',
                          px: 2,
                          py: 1,
                          borderRadius: 1,
                          border: 1,
                          borderColor: 'info.main'
                        }}
                      >
                        <Info fontSize="small" />
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                          {item.quantity} {selectedProduct.packageUnit}
                          {item.quantity > 1 ? 's' : ''} ={' '}
                          {item.quantity * (selectedProduct.unitsPerPackage || 1)}{' '}
                          {selectedProduct.unit}
                          {item.quantity * (selectedProduct.unitsPerPackage || 1) > 1 ? 's' : ''}
                        </Typography>
                        {item.unitPrice > 0 && (
                          <Typography variant="caption" sx={{ ml: 1 }}>
                            | Cost per {selectedProduct.unit}: {currencySymbol}
                            {(item.unitPrice / (selectedProduct.unitsPerPackage || 1)).toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                )
              })}
            </Box>

            {/* Summary Section */}
            <Box
              sx={{
                mt: 3,
                background: 'linear-gradient(135deg, #EFF6FF 0%, #E0E7FF 100%)',
                borderRadius: 2,
                p: 3,
                border: 1,
                borderColor: 'primary.light'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <svg
                    style={{ width: 20, height: 20, color: '#2563eb' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Purchase Summary
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: 'primary.lighter',
                    color: 'primary.main',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}
                >
                  {items.filter((item) => item.productId).length}{' '}
                  {items.filter((item) => item.productId).length === 1 ? 'Item' : 'Items'}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Subtotal:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {currencySymbol}
                    {totalAmount.toFixed(2)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pt: 1.5,
                    borderTop: 2,
                    borderColor: 'primary.light'
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    Total Amount:
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {currencySymbol}
                    {totalAmount.toFixed(2)}
                  </Typography>
                </Box>

                {formData.paidAmount > 0 && (
                  <Box
                    sx={{
                      pt: 2,
                      mt: 2,
                      borderTop: 1,
                      borderColor: 'primary.light',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
                        Paid Amount:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {currencySymbol}
                        {formData.paidAmount.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 500 }}>
                        Due Amount:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                        {currencySymbol}
                        {(totalAmount - formData.paidAmount).toFixed(2)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pt: 1 }}>
                      <Box
                        sx={{
                          flex: 1,
                          height: 8,
                          borderRadius: 1,
                          overflow: 'hidden',
                          bgcolor: 'grey.300'
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                            transition: 'width 0.3s ease',
                            width: `${Math.min(100, (formData.paidAmount / totalAmount) * 100)}%`
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 500, color: 'text.secondary' }}
                      >
                        {totalAmount > 0
                          ? Math.min(100, Math.round((formData.paidAmount / totalAmount) * 100))
                          : 0}
                        % Paid
                      </Typography>
                    </Box>
                  </Box>
                )}

                {items.some((item) => item.productId && item.quantity > 0) && (
                  <Box sx={{ pt: 2, mt: 2, borderTop: 1, borderColor: 'primary.light' }}>
                    <Typography variant="caption" color="text.secondary">
                      <strong>Total Quantity:</strong>{' '}
                      {items.reduce((sum, item) => sum + (item.quantity || 0), 0)} units
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Notes */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any additional notes..."
          />
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Create Purchase Order
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
