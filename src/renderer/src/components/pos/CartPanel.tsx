import { CartItem, Customer } from '../../types/pos'

interface CartPanelProps {
  items: CartItem[]
  customer: Customer | null
  currencySymbol: string
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
}

export default function CartPanel({
  items,
  customer,
  currencySymbol,
  onUpdateQuantity,
  onRemoveItem
}: CartPanelProps): React.JSX.Element {
  return (
    <div className="w-96 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Cart Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-800">Current Order</h2>
          {items.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">
          {customer ? `Customer: ${customer.name}` : 'Walk-in customer'}
        </p>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-6">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Cart is empty</h3>
            <p className="mt-1 text-sm text-gray-500">Add products to start an order</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {currencySymbol}
                    {item.price.toFixed(2)} each
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="h-7 w-7 bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                      <svg
                        className="h-4 w-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>

                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const newQty = parseInt(e.target.value) || 0
                        if (newQty > 0) onUpdateQuantity(item.id, newQty)
                      }}
                      className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm"
                      min="1"
                    />

                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="h-7 w-7 bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                      <svg
                        className="h-4 w-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="ml-auto h-7 w-7 bg-red-50 border border-red-200 rounded hover:bg-red-100 flex items-center justify-center transition-colors"
                    >
                      <svg
                        className="h-4 w-4 text-red-600"
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
                  </div>

                  <p className="text-sm font-semibold text-blue-600 mt-2">
                    {currencySymbol}
                    {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
