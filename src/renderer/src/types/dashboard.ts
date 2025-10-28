export interface RecentSale {
  id: string
  invoiceNumber: string
  customerName?: string
  totalAmount: number
  paymentMethod: string
  status: string
  createdAt: string
}

export interface LowStockItem {
  id: string
  productName: string
  currentStock: number
  minimumStock: number
  unitPrice: number
}

export interface DashboardStats {
  todaySales: number
  todayRevenue: number
  lowStockCount: number
  totalProducts: number
  totalCustomers: number
  monthlyRevenue: number
}
