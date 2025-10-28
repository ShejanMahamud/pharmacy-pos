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
}: DamagedItemModalProps): React.JSX.Element | null {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Report Damaged/Expired Item</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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

        <div className="space-y-4">
          {/* Product Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <div className="relative">
              <input
                type="text"
                value={selectedProduct ? selectedProduct.name : productSearchTerm}
                onChange={(e) => onProductSearchChange(e.target.value)}
                placeholder="Search for product..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {showProductDropdown && products.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => onProductSelect(product)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedProduct && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800 font-medium">{selectedProduct.name}</p>
                <p className="text-xs text-blue-600">SKU: {selectedProduct.sku}</p>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <select
              value={reason}
              onChange={(e) =>
                onReasonChange(e.target.value as 'expired' | 'damaged' | 'defective')
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="expired">Expired</option>
              <option value="damaged">Damaged</option>
              <option value="defective">Defective</option>
            </select>
          </div>

          {/* Batch Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Number (Optional)
            </label>
            <input
              type="text"
              value={batchNumber}
              onChange={(e) => onBatchNumberChange(e.target.value)}
              placeholder="Enter batch number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => onExpiryDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Report Item
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
