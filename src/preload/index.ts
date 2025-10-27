import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  // Users
  users: {
    getAll: () => ipcRenderer.invoke('db:users:getAll'),
    getById: (id: string) => ipcRenderer.invoke('db:users:getById', id),
    authenticate: (username: string, password: string) =>
      ipcRenderer.invoke('db:users:authenticate', { username, password }),
    create: (data: any) => ipcRenderer.invoke('db:users:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('db:users:update', { id, data }),
    delete: (id: string) => ipcRenderer.invoke('db:users:delete', id)
  },
  // Categories
  categories: {
    getAll: () => ipcRenderer.invoke('db:categories:getAll'),
    create: (data: any) => ipcRenderer.invoke('db:categories:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('db:categories:update', { id, data }),
    delete: (id: string) => ipcRenderer.invoke('db:categories:delete', id)
  },
  // Units
  units: {
    getAll: () => ipcRenderer.invoke('db:units:getAll'),
    create: (data: any) => ipcRenderer.invoke('db:units:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('db:units:update', { id, data }),
    delete: (id: string) => ipcRenderer.invoke('db:units:delete', id)
  },
  // Suppliers
  suppliers: {
    getAll: () => ipcRenderer.invoke('db:suppliers:getAll'),
    create: (data: any) => ipcRenderer.invoke('db:suppliers:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('db:suppliers:update', { id, data }),
    delete: (id: string) => ipcRenderer.invoke('db:suppliers:delete', id)
  },
  // Supplier Payments
  supplierPayments: {
    create: (data: any) => ipcRenderer.invoke('db:supplierPayments:create', data),
    getBySupplierId: (supplierId: string, startDate?: string, endDate?: string) =>
      ipcRenderer.invoke('db:supplierPayments:getBySupplierId', { supplierId, startDate, endDate })
  },
  // Supplier Ledger
  supplierLedger: {
    getEntries: (supplierId: string, startDate?: string, endDate?: string) =>
      ipcRenderer.invoke('db:supplierLedger:getEntries', { supplierId, startDate, endDate }),
    createEntry: (data: any) => ipcRenderer.invoke('db:supplierLedger:createEntry', data)
  },
  // Bank Accounts
  bankAccounts: {
    getAll: () => ipcRenderer.invoke('db:bankAccounts:getAll'),
    create: (data: any) => ipcRenderer.invoke('db:bankAccounts:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('db:bankAccounts:update', { id, data }),
    delete: (id: string) => ipcRenderer.invoke('db:bankAccounts:delete', id),
    updateBalance: (id: string, amount: number, type: 'debit' | 'credit') =>
      ipcRenderer.invoke('db:bankAccounts:updateBalance', { id, amount, type })
  },
  // Products
  products: {
    getAll: (search?: string) => ipcRenderer.invoke('db:products:getAll', search),
    getById: (id: string) => ipcRenderer.invoke('db:products:getById', id),
    getByBarcode: (barcode: string) => ipcRenderer.invoke('db:products:getByBarcode', barcode),
    create: (data: any) => ipcRenderer.invoke('db:products:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('db:products:update', { id, data }),
    delete: (id: string) => ipcRenderer.invoke('db:products:delete', id)
  },
  // Inventory
  inventory: {
    getAll: () => ipcRenderer.invoke('db:inventory:getAll'),
    getLowStock: () => ipcRenderer.invoke('db:inventory:getLowStock'),
    updateQuantity: (productId: string, quantity: number) =>
      ipcRenderer.invoke('db:inventory:updateQuantity', { productId, quantity })
  },
  // Customers
  customers: {
    getAll: (search?: string) => ipcRenderer.invoke('db:customers:getAll', search),
    getByPhone: (phone: string) => ipcRenderer.invoke('db:customers:getByPhone', phone),
    create: (data: any) => ipcRenderer.invoke('db:customers:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('db:customers:update', { id, data })
  },
  // Sales
  sales: {
    create: (sale: any, items: any[]) => ipcRenderer.invoke('db:sales:create', { sale, items }),
    getAll: (startDate?: string, endDate?: string) =>
      ipcRenderer.invoke('db:sales:getAll', { startDate, endDate }),
    getById: (id: string) => ipcRenderer.invoke('db:sales:getById', id)
  },
  // Sales Returns
  salesReturns: {
    create: (salesReturn: any, items: any[]) =>
      ipcRenderer.invoke('db:salesReturns:create', { salesReturn, items }),
    getAll: (startDate?: string, endDate?: string) =>
      ipcRenderer.invoke('db:salesReturns:getAll', { startDate, endDate }),
    getById: (id: string) => ipcRenderer.invoke('db:salesReturns:getById', id)
  },
  // Purchases
  purchases: {
    create: (purchase: any, items: any[]) =>
      ipcRenderer.invoke('db:purchases:create', { purchase, items }),
    getAll: (startDate?: string, endDate?: string) =>
      ipcRenderer.invoke('db:purchases:getAll', { startDate, endDate }),
    getById: (id: string) => ipcRenderer.invoke('db:purchases:getById', id)
  },
  // Purchase Returns
  purchaseReturns: {
    create: (purchaseReturn: any, items: any[]) =>
      ipcRenderer.invoke('db:purchaseReturns:create', { purchaseReturn, items }),
    getAll: (startDate?: string, endDate?: string) =>
      ipcRenderer.invoke('db:purchaseReturns:getAll', { startDate, endDate }),
    getById: (id: string) => ipcRenderer.invoke('db:purchaseReturns:getById', id)
  },
  // Expenses
  expenses: {
    create: (data: any) => ipcRenderer.invoke('db:expenses:create', data),
    getAll: (startDate?: string, endDate?: string) =>
      ipcRenderer.invoke('db:expenses:getAll', { startDate, endDate })
  },
  // Settings
  settings: {
    getAll: () => ipcRenderer.invoke('db:settings:getAll'),
    get: (key: string) => ipcRenderer.invoke('db:settings:get', key),
    update: (key: string, value: string) => ipcRenderer.invoke('db:settings:update', { key, value })
  },
  // Reports
  reports: {
    salesSummary: (startDate: string, endDate: string) =>
      ipcRenderer.invoke('db:reports:salesSummary', { startDate, endDate }),
    topProducts: (startDate: string, endDate: string, limit?: number) =>
      ipcRenderer.invoke('db:reports:topProducts', { startDate, endDate, limit })
  },
  // Audit Logs
  auditLogs: {
    create: (data: any) => ipcRenderer.invoke('db:auditLogs:create', data)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
