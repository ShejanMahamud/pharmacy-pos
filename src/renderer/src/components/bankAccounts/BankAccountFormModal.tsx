import { BankAccount, BankAccountFormData } from '../../types/bankAccount'

interface BankAccountFormModalProps {
  show: boolean
  editingAccount: BankAccount | null
  formData: BankAccountFormData
  loading: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onFormChange: (data: Partial<BankAccountFormData>) => void
}

export default function BankAccountFormModal({
  show,
  editingAccount,
  formData,
  loading,
  onClose,
  onSubmit,
  onFormChange
}: BankAccountFormModalProps): React.JSX.Element | null {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {editingAccount ? 'Edit Account' : 'Add New Account'}
            </h2>
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

          <form onSubmit={onSubmit}>
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => onFormChange({ name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Cash in Hand / HSBC Account"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type *
                  </label>
                  <select
                    required
                    value={formData.accountType}
                    onChange={(e) =>
                      onFormChange({
                        accountType: e.target.value as 'cash' | 'bank' | 'mobile_banking'
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Account</option>
                    <option value="mobile_banking">Mobile Banking</option>
                  </select>
                </div>
              </div>

              {/* Account Number & Bank/Provider Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => onFormChange({ accountNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.accountType === 'bank'
                      ? 'Bank Name'
                      : formData.accountType === 'mobile_banking'
                        ? 'Provider Name'
                        : 'Bank/Provider'}
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => onFormChange({ bankName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={
                      formData.accountType === 'bank'
                        ? 'HSBC Bank'
                        : formData.accountType === 'mobile_banking'
                          ? 'bKash / Nagad'
                          : 'Bank or Provider Name'
                    }
                  />
                </div>
              </div>

              {/* Bank/Mobile Banking Details */}
              {formData.accountType !== 'cash' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.accountType === 'bank' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Branch Name
                        </label>
                        <input
                          type="text"
                          value={formData.branchName}
                          onChange={(e) => onFormChange({ branchName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Main Branch"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Holder
                      </label>
                      <input
                        type="text"
                        value={formData.accountHolder}
                        onChange={(e) => onFormChange({ accountHolder: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opening Balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.openingBalance}
                  onChange={(e) => onFormChange({ openingBalance: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  disabled={!!editingAccount}
                />
                {editingAccount && (
                  <p className="text-xs text-gray-500 mt-1">
                    Opening balance cannot be changed after creation
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description / Notes
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => onFormChange({ description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes about this account"
                />
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingAccount ? 'Update Account' : 'Add Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
