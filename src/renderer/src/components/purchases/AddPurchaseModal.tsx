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

  if (!isOpen) return null

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
    } catch (_error) {
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
          <h2 className="text-xl font-bold text-gray-900">New Purchase Order</h2>
          <button
            onClick={handleClose}
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
        <form onSubmit={handleSubmit} className="p-6">
          {/* Info Banner */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 text-blue-600 mt-0.5 shrink-0"
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
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Purchase in Package Units
                </h4>
                <p className="text-xs text-blue-800 mb-2">
                  When purchasing from suppliers, enter quantities in <strong>package units</strong>{' '}
                  (Box, Bottle, etc.) if configured. The system will automatically convert to base
                  units (tablets, strips, ml) for inventory tracking and customer sales.
                </p>
                <p className="text-xs text-blue-800">
                  💡 <strong>Prices auto-fill</strong> from product settings but can be edited if
                  supplier offers different rates (bulk discounts, price changes, etc.). Modified
                  prices will be highlighted in{' '}
                  <span className="text-orange-600 font-semibold">orange</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Purchase Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name} {supplier.company ? `- ${supplier.company}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="Auto-generated if empty"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <select
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Account (No Account)</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} - Balance: {currencySymbol}
                      {account.currentBalance.toFixed(2)}
                    </option>
                  ))}
                </select>
                {formData.accountId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Money will be deducted from this account when paid amount &gt; 0
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Paid Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.paidAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, paidAmount: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Item
              </button>
            </div>

            <div className="space-y-3">
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
                  <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex gap-3 items-start">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Product
                          </label>
                          <select
                            value={item.productId}
                            onChange={(e) => updateItem(index, 'productId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            required
                          >
                            <option value="">Select Product</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} ({product.sku})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Quantity {hasPackageUnit && `(${selectedProduct.packageUnit}s)`}
                          </label>
                          <input
                            type="number"
                            placeholder={
                              hasPackageUnit ? `${selectedProduct.packageUnit}s` : 'Quantity'
                            }
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(index, 'quantity', parseInt(e.target.value) || 1)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            min="1"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Price{' '}
                            {hasPackageUnit ? `per ${selectedProduct.packageUnit}` : 'per unit'}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Price"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)
                              }
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-sm ${
                                isPriceModified
                                  ? 'border-orange-400 bg-orange-50 focus:ring-orange-500 focus:border-orange-500'
                                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                              }`}
                              required
                            />
                            {isPriceModified && (
                              <button
                                type="button"
                                onClick={() => updateItem(index, 'unitPrice', expectedPrice)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-600 hover:text-orange-800"
                                title="Reset to standard price"
                              >
                                <svg
                                  className="w-4 h-4"
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
                              </button>
                            )}
                          </div>
                          {isPriceModified && (
                            <p className="text-xs text-orange-600 mt-1">
                              Standard: {currencySymbol}
                              {expectedPrice.toFixed(2)}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Batch Number
                          </label>
                          <input
                            type="text"
                            placeholder="Batch #"
                            value={item.batchNumber}
                            onChange={(e) => updateItem(index, 'batchNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="mt-5 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Show conversion info */}
                    {hasPackageUnit && item.quantity > 0 && (
                      <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded border border-blue-200">
                        <svg
                          className="w-4 h-4"
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
                        <span className="font-medium">
                          {item.quantity} {selectedProduct.packageUnit}
                          {item.quantity > 1 ? 's' : ''} ={' '}
                          {item.quantity * (selectedProduct.unitsPerPackage || 1)}{' '}
                          {selectedProduct.unit}
                          {item.quantity * (selectedProduct.unitsPerPackage || 1) > 1 ? 's' : ''}
                        </span>
                        {item.unitPrice > 0 && (
                          <span className="ml-2">
                            | Cost per {selectedProduct.unit}: {currencySymbol}
                            {(item.unitPrice / (selectedProduct.unitsPerPackage || 1)).toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Summary Section */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
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
                  Purchase Summary
                </h4>
                <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                  {items.filter((item) => item.productId).length}{' '}
                  {items.filter((item) => item.productId).length === 1 ? 'Item' : 'Items'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-gray-900">
                    {currencySymbol}
                    {totalAmount.toFixed(2)}
                  </span>
                </div>

                <div className="pt-2 border-t-2 border-blue-300 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {currencySymbol}
                    {totalAmount.toFixed(2)}
                  </span>
                </div>

                {formData.paidAmount > 0 && (
                  <div className="pt-3 mt-3 border-t border-blue-200 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-green-700 font-medium">Paid Amount:</span>
                      <span className="font-semibold text-green-700">
                        {currencySymbol}
                        {formData.paidAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-red-700 font-medium">Due Amount:</span>
                      <span className="font-semibold text-red-700">
                        {currencySymbol}
                        {(totalAmount - formData.paidAmount).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex-1 h-2 rounded-full overflow-hidden bg-gray-200">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
                          style={{
                            width: `${Math.min(100, (formData.paidAmount / totalAmount) * 100)}%`
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {totalAmount > 0
                          ? Math.min(100, Math.round((formData.paidAmount / totalAmount) * 100))
                          : 0}
                        % Paid
                      </span>
                    </div>
                  </div>
                )}

                {items.some((item) => item.productId && item.quantity > 0) && (
                  <div className="pt-3 mt-3 border-t border-blue-200">
                    <div className="text-xs text-gray-600">
                      <strong>Total Quantity:</strong>{' '}
                      {items.reduce((sum, item) => sum + (item.quantity || 0), 0)} units
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any additional notes..."
            />
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 justify-end border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Purchase Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
