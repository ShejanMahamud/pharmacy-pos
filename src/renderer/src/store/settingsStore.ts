import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  storeName: string
  storePhone: string
  storeEmail: string
  storeAddress: string
  taxRate: number
  currency: string
  receiptFooter: string
  lowStockThreshold: number
  loadSettings: () => Promise<void>
  updateSetting: (key: string, value: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      storeName: '',
      storePhone: '',
      storeEmail: '',
      storeAddress: '',
      taxRate: 0,
      currency: 'USD',
      receiptFooter: '',
      lowStockThreshold: 10,
      loadSettings: async () => {
        try {
          if (!window.api) {
            console.error('window.api not available in loadSettings')
            return
          }
          const settings = await window.api.settings.getAll()
          const settingsMap: { [key: string]: string } = {}
          settings.forEach((setting: any) => {
            settingsMap[setting.key] = setting.value
          })

          set({
            storeName: settingsMap['store_name'] || '',
            storePhone: settingsMap['store_phone'] || '',
            storeEmail: settingsMap['store_email'] || '',
            storeAddress: settingsMap['store_address'] || '',
            taxRate: parseFloat(settingsMap['tax_rate'] || '0'),
            currency: settingsMap['currency'] || 'USD',
            receiptFooter: settingsMap['receipt_footer'] || '',
            lowStockThreshold: parseInt(settingsMap['low_stock_threshold'] || '10')
          })
        } catch (error) {
          console.error('Error loading settings:', error)
        }
      },
      updateSetting: (key: string, value: string) => {
        const updates: { [key: string]: any } = {}
        switch (key) {
          case 'store_name':
            updates.storeName = value
            break
          case 'store_phone':
            updates.storePhone = value
            break
          case 'store_email':
            updates.storeEmail = value
            break
          case 'store_address':
            updates.storeAddress = value
            break
          case 'tax_rate':
            updates.taxRate = parseFloat(value)
            break
          case 'currency':
            updates.currency = value
            break
          case 'receipt_footer':
            updates.receiptFooter = value
            break
          case 'low_stock_threshold':
            updates.lowStockThreshold = parseInt(value)
            break
        }
        set(updates)
      }
    }),
    {
      name: 'settings-storage'
    }
  )
)
