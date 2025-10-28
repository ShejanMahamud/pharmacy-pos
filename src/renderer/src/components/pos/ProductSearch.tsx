interface ProductSearchProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  onBarcodeSearch: (barcode: string) => void
  isBarcodeScanning: boolean
  onCustomerSelect: () => void
  searchInputRef?: React.RefObject<HTMLInputElement>
}

export default function ProductSearch({
  searchTerm,
  onSearchChange,
  onBarcodeSearch,
  isBarcodeScanning,
  onCustomerSelect,
  searchInputRef
}: ProductSearchProps): React.JSX.Element {
  return (
    <div className="flex gap-3">
      <div className="relative flex-1">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search products by name, barcode, or SKU (Press Enter to scan)"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && searchTerm.trim()) {
              onBarcodeSearch(searchTerm)
            }
          }}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          autoFocus
        />
        <svg
          className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {/* Barcode Scanning Indicator */}
        {isBarcodeScanning && (
          <div className="absolute right-3 top-3 flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
            <span>Scanning...</span>
          </div>
        )}
      </div>
      <button
        onClick={onCustomerSelect}
        className="inline-flex items-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        Select Customer
      </button>
    </div>
  )
}
