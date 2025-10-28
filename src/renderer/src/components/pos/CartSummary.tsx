interface CartSummaryProps {
  subtotal: number
  discount: number
  tax: number
  total: number
  itemCount: number
  currencySymbol: string
  onCheckout: () => void
  onClear: () => void
}

export default function CartSummary({
  subtotal,
  discount,
  tax,
  total,
  itemCount,
  currencySymbol,
  onCheckout,
  onClear
}: CartSummaryProps): React.JSX.Element {
  return (
    <div className="p-6 border-t border-gray-200 space-y-4">
      {/* Summary */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal:</span>
          <span className="font-medium">
            {currencySymbol}
            {subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Discount:</span>
          <span className="font-medium text-green-600">
            -{currencySymbol}
            {discount.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Tax:</span>
          <span className="font-medium">
            {currencySymbol}
            {tax.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-gray-200">
          <span>Total:</span>
          <span className="text-blue-600">
            {currencySymbol}
            {total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={onCheckout}
          disabled={itemCount === 0}
          className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          Checkout
        </button>
        <button
          onClick={onClear}
          disabled={itemCount === 0}
          className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Clear Cart
        </button>
      </div>
    </div>
  )
}
