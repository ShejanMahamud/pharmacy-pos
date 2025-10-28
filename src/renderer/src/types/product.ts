export interface Product {
  id: string
  name: string
  genericName?: string
  barcode?: string
  sku: string
  categoryId?: string
  supplierId?: string
  description?: string
  manufacturer?: string
  unit: string
  unitsPerPackage?: number
  packageUnit?: string
  shelf: string
  imageUrl?: string
  prescriptionRequired: boolean
  reorderLevel: number
  sellingPrice: number
  costPrice: number
  taxRate: number
  discountPercent: number
  isActive: boolean
}

export interface InventoryItem {
  id: string
  productId: string
  quantity: number
  batchNumber?: string
  expiryDate?: string
}

export interface Category {
  id: string
  name: string
}

export interface Supplier {
  id: string
  name: string
  code: string
}

export interface Unit {
  id: string
  name: string
  abbreviation: string
  type: 'base' | 'package'
}

export interface ProductFormData {
  name: string
  genericName: string
  barcode: string
  sku: string
  categoryId: string
  supplierId: string
  description: string
  manufacturer: string
  unit: string
  unitsPerPackage: number
  packageUnit: string
  shelf: string
  imageUrl: string
  prescriptionRequired: boolean
  reorderLevel: number
  sellingPrice: number
  costPrice: number
  taxRate: number
  discountPercent: number
  stockQuantity: number
}
