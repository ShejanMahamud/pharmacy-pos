import { ElectronAPI } from '@electron-toolkit/preload'

interface Branch {
  id: string
  name: string
  code: string
  address?: string
  phone?: string
  email?: string
  isActive?: boolean
}

interface User {
  id: string
  username: string
  password?: string
  fullName: string
  email?: string
  phone?: string
  role: 'super_admin' | 'admin' | 'manager' | 'cashier' | 'pharmacist'
  branchId?: string
  createdBy?: string
  isActive?: boolean
}

interface API {
  branches: {
    getAll: () => Promise<Branch[]>
    getById: (id: string) => Promise<Branch | undefined>
    create: (data: Partial<Branch>) => Promise<Branch>
    update: (id: string, data: Partial<Branch>) => Promise<Branch>
    delete: (id: string) => Promise<void>
  }
  users: {
    getAll: (branchId?: string) => Promise<User[]>
    getById: (id: string) => Promise<User | undefined>
    authenticate: (username: string, password: string) => Promise<User | undefined>
    create: (data: Partial<User>) => Promise<User>
    update: (id: string, data: Partial<User>) => Promise<User>
    delete: (id: string) => Promise<void>
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
  bankAccounts: {
    getAll: () => Promise<any[]>
    create: (data: any) => Promise<any>
    update: (id: string, data: any) => Promise<any>
    delete: (id: string) => Promise<void>
    updateBalance: (id: string, amount: number, type: 'debit' | 'credit') => Promise<any>
  }
  products: {
    getAll: (search?: string) => Promise<any[]>
    getById: (id: string) => Promise<any>
    getByBarcode: (barcode: string) => Promise<any>
    create: (data: any) => Promise<any>
    update: (id: string, data: any) => Promise<any>
    delete: (id: string) => Promise<void>
  }
  inventory: {
    getByBranch: (branchId: string) => Promise<any[]>
    getLowStock: (branchId: string) => Promise<any[]>
    updateQuantity: (productId: string, branchId: string, quantity: number) => Promise<any>
  }
  customers: {
    getAll: (search?: string) => Promise<any[]>
    getByPhone: (phone: string) => Promise<any>
    create: (data: any) => Promise<any>
    update: (id: string, data: any) => Promise<any>
  }
  sales: {
    create: (sale: any, items: any[]) => Promise<any>
    getByBranch: (branchId: string, startDate?: string, endDate?: string) => Promise<any[]>
    getById: (id: string) => Promise<any>
  }
  salesReturns: {
    create: (salesReturn: any, items: any[]) => Promise<any>
    getByBranch: (branchId: string, startDate?: string, endDate?: string) => Promise<any[]>
    getById: (id: string) => Promise<any>
  }
  purchases: {
    create: (purchase: any, items: any[]) => Promise<any>
    getByBranch: (branchId: string, startDate?: string, endDate?: string) => Promise<any[]>
    getById: (id: string) => Promise<any>
  }
  purchaseReturns: {
    create: (purchaseReturn: any, items: any[]) => Promise<any>
    getByBranch: (branchId: string, startDate?: string, endDate?: string) => Promise<any[]>
    getById: (id: string) => Promise<any>
  }
  expenses: {
    create: (data: any) => Promise<any>
    getByBranch: (branchId: string, startDate?: string, endDate?: string) => Promise<any[]>
  }
  settings: {
    getAll: () => Promise<any[]>
    get: (key: string) => Promise<any>
    update: (key: string, value: string) => Promise<any>
  }
  reports: {
    salesSummary: (branchId: string, startDate: string, endDate: string) => Promise<any>
    topProducts: (
      branchId: string,
      startDate: string,
      endDate: string,
      limit?: number
    ) => Promise<any[]>
  }
  auditLogs: {
    create: (data: any) => Promise<void>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
