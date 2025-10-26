import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSettingsStore } from '../store/settingsStore'

export default function Settings(): React.JSX.Element {
  const updateSetting = useSettingsStore((state) => state.updateSetting)
  const loadSettingsFn = useSettingsStore((state) => state.loadSettings)
  const storeNameFromStore = useSettingsStore((state) => state.storeName)
  const storePhoneFromStore = useSettingsStore((state) => state.storePhone)
  const storeEmailFromStore = useSettingsStore((state) => state.storeEmail)
  const storeAddressFromStore = useSettingsStore((state) => state.storeAddress)
  const taxRateFromStore = useSettingsStore((state) => state.taxRate)
  const currencyFromStore = useSettingsStore((state) => state.currency)
  const receiptFooterFromStore = useSettingsStore((state) => state.receiptFooter)
  const lowStockThresholdFromStore = useSettingsStore((state) => state.lowStockThreshold)

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('general')

  // Form states - initialize from store
  const [storeName, setStoreName] = useState(storeNameFromStore)
  const [storePhone, setStorePhone] = useState(storePhoneFromStore)
  const [storeEmail, setStoreEmail] = useState(storeEmailFromStore)
  const [storeAddress, setStoreAddress] = useState(storeAddressFromStore)
  const [taxRate, setTaxRate] = useState(taxRateFromStore.toString())
  const [currency, setCurrency] = useState(currencyFromStore)
  const [receiptFooter, setReceiptFooter] = useState(receiptFooterFromStore)
  const [lowStockThreshold, setLowStockThreshold] = useState(lowStockThresholdFromStore.toString())

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    // Update form when store changes
    setStoreName(storeNameFromStore)
    setStorePhone(storePhoneFromStore)
    setStoreEmail(storeEmailFromStore)
    setStoreAddress(storeAddressFromStore)
    setTaxRate(taxRateFromStore.toString())
    setCurrency(currencyFromStore)
    setReceiptFooter(receiptFooterFromStore)
    setLowStockThreshold(lowStockThresholdFromStore.toString())
  }, [
    storeNameFromStore,
    storePhoneFromStore,
    storeEmailFromStore,
    storeAddressFromStore,
    taxRateFromStore,
    currencyFromStore,
    receiptFooterFromStore,
    lowStockThresholdFromStore
  ])

  const loadSettings = async (): Promise<void> => {
    setLoading(true)
    try {
      await loadSettingsFn()
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGeneral = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      await Promise.all([
        window.api.settings.update('store_name', storeName),
        window.api.settings.update('store_phone', storePhone),
        window.api.settings.update('store_email', storeEmail),
        window.api.settings.update('store_address', storeAddress)
      ])

      // Update store
      updateSetting('store_name', storeName)
      updateSetting('store_phone', storePhone)
      updateSetting('store_email', storeEmail)
      updateSetting('store_address', storeAddress)

      toast.success('General settings saved successfully')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    }
  }

  const handleSaveSystem = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      await Promise.all([
        window.api.settings.update('tax_rate', taxRate),
        window.api.settings.update('currency', currency),
        window.api.settings.update('low_stock_threshold', lowStockThreshold)
      ])

      // Update store
      updateSetting('tax_rate', taxRate)
      updateSetting('currency', currency)
      updateSetting('low_stock_threshold', lowStockThreshold)

      toast.success('System settings saved successfully')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    }
  }

  const handleSaveReceipt = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      await window.api.settings.update('receipt_footer', receiptFooter)

      // Update store
      updateSetting('receipt_footer', receiptFooter)

      toast.success('Receipt settings saved successfully')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your pharmacy system settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'general'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                General
              </div>
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'system'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                System
              </div>
            </button>
            <button
              onClick={() => setActiveTab('receipt')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'receipt'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Receipt
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Store Information</h2>
            <p className="text-sm text-gray-600 mt-1">
              Basic information about your pharmacy store
            </p>
          </div>

          <form onSubmit={handleSaveGeneral}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
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
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Address
                </label>
                <textarea
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
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
      )}

      {/* System Settings */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">System Configuration</h2>
            <p className="text-sm text-gray-600 mt-1">Configure system-wide settings</p>
          </div>

          <form onSubmit={handleSaveSystem}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter tax rate"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
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
                  onChange={(e) => setLowStockThreshold(e.target.value)}
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
      )}

      {/* Receipt Settings */}
      {activeTab === 'receipt' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Receipt Configuration</h2>
            <p className="text-sm text-gray-600 mt-1">Customize your receipt and invoice format</p>
          </div>

          <form onSubmit={handleSaveReceipt}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt Footer Text
                </label>
                <textarea
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
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
      )}
    </div>
  )
}
