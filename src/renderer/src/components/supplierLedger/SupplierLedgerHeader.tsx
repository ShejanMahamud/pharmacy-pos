import { Link } from 'react-router-dom'

interface SupplierLedgerHeaderProps {
  onExportPdf: () => void
  canExport: boolean
}

export default function SupplierLedgerHeader({
  onExportPdf,
  canExport
}: SupplierLedgerHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-3">
          <Link to="/suppliers" className="text-gray-600 hover:text-gray-800 transition-colors">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Supplier Ledger</h1>
            <p className="text-sm text-gray-600 mt-1">
              View supplier account statements and transactions
            </p>
          </div>
        </div>
      </div>
      <button
        onClick={onExportPdf}
        disabled={!canExport}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Export PDF
      </button>
    </div>
  )
}
