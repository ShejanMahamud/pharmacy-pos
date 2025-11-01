export interface Product {
  id: string
  name: string
  strength?: string
  barcode?: string
  sku: string
  sellingPrice: number
  costPrice: number
  imageUrl?: string
}

export interface SalesReturnItem {
  id: string
  returnId: string
  saleItemId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discountPercent: number
  taxRate: number
  subtotal: number
  batchNumber: string | null
  expiryDate: string | null
  reason: string | null
}

export interface SalesReturn {
  id: string
  returnNumber: string
  saleId: string
  customerId: string | null
  customerName: string | null
  accountId: string | null
  accountName: string | null
  userId: string
  userName: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  refundAmount: number
  refundStatus: 'pending' | 'partial' | 'refunded'
  reason: string | null
  notes: string | null
  createdAt: string
  items: SalesReturnItem[]
}

export interface PurchaseReturnItem {
  id: string
  returnId: string
  purchaseItemId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discountPercent: number
  taxRate: number
  subtotal: number
  batchNumber: string | null
  expiryDate: string | null
  reason: string | null
}

export interface PurchaseReturn {
  id: string
  returnNumber: string
  purchaseId: string
  supplierId: string
  supplierName: string
  accountId: string | null
  accountName: string | null
  userId: string
  userName: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  refundAmount: number
  refundStatus: 'pending' | 'partial' | 'refunded'
  reason: string | null
  notes: string | null
  createdAt: string
  items: PurchaseReturnItem[]
}

export interface DamagedItem {
  id: string
  productId: string
  productName: string
  quantity: number
  reason: string
  batchNumber: string | null
  expiryDate: string | null
  reportedBy: string
  createdAt: string
}

export type TabType = 'sales-returns' | 'purchase-returns' | 'damaged-expired'
