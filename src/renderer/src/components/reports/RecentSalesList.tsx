import { RecentSale } from '../../types/report'

interface RecentSalesListProps {
  sales: RecentSale[]
  currencySymbol: string
  title?: string
  showCustomerIcon?: boolean
}

export default function RecentSalesList({
  sales,
  currencySymbol,
  title = 'Recent Sales',
  showCustomerIcon = false
}: RecentSalesListProps): React.JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {sales.length > 0 ? (
            sales.map((sale) => (
              <div
                key={sale.id}
                className={
                  showCustomerIcon
                    ? 'flex items-center justify-between p-4 bg-gray-50 rounded-lg'
                    : 'flex items-center justify-between'
                }
              >
                {showCustomerIcon ? (
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-purple-600"
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
                      <p className="text-sm font-medium text-gray-900">{sale.customerName}</p>
                      <p className="text-xs text-gray-500">{sale.invoiceNumber}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(sale.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{sale.invoiceNumber}</p>
                    <p className="text-xs text-gray-500">{sale.customerName}</p>
                    <p className="text-xs text-gray-400">{new Date(sale.date).toLocaleString()}</p>
                  </div>
                )}
                <div className="text-right">
                  <p
                    className={
                      showCustomerIcon
                        ? 'text-lg font-semibold text-gray-900'
                        : 'text-sm font-semibold text-gray-900'
                    }
                  >
                    {currencySymbol}
                    {sale.total.toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {showCustomerIcon ? (
                <>
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <p>No customer transactions yet</p>
                </>
              ) : (
                <p>No recent sales</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
