export interface Sale {
  id: string
  invoiceNumber: string
  customerName?: string
  totalAmount: number
  paidAmount: number
  changeAmount: number
  paymentMethod: string
  status: string
  createdAt: string
  userName?: string
}

export interface SaleItem {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  discountPercent: number
  taxRate: number
  subtotal: number
}

export interface BankAccount {
  id: string
  name: string
  accountType: string
  currentBalance: number
  isActive: boolean
}

export interface ReturnFormData {
  saleId: string
  accountId: string
  refundAmount: number
  reason: string
  notes: string
}

export interface ReturnItem {
  saleItemId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  maxQuantity: number
}
