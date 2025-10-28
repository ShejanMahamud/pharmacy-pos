interface SystemSettingsFormProps {
  taxRate: string
  currency: string
  lowStockThreshold: string
  onTaxRateChange: (value: string) => void
  onCurrencyChange: (value: string) => void
  onLowStockThresholdChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => Promise<void>
}

export default function SystemSettingsForm({
  taxRate,
  currency,
  lowStockThreshold,
  onTaxRateChange,
  onCurrencyChange,
  onLowStockThresholdChange,
  onSubmit
}: SystemSettingsFormProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">System Configuration</h2>
        <p className="text-sm text-gray-600 mt-1">Configure system-wide settings</p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={taxRate}
              onChange={(e) => onTaxRateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter tax rate"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="BDT">BDT - Bangladeshi Taka</option>
              <option value="INR">INR - Indian Rupee</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Low Stock Threshold
            </label>
            <input
              type="number"
              value={lowStockThreshold}
              onChange={(e) => onLowStockThresholdChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter threshold quantity"
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
