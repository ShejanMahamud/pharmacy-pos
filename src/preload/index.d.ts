import { ElectronAPI } from '@electron-toolkit/preload'

interface User {
  id: string
  username: string
  password?: string
  fullName: string
  email?: string
  phone?: string
  role: 'super_admin' | 'admin' | 'manager' | 'cashier' | 'pharmacist'
  createdBy?: string
  isActive?: boolean
  mustChangePassword?: boolean
}

interface API {
  users: {
    getAll: () => Promise<User[]>
    getById: (id: string) => Promise<User | undefined>
    authenticate: (username: string, password: string) => Promise<User | undefined>
    create: (data: Partial<User>) => Promise<User>
    update: (id: string, data: Partial<User>) => Promise<User>
    delete: (id: string) => Promise<void>
    changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<User>
    resetPassword: (userId: string, newPassword: string, adminId: string) => Promise<User>
  }
  categories: {
    getAll: () => Promise<any[]>
    create: (data: any) => Promise<any>
    update: (id: string, data: any) => Promise<any>
    delete: (id: string) => Promise<void>
  }
  units: {
    getAll: () => Promise<any[]>
    create: (data: any) => Promise<any>
    update: (id: string, data: any) => Promise<any>
    delete: (id: string) => Promise<void>
  }
  suppliers: {
    getAll: () => Promise<any[]>
    create: (data: any) => Promise<any>
    update: (id: string, data: any) => Promise<any>
    delete: (id: string) => Promise<void>
  }
  supplierPayments: {
    create: (data: any) => Promise<any>
    getBySupplierId: (supplierId: string, startDate?: string, endDate?: string) => Promise<any[]>
  }
  supplierLedger: {
    getEntries: (supplierId: string, startDate?: string, endDate?: string) => Promise<any[]>
    createEntry: (data: any) => Promise<any>
  }
  bankAccounts: {
    getAll: () => Promise<any[]>
    create: (data: any) => Promise<any>
    update: (id: string, data: any) => Promise<any>
    delete: (id: string) => Promise<void>
    updateBalance: (
      id: string,
      amount: number,
      type: 'debit' | 'credit',
      userId: string | null,
      username: string | null
    ) => Promise<any>
  }
  products: {
    getAll: (search?: string) => Promise<any[]>
    getById: (id: string) => Promise<any>
    getByBarcode: (barcode: string) => Promise<any>
    search: (search: string) => Promise<any[]>
    create: (data: any) => Promise<any>
    update: (id: string, data: any) => Promise<any>
    delete: (id: string) => Promise<void>
  }
  inventory: {
    getAll: () => Promise<any[]>
    getLowStock: () => Promise<any[]>
    updateQuantity: (productId: string, quantity: number) => Promise<any>
  }
  customers: {
    getAll: (search?: string) => Promise<any[]>
    getByPhone: (phone: string) => Promise<any>
    create: (data: any) => Promise<any>
    update: (id: string, data: any) => Promise<any>
  }
  sales: {
    create: (sale: any, items: any[]) => Promise<any>
    getAll: (startDate?: string, endDate?: string) => Promise<any[]>
    getById: (id: string) => Promise<any>
  }
  salesReturns: {
    create: (salesReturn: any, items: any[]) => Promise<any>
    getAll: (startDate?: string, endDate?: string) => Promise<any[]>
    getById: (id: string) => Promise<any>
  }
  purchases: {
    create: (purchase: any, items: any[]) => Promise<any>
    getAll: (startDate?: string, endDate?: string) => Promise<any[]>
    getById: (id: string) => Promise<any>
  }
  purchaseReturns: {
    create: (purchaseReturn: any, items: any[]) => Promise<any>
    getAll: (startDate?: string, endDate?: string) => Promise<any[]>
    getById: (id: string) => Promise<any>
  }
  damagedItems: {
    getAll: () => Promise<any[]>
    create: (data: any) => Promise<any>
  }
  expenses: {
    create: (data: any) => Promise<any>
    getAll: (startDate?: string, endDate?: string) => Promise<any[]>
  }
  settings: {
    getAll: () => Promise<any[]>
    get: (key: string) => Promise<any>
    update: (key: string, value: string) => Promise<any>
  }
  reports: {
    salesSummary: (startDate: string, endDate: string) => Promise<any>
    topProducts: (startDate: string, endDate: string, limit?: number) => Promise<any[]>
  }
  auditLogs: {
    getAll: (filters?: {
      startDate?: string
      endDate?: string
      action?: string
      entityType?: string
      userId?: string
    }) => Promise<any[]>
    create: (data: {
      userId?: string
      username?: string
      action: string
      entityType: string
      entityId?: string
      entityName?: string
      changes?: object
      ipAddress?: string
      userAgent?: string
    }) => Promise<{ success: boolean; id?: string; error?: string }>
    getStats: () => Promise<{
      totalLogs: number
      recentActivity: any[]
      userActivity: any[]
    }>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
