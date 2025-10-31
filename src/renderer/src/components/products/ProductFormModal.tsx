import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Category, Product, ProductFormData, Supplier, Unit } from '../../types/product'
import { generateUniqueBarcode } from '../../utils/barcodeGenerator'
import BasicInfoSection from './form/BasicInfoSection'
import InventorySection from './form/InventorySection'
import PricingSection from './form/PricingSection'
import UnitSection from './form/UnitSection'

interface ProductFormModalProps {
  isOpen: boolean
  editingProduct: Product | null
  suppliers: Supplier[]
  categories: Category[]
  units: Unit[]
  currencySymbol: string
  onClose: () => void
  onSubmit: (formData: ProductFormData) => void
}

const initialFormData: ProductFormData = {
  name: '',
  genericName: '',
  barcode: '',
  sku: '',
  categoryId: '',
  supplierId: '',
  description: '',
  manufacturer: '',
  unit: 'tablet',
  unitsPerPackage: 1,
  packageUnit: '',
  shelf: 'A1',
  imageUrl: '',
  prescriptionRequired: false,
  reorderLevel: 10,
  sellingPrice: 0,
  costPrice: 0,
  taxRate: 0,
  discountPercent: 0,
  stockQuantity: 0
}

export default function ProductFormModal({
  isOpen,
  editingProduct,
  suppliers,
  categories,
  units,
  currencySymbol,
  onClose,
  onSubmit
}: ProductFormModalProps): React.JSX.Element | null {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        genericName: editingProduct.genericName || '',
        barcode: editingProduct.barcode || '',
        sku: editingProduct.sku,
        categoryId: editingProduct.categoryId || '',
        supplierId: editingProduct.supplierId || '',
        description: editingProduct.description || '',
        manufacturer: editingProduct.manufacturer || '',
        unit: editingProduct.unit,
        unitsPerPackage: editingProduct.unitsPerPackage || 1,
        packageUnit: editingProduct.packageUnit || '',
        shelf: editingProduct.shelf,
        imageUrl: editingProduct.imageUrl || '',
        prescriptionRequired: editingProduct.prescriptionRequired,
        reorderLevel: editingProduct.reorderLevel,
        sellingPrice: editingProduct.sellingPrice,
        costPrice: editingProduct.costPrice,
        taxRate: editingProduct.taxRate,
        discountPercent: editingProduct.discountPercent,
        stockQuantity: 0 // Don't auto-fill stock when editing
      })
    } else {
      // Generate barcode for new products
      const newBarcode = generateUniqueBarcode()
      setFormData({ ...initialFormData, barcode: newBarcode })
    }
  }, [editingProduct, isOpen])

  const handleFormChange = (updates: Partial<ProductFormData>): void => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const generateSKU = (): void => {
    const sku = 'PRD' + Date.now().toString().slice(-8)
    setFormData((prev) => ({ ...prev, sku }))
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3
            }}
          >
            {/* Basic Information Section */}
            <BasicInfoSection
              formData={formData}
              categories={categories}
              suppliers={suppliers}
              onFormChange={handleFormChange}
              onGenerateSKU={generateSKU}
            />

            {/* Unit Configuration Section */}
            <UnitSection formData={formData} units={units} onFormChange={handleFormChange} />

            {/* Pricing Section */}
            <PricingSection
              formData={formData}
              currencySymbol={currencySymbol}
              onFormChange={handleFormChange}
            />

            {/* Inventory Section */}
            <InventorySection formData={formData} onFormChange={handleFormChange} />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {editingProduct ? 'Update Product' : 'Create Product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
