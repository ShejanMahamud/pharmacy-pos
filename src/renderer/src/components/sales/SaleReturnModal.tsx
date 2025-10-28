import { BankAccount, ReturnFormData, ReturnItem, Sale } from '../../types/sale'

interface SaleReturnModalProps {
  isOpen: boolean
  sales: Sale[]
  accounts: BankAccount[]
  returnFormData: ReturnFormData
  returnItems: ReturnItem[]
  currencySymbol: string
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onReturnFormDataChange: (data: ReturnFormData) => void
  onReturnItemsChange: (items: ReturnItem[]) => void
  onSaleSelect: (saleId: string) => void
}

export default function SaleReturnModal({
  isOpen,
  sales,
  accounts,
  returnFormData,
  returnItems,
  currencySymbol,
  onClose,
  onSubmit,
  onReturnFormDataChange,
  onReturnItemsChange,
  onSaleSelect
}: SaleReturnModalProps): React.JSX.Element | null {
  if (!isOpen) return null

  const totalReturnAmount = returnItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )

  return (
    <div className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create Sales Return</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Sale *
                  </label>
                  <select
                    required
                    value={returnFormData.saleId}
                    onChange={(e) => onSaleSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a sale</option>
                    {sales.map((sale) => (
                      <option key={sale.id} value={sale.id}>
                        {sale.invoiceNumber} - {sale.customerName || 'Walk-in'} ({currencySymbol}
                        {sale.totalAmount.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Account <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <select
                    value={returnFormData.accountId}
                    onChange={(e) =>
                      onReturnFormDataChange({ ...returnFormData, accountId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">No Account</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} - {currencySymbol}
                        {account.currentBalance.toFixed(2)}
                      </option>
                    ))}
                  </select>
                  {returnFormData.accountId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Money will be deducted from this account
                    </p>
                  )}
                </div>
              </div>

              {returnItems.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Return Items</h3>
                  <div className="space-y-3">
                    {returnItems.map((item, index) => (
                      <div key={item.saleItemId} className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                          <p className="text-xs text-gray-500">
                            Max: {item.maxQuantity} | Price: {currencySymbol}
                            {item.unitPrice.toFixed(2)}
                          </p>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max={item.maxQuantity}
                          value={item.quantity}
                          onChange={(e) => {
                            const qty = Math.min(parseInt(e.target.value) || 0, item.maxQuantity)
                            const updated = [...returnItems]
                            updated[index].quantity = qty
                            onReturnItemsChange(updated)
                          }}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Qty"
                        />
                        <span className="text-sm font-medium text-gray-900 w-24 text-right">
                          {currencySymbol}
                          {(item.quantity * item.unitPrice).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Total Return Amount:</span>
                      <span>
                        {currencySymbol}
                        {totalReturnAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={returnFormData.refundAmount}
                    onChange={(e) =>
                      onReturnFormDataChange({
                        ...returnFormData,
                        refundAmount: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Reason *
                  </label>
                  <input
                    type="text"
                    required
                    value={returnFormData.reason}
                    onChange={(e) =>
                      onReturnFormDataChange({ ...returnFormData, reason: e.target.value })
                    }
                    placeholder="Damaged, Wrong item, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={returnFormData.notes}
                  onChange={(e) =>
                    onReturnFormDataChange({ ...returnFormData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={returnItems.filter((i) => i.quantity > 0).length === 0}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Return
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
