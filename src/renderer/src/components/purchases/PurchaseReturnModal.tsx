import { useState } from 'react'
import toast from 'react-hot-toast'
import { BankAccount, Purchase } from '../../types/purchase'

interface ReturnItem {
  purchaseItemId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  maxQuantity: number
}

interface ReturnFormData {
  purchaseId: string
  accountId: string
  refundAmount: number
  reason: string
  notes: string
}

interface PurchaseReturnModalProps {
  isOpen: boolean
  purchases: Purchase[]
  accounts: BankAccount[]
  currencySymbol: string
  onClose: () => void
  onSuccess: () => void
}

export default function PurchaseReturnModal({
  isOpen,
  purchases,
  accounts,
  currencySymbol,
  onClose,
  onSuccess
}: PurchaseReturnModalProps): React.JSX.Element | null {
  const [returnFormData, setReturnFormData] = useState<ReturnFormData>({
    purchaseId: '',
    accountId: '',
    refundAmount: 0,
    reason: '',
    notes: ''
  })

  const [returnItems, setReturnItems] = useState<ReturnItem[]>([])

  if (!isOpen) return null

  const handleClose = (): void => {
    setReturnFormData({
      purchaseId: '',
      accountId: '',
      refundAmount: 0,
      reason: '',
      notes: ''
    })
    setReturnItems([])
    onClose()
  }

  const handlePurchaseSelect = async (purchaseId: string): Promise<void> => {
    setReturnFormData({ ...returnFormData, purchaseId })

    if (purchaseId) {
      try {
        const purchase = await window.api.purchases.getById(purchaseId)
        if (purchase && purchase.items) {
          setReturnItems(
            purchase.items.map((item: any) => ({
              purchaseItemId: item.id,
              productId: item.productId,
              productName: item.productName,
              quantity: 0,
              unitPrice: item.unitPrice,
              maxQuantity: item.quantity
            }))
          )
        }
      } catch (error) {
        toast.error('Failed to load purchase items')
        console.error(error)
      }
    } else {
      setReturnItems([])
    }
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    try {
      if (!returnFormData.purchaseId || returnItems.length === 0) {
        toast.error('Please fill all required fields')
        return
      }

      const purchase = await window.api.purchases.getById(returnFormData.purchaseId)
      if (!purchase) {
        toast.error('Purchase not found')
        return
      }

      const totalAmount = returnItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

      await window.api.purchaseReturns.create(
        {
          returnNumber: `PR-${Date.now()}`,
          purchaseId: returnFormData.purchaseId,
          supplierId: purchase.supplierId,
          accountId: returnFormData.accountId || null,
          userId: 'current-user',
          subtotal: totalAmount,
          taxAmount: 0,
          discountAmount: 0,
          totalAmount,
          refundAmount: returnFormData.refundAmount,
          refundStatus:
            returnFormData.refundAmount >= totalAmount
              ? 'refunded'
              : returnFormData.refundAmount > 0
                ? 'partial'
                : 'pending',
          reason: returnFormData.reason,
          notes: returnFormData.notes
        },
        returnItems
      )

      toast.success('Purchase return created successfully')
      handleClose()
      onSuccess()
    } catch (error) {
      toast.error('Failed to create purchase return')
      console.error(error)
    }
  }

  const totalReturnAmount = returnItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create Purchase Return</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
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

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Purchase *
                  </label>
                  <select
                    required
                    value={returnFormData.purchaseId}
                    onChange={(e) => handlePurchaseSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a purchase</option>
                    {purchases.map((purchase) => (
                      <option key={purchase.id} value={purchase.id}>
                        {purchase.invoiceNumber} - {purchase.supplierName} ({currencySymbol}
                        {purchase.totalAmount.toFixed(2)})
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
                      setReturnFormData({ ...returnFormData, accountId: e.target.value })
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
                      Money will be added back to this account
                    </p>
                  )}
                </div>
              </div>

              {returnItems.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Return Items</h3>
                  <div className="space-y-3">
                    {returnItems.map((item, index) => (
                      <div key={item.purchaseItemId} className="flex items-center gap-3">
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
                            setReturnItems(updated)
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
                      setReturnFormData({
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
                      setReturnFormData({ ...returnFormData, reason: e.target.value })
                    }
                    placeholder="Damaged, Expired, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={returnFormData.notes}
                  onChange={(e) => setReturnFormData({ ...returnFormData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleClose}
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
