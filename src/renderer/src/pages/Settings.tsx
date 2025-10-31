import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Container, Box, Typography, CircularProgress } from '@mui/material'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'
import SettingsTabs from '../components/settings/SettingsTabs'
import GeneralSettingsForm from '../components/settings/GeneralSettingsForm'
import SystemSettingsForm from '../components/settings/SystemSettingsForm'
import ReceiptSettingsForm from '../components/settings/ReceiptSettingsForm'
import BackupRestoreSection from '../components/settings/BackupRestoreSection'

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
      <Container maxWidth="xl" sx={{ py: 4, bgcolor: 'grey.100', minHeight: '100vh' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px'
          }}
        >
          <CircularProgress size={48} />
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Loading settings...
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, bgcolor: 'grey.100', minHeight: '100vh' }}>
      {/* Page Header */}
      <Box
        sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your pharmacy system settings
          </Typography>
        </Box>
      </Box>

      <SettingsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        canAccessBackup={canAccessBackup}
      />

      {/* General Settings */}
      {activeTab === 'general' && (
        <GeneralSettingsForm
          storeName={storeName}
          storePhone={storePhone}
          storeEmail={storeEmail}
          storeAddress={storeAddress}
          onStoreNameChange={setStoreName}
          onStorePhoneChange={setStorePhone}
          onStoreEmailChange={setStoreEmail}
          onStoreAddressChange={setStoreAddress}
          onSubmit={handleSaveGeneral}
        />
      )}

      {/* System Settings */}
      {activeTab === 'system' && (
        <SystemSettingsForm
          taxRate={taxRate}
          currency={currency}
          lowStockThreshold={lowStockThreshold}
          onTaxRateChange={setTaxRate}
          onCurrencyChange={setCurrency}
          onLowStockThresholdChange={setLowStockThreshold}
          onSubmit={handleSaveSystem}
        />
      )}

      {/* Receipt Settings */}
      {activeTab === 'receipt' && (
        <ReceiptSettingsForm
          receiptFooter={receiptFooter}
          onReceiptFooterChange={setReceiptFooter}
          onSubmit={handleSaveReceipt}
        />
      )}

      {/* Backup & Restore Settings */}
      {activeTab === 'backup' && canAccessBackup && (
        <BackupRestoreSection
          loading={backupRestoreLoading}
          onBackup={handleBackup}
          onRestore={handleRestore}
        />
      )}
    </Container>
  )
}
