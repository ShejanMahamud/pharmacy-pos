export interface Product {
  id: string
  name: string
  genericName?: string
  barcode?: string
  sku: string
  sellingPrice: number
  costPrice: number
  taxRate: number
  discountPercent: number
  quantity?: number
}

export interface InventoryItem {
  id: string
  productId: string
  quantity: number
  reorderLevel: number
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  loyaltyPoints: number
}

export interface BankAccount {
  id: string
  name: string
  accountType: string
  currentBalance: number
  isActive: boolean
}

export interface CartItem {
  id: string
  barcode: string
  productId: string
  name: string
  price: number
  quantity: number
  discount: number
  taxRate: number
}
