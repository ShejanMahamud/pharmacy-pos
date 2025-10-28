import { PurchaseReturn, SalesReturn } from '../../types/return'

interface ReturnDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  returnItem: SalesReturn | PurchaseReturn | null
}

export default function ReturnDetailsModal({
  isOpen,
  onClose,
  returnItem
}: ReturnDetailsModalProps): React.JSX.Element | null {
  if (!isOpen || !returnItem) return null

  const isSalesReturn = 'customerName' in returnItem

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getRefundStatusBadge = (status: string): React.JSX.Element => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-blue-100 text-blue-800',
      refunded: 'bg-green-100 text-green-800'
    }

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {isSalesReturn ? 'Sales Return Details' : 'Purchase Return Details'}
          </h2>
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

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Return Number</p>
            <p className="font-medium">{returnItem.returnNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{isSalesReturn ? 'Customer' : 'Supplier'}</p>
            <p className="font-medium">
              {isSalesReturn
                ? (returnItem as SalesReturn).customerName || 'Walk-in'
                : (returnItem as PurchaseReturn).supplierName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="font-medium">{formatCurrency(returnItem.totalAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Refund Status</p>
            <div className="mt-1">{getRefundStatusBadge(returnItem.refundStatus)}</div>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-500">Reason</p>
            <p className="font-medium">{returnItem.reason || '-'}</p>
          </div>
          {returnItem.notes && (
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Notes</p>
              <p className="font-medium">{returnItem.notes}</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold mb-3">Return Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Unit Price
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Subtotal
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {returnItem.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {formatCurrency(item.subtotal)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
