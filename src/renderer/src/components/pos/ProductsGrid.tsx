import { InventoryItem, Product } from '../../types/pos'

interface ProductsGridProps {
  products: Product[]
  inventory: InventoryItem[]
  loading: boolean
  currencySymbol: string
  onAddToCart: (product: Product) => void
}

export default function ProductsGrid({
  products,
  inventory,
  loading,
  currencySymbol,
  onAddToCart
}: ProductsGridProps): React.JSX.Element {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
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
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your search query</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map((product) => {
        const inventoryItem = inventory.find((inv) => inv.productId === product.id)
        const stock = inventoryItem?.quantity || 0
        const isLowStock = stock <= (product.quantity || 10)
        const isOutOfStock = stock === 0

        return (
          <button
            key={product.id}
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className={`group relative p-4 rounded-lg border-2 transition-all text-left ${
              isOutOfStock
                ? 'border-red-200 bg-red-50 opacity-60 cursor-not-allowed'
                : 'border-gray-200 bg-white hover:border-blue-500 hover:shadow-lg'
            }`}
          >
            {/* Stock Badge */}
            <div className="absolute top-2 right-2">
              {isOutOfStock ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                  Low: {stock}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  {stock}
                </span>
              )}
            </div>

            {/* Product Icon */}
            <div className="h-16 w-16 mx-auto mb-3 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="h-8 w-8 text-blue-600"
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

            {/* Product Info */}
            <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{product.name}</h3>
            {product.genericName && (
              <p className="text-xs text-gray-500 mb-2 truncate">{product.genericName}</p>
            )}
            <div className="flex items-center justify-between mt-auto">
              <span className="text-lg font-bold text-blue-600">
                {currencySymbol}
                {product.sellingPrice.toFixed(2)}
              </span>
              {product.barcode && (
                <span className="text-xs text-gray-400">{product.barcode.slice(-4)}</span>
              )}
            </div>

            {/* Add Icon */}
            {!isOutOfStock && (
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-white"
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
                </div>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
