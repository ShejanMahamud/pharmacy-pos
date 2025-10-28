export interface InventoryItem {
  id: string
  productId: string
  quantity: number
  batchNumber?: string
  expiryDate?: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  genericName?: string
  sku: string
  barcode?: string
  categoryId?: string
  unit: string
  reorderLevel: number
  sellingPrice: number
  costPrice: number
}

export interface Category {
  id: string
  name: string
}

export interface InventoryWithProduct extends InventoryItem {
  product?: Product
}

export interface StockAdjustmentFormData {
  productId: string
  quantity: number
  batchNumber: string
  expiryDate: string
}
