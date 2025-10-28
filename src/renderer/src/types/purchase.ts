export interface Purchase {
  id: string
  invoiceNumber: string
  supplierName?: string
  totalAmount: number
  paidAmount: number
  dueAmount: number
  paymentStatus: string
  status: string
  createdAt: string
}

export interface PurchaseItem {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  discountPercent: number
  taxRate: number
  subtotal: number
  batchNumber?: string
  expiryDate?: string
}

export interface Supplier {
  id: string
  name: string
  company?: string
  phone: string
  email?: string
}

export interface Product {
  id: string
  name: string
  sku: string
  costPrice: number
  unit: string
  packageUnit?: string
  unitsPerPackage?: number
}

export interface BankAccount {
  id: string
  name: string
  accountType: string
  currentBalance: number
  isActive: boolean
}
