interface GeneralSettingsFormProps {
  storeName: string
  storePhone: string
  storeEmail: string
  storeAddress: string
  onStoreNameChange: (value: string) => void
  onStorePhoneChange: (value: string) => void
  onStoreEmailChange: (value: string) => void
  onStoreAddressChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => Promise<void>
}

export default function GeneralSettingsForm({
  storeName,
  storePhone,
  storeEmail,
  storeAddress,
  onStoreNameChange,
  onStorePhoneChange,
  onStoreEmailChange,
  onStoreAddressChange,
  onSubmit
}: GeneralSettingsFormProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Store Information</h2>
        <p className="text-sm text-gray-600 mt-1">Basic information about your pharmacy store</p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => onStoreNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter store name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={storePhone}
              onChange={(e) => onStorePhoneChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={storeEmail}
              onChange={(e) => onStoreEmailChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter email address"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
            <textarea
              value={storeAddress}
              onChange={(e) => onStoreAddressChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter full store address"
              rows={3}
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
