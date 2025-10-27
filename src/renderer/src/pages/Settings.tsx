import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'

export default function Settings(): React.JSX.Element {
  const user = useAuthStore((state) => state.user)
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
  const [backupRestoreLoading, setBackupRestoreLoading] = useState(false)

  // Check if user is admin or super_admin
  const canAccessBackup = user?.role === 'super_admin' || user?.role === 'admin'

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

  const handleBackup = async (): Promise<void> => {
    if (!canAccessBackup) {
      toast.error('You do not have permission to backup the database')
      return
    }

    try {
      setBackupRestoreLoading(true)
      const result = await window.electron.ipcRenderer.invoke('db:backup:create')

      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Backup failed:', error)
      toast.error('Failed to create backup')
    } finally {
      setBackupRestoreLoading(false)
    }
  }

  const handleRestore = async (): Promise<void> => {
    if (!canAccessBackup) {
      toast.error('You do not have permission to restore the database')
      return
    }

    const confirmed = confirm(
      'WARNING: Restoring a backup will replace your current database. ' +
        'A backup of your current database will be created automatically. ' +
        'Do you want to continue?'
    )

    if (!confirmed) return

    try {
      setBackupRestoreLoading(true)
      const result = await window.electron.ipcRenderer.invoke('db:backup:restore')

      if (result.success) {
        toast.success(result.message)
        if (result.requiresRestart) {
          setTimeout(() => {
            window.electron.ipcRenderer.send('app:restart')
          }, 2000)
        }
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Restore failed:', error)
      toast.error('Failed to restore backup')
    } finally {
      setBackupRestoreLoading(false)
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
            {canAccessBackup && (
              <button
                onClick={() => setActiveTab('backup')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'backup'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                    />
                  </svg>
                  Backup & Restore
                </div>
              </button>
            )}
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

      {/* Backup & Restore Settings */}
      {activeTab === 'backup' && canAccessBackup && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Database Backup & Restore</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create backups of your database and restore from previous backups
            </p>
          </div>

          <div className="space-y-6">
            {/* Backup Section */}
            <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Backup</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Download a complete backup of your pharmacy database. This includes all
                    products, sales, purchases, customers, and other important data.
                  </p>
                  <button
                    onClick={handleBackup}
                    disabled={backupRestoreLoading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {backupRestoreLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Creating Backup...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                          />
                        </svg>
                        Create Backup
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Restore Section */}
            <div className="border border-red-200 rounded-lg p-6 bg-red-50">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Restore Backup</h3>
                  <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
                    <div className="flex gap-3">
                      <svg
                        className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-red-800 mb-1">Warning</p>
                        <p className="text-xs text-red-700">
                          Restoring a backup will replace ALL current data with the backup data. A
                          backup of your current database will be created automatically before
                          restoring. The application will restart after restoration.
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Select a backup file to restore your database to a previous state.
                  </p>
                  <button
                    onClick={handleRestore}
                    disabled={backupRestoreLoading}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {backupRestoreLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Restoring...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        Restore Backup
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Best Practices</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Create regular backups daily or weekly depending on your business activity
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Store backup files in a secure location (external drive, cloud storage)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Test your backups periodically to ensure they can be restored successfully
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Keep multiple backup versions to have restore options from different time
                    periods
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
