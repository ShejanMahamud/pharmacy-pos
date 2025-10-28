import { useState } from 'react'
import { BankAccount } from '../../types/pos'

interface PaymentModalProps {
  isOpen: boolean
  total: number
  accounts: BankAccount[]
  currencySymbol: string
  onComplete: (paymentMethod: string, paidAmount: number, selectedAccount: string) => void
  onClose: () => void
}

export default function PaymentModal({
  isOpen,
  total,
  accounts,
  currencySymbol,
  onComplete,
  onClose
}: PaymentModalProps): React.JSX.Element | null {
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [selectedAccount, setSelectedAccount] = useState('')
  const [paidAmount, setPaidAmount] = useState('')

  if (!isOpen) return null

  const handleSubmit = (): void => {
    onComplete(paymentMethod, parseFloat(paidAmount), selectedAccount)
    // Reset local state
    setPaymentMethod('cash')
    setSelectedAccount('')
    setPaidAmount('')
  }

  return (
    <div className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-lg shadow-xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
          <p className="text-sm text-gray-600 mt-1">
            Process the transaction and complete the sale
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Cash
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Card
              </button>
              <button
                onClick={() => setPaymentMethod('mobile')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'mobile'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Mobile
              </button>
              <button
                onClick={() => setPaymentMethod('credit')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'credit'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Credit
              </button>
            </div>
          </div>

          {/* Account Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Account <span className="text-xs text-gray-500">(Optional)</span>
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">No Account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} - {currencySymbol}
                  {account.currentBalance.toFixed(2)}
                </option>
              ))}
            </select>
            {selectedAccount && (
              <p className="text-xs text-green-600 mt-1">✓ Money will be added to this account</p>
            )}
          </div>

          {/* Total Amount */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
            <div className="text-3xl font-bold text-blue-600">
              {currencySymbol}
              {total.toFixed(2)}
            </div>
          </div>

          {/* Paid Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Paid Amount</label>
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              placeholder="0.00"
              step="0.01"
              autoFocus
            />
          </div>

          {/* Quick Amount Buttons */}
          {paymentMethod === 'cash' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Amount</label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 50, 100].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setPaidAmount(amount.toString())}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 rounded-lg text-sm font-medium transition-colors"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPaidAmount(total.toFixed(2))}
                className="w-full mt-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                Exact Amount
              </button>
            </div>
          )}

          {/* Change/Error Display */}
          {paidAmount && parseFloat(paidAmount) >= total && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-sm font-medium text-green-800">Change to Return:</p>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {currencySymbol}
                {(parseFloat(paidAmount) - total).toFixed(2)}
              </p>
            </div>
          )}

          {paidAmount && parseFloat(paidAmount) < total && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-red-700">
                  Insufficient payment: {currencySymbol}
                  {(total - parseFloat(paidAmount)).toFixed(2)} short
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!paidAmount || parseFloat(paidAmount) < total}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          >
            Complete Sale
          </button>
        </div>
      </div>
    </div>
  )
}
