import { Supplier } from '../../types/supplierLedger'

interface SupplierInfoCardProps {
  supplier: Supplier
  totalDebit: number
  totalCredit: number
  currentBalance: number
  formatCurrency: (amount: number) => string
}

export default function SupplierInfoCard({
  supplier,
  totalDebit,
  totalCredit,
  currentBalance,
  formatCurrency
}: SupplierInfoCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supplier Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Supplier Information</h3>
          <div className="space-y-2">
            <div className="flex">
              <span className="text-sm text-gray-600 w-32">Supplier Name:</span>
              <span className="text-sm font-medium text-gray-900">{supplier.name}</span>
            </div>
            <div className="flex">
              <span className="text-sm text-gray-600 w-32">Supplier Code:</span>
              <span className="text-sm font-medium text-gray-900">{supplier.code}</span>
            </div>
            {supplier.contactPerson && (
              <div className="flex">
                <span className="text-sm text-gray-600 w-32">Contact Person:</span>
                <span className="text-sm text-gray-900">{supplier.contactPerson}</span>
              </div>
            )}
            {supplier.phone && (
              <div className="flex">
                <span className="text-sm text-gray-600 w-32">Phone:</span>
                <span className="text-sm text-gray-900">{supplier.phone}</span>
              </div>
            )}
            {supplier.email && (
              <div className="flex">
                <span className="text-sm text-gray-600 w-32">Email:</span>
                <span className="text-sm text-gray-900">{supplier.email}</span>
              </div>
            )}
            {supplier.creditLimit !== undefined && supplier.creditLimit > 0 && (
              <div className="flex">
                <span className="text-sm text-gray-600 w-32">Credit Limit:</span>
                <span className="text-sm text-gray-900">
                  {formatCurrency(supplier.creditLimit)}
                </span>
              </div>
            )}
            {supplier.creditDays !== undefined && supplier.creditDays > 0 && (
              <div className="flex">
                <span className="text-sm text-gray-600 w-32">Credit Days:</span>
                <span className="text-sm text-gray-900">{supplier.creditDays} days</span>
              </div>
            )}
          </div>
        </div>

        {/* Account Summary */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Summary</h3>
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm text-gray-700">Total Purchases (Debit)</span>
              <span className="text-lg font-bold text-blue-600">{formatCurrency(totalDebit)}</span>
            </div>
            <div className="bg-green-50 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm text-gray-700">Total Payments (Credit)</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(totalCredit)}
              </span>
            </div>
            <div
              className={`rounded-lg p-3 flex items-center justify-between ${
                currentBalance > 0 ? 'bg-red-50' : currentBalance < 0 ? 'bg-green-50' : 'bg-gray-50'
              }`}
            >
              <span className="text-sm text-gray-700 font-medium">Current Balance</span>
              <span
                className={`text-xl font-bold ${
                  currentBalance > 0
                    ? 'text-red-600'
                    : currentBalance < 0
                      ? 'text-green-600'
                      : 'text-gray-600'
                }`}
              >
                {formatCurrency(Math.abs(currentBalance))}
                {currentBalance > 0 ? ' (Payable)' : currentBalance < 0 ? ' (Receivable)' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
