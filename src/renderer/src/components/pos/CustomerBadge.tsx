import { Customer } from '../../types/pos'

interface CustomerBadgeProps {
  customer: Customer
  onRemove: () => void
}

export default function CustomerBadge({
  customer,
  onRemove
}: CustomerBadgeProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <div>
          <p className="font-medium text-blue-900">{customer.name}</p>
          <p className="text-sm text-blue-700">
            {customer.phone} • {customer.loyaltyPoints} pts
          </p>
        </div>
      </div>
      <button onClick={onRemove} className="text-blue-600 hover:text-blue-800 transition-colors">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )
}
