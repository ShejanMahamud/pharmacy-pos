interface ReceiptSettingsFormProps {
  receiptFooter: string
  onReceiptFooterChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => Promise<void>
}

export default function ReceiptSettingsForm({
  receiptFooter,
  onReceiptFooterChange,
  onSubmit
}: ReceiptSettingsFormProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Receipt Configuration</h2>
        <p className="text-sm text-gray-600 mt-1">Customize your receipt and invoice format</p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Receipt Footer Text
            </label>
            <textarea
              value={receiptFooter}
              onChange={(e) => onReceiptFooterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter text to appear at the bottom of receipts"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              This text will appear at the bottom of all printed receipts
            </p>
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
