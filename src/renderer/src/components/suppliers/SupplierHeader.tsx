import { Link } from 'react-router-dom'

export default function SupplierHeader(): React.JSX.Element {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Suppliers Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your pharmacy suppliers and vendor information
        </p>
      </div>
      <Link
        to="/supplier-ledger"
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Supplier Ledger
      </Link>
    </div>
  )
}
