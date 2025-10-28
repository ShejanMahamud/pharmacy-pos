import { BalanceAdjustmentData, BankAccount } from '../../types/bankAccount'

interface BalanceAdjustmentModalProps {
  show: boolean
  account: BankAccount | null
  adjustmentData: BalanceAdjustmentData
  loading: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onAdjustmentDataChange: (data: Partial<BalanceAdjustmentData>) => void
}

export default function BalanceAdjustmentModal({
  show,
  account,
  adjustmentData,
  loading,
  onClose,
  onSubmit,
  onAdjustmentDataChange
}: BalanceAdjustmentModalProps): React.JSX.Element | null {
  if (!show || !account) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative z-10">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Adjust Account Balance</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-700 mb-1">
              <span className="font-semibold">Account:</span> {account.name}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Current Balance:</span>{' '}
              <span
                className={`font-bold ${account.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                ${Math.abs(account.currentBalance).toFixed(2)}
              </span>
            </div>
          </div>

          <form onSubmit={onSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adjustment Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={adjustmentData.type}
                  onChange={(e) =>
                    onAdjustmentDataChange({
                      type: e.target.value as 'credit' | 'debit'
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="credit">Credit (Add Money)</option>
                  <option value="debit">Debit (Deduct Money)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={adjustmentData.amount}
                  onChange={(e) => onAdjustmentDataChange({ amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={adjustmentData.reason}
                  onChange={(e) => onAdjustmentDataChange({ reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Explain the reason for this adjustment (for audit trail)"
                  required
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> This adjustment will be recorded for audit purposes. Make
                  sure to provide a clear reason for the adjustment.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Adjusting...' : 'Adjust Balance'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
