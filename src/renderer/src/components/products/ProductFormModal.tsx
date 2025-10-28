import { useEffect, useState } from 'react'
import { Category, Product, ProductFormData, Supplier, Unit } from '../../types/product'

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
  const [formData, setFormData] = useState<ProductFormData>({
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
  })

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
      // Reset form for new product
      setFormData({
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
      })
    }
  }, [editingProduct])

  const generateSKU = (): void => {
    const sku = 'PRD' + Date.now().toString().slice(-8)
    setFormData({ ...formData, sku })
  }

  const profitMargin =
    formData.sellingPrice > 0 && formData.costPrice > 0
      ? ((formData.sellingPrice - formData.costPrice) / formData.costPrice) * 100
      : 0

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
            <h2 className="text-xl font-bold text-gray-900">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Basic Information
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name</label>
                <input
                  type="text"
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter generic name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter SKU"
                  />
                  <button
                    type="button"
                    onClick={generateSKU}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter barcode"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter manufacturer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shelf Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.shelf}
                  onChange={(e) => setFormData({ ...formData, shelf: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., A1, B2, C3"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Which shelf the medicine is stored (e.g., A1, B2, Rack-5)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image URL
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter image URL (optional)"
                />
                <p className="mt-1 text-xs text-gray-500">Optional: URL or path to product image</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Unit (Smallest Unit) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Base Unit</option>
                  {units
                    .filter((u) => u.type === 'base')
                    .map((unit) => (
                      <option key={unit.id} value={unit.name.toLowerCase()}>
                        {unit.name} ({unit.abbreviation})
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  The smallest unit customers can buy (e.g., 1 tablet, 1 strip)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package Unit (Bulk Unit)
                </label>
                <select
                  value={formData.packageUnit}
                  onChange={(e) => setFormData({ ...formData, packageUnit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Package Unit</option>
                  {units
                    .filter((u) => u.type === 'package')
                    .map((unit) => (
                      <option key={unit.id} value={unit.name}>
                        {unit.name} ({unit.abbreviation})
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  How you purchase from suppliers (e.g., Box, Bottle)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Units Per Package
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.unitsPerPackage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unitsPerPackage: parseInt(e.target.value) || 1
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  How many base units in one package? (e.g., 1 Box = 10 Strips)
                </p>
              </div>

              {formData.packageUnit && formData.unitsPerPackage > 1 && (
                <div className="md:col-span-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-blue-900">
                        Conversion: 1 {formData.packageUnit} = {formData.unitsPerPackage}{' '}
                        {formData.unit}
                        {formData.unitsPerPackage > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product description"
                />
              </div>

              {/* Pricing */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Pricing & Tax
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Price (per base unit) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">{currencySymbol}</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Cost per {formData.unit} (not per {formData.packageUnit || 'package'})
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price (per base unit) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">{currencySymbol}</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Selling price per {formData.unit} to customers
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={(e) =>
                    setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discountPercent}
                  onChange={(e) =>
                    setFormData({ ...formData, discountPercent: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              {profitMargin > 0 && (
                <div className="md:col-span-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">Profit Margin:</span>
                      <span className="text-lg font-bold text-blue-700">
                        {profitMargin.toFixed(2)}% ($
                        {(formData.sellingPrice - formData.costPrice).toFixed(2)})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Inventory */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Inventory Settings
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the current available stock quantity
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reorder Level
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.reorderLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Alert when stock falls below this level
                </p>
              </div>

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.prescriptionRequired}
                    onChange={(e) =>
                      setFormData({ ...formData, prescriptionRequired: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Prescription Required
                  </span>
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
