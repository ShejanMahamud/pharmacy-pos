import { TopProduct } from '../../types/report'

interface TopProductsListProps {
  products: TopProduct[]
  currencySymbol: string
  title?: string
}

export default function TopProductsList({
  products,
  currencySymbol,
  title = 'Top Selling Products'
}: TopProductsListProps): React.JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {products.length > 0 ? (
            products.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 font-semibold rounded-lg mr-3">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.quantity} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {currencySymbol}
                    {product.revenue.toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">No products sold in this period</div>
          )}
        </div>
      </div>
    </div>
  )
}
