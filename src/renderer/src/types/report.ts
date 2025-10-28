export interface TopProduct {
  id: string
  name: string
  quantity: number
  revenue: number
}

export interface RecentSale {
  id: string
  invoiceNumber: string
  customerName: string
  total: number
  date: string
}

export interface MonthlySale {
  month: string
  revenue: number
  sales: number
}

export interface ReportData {
  totalRevenue: number
  totalSales: number
  totalCustomers: number
  totalProducts: number
  lowStockItems: number
  outOfStockItems: number
  topSellingProducts: TopProduct[]
  recentSales: RecentSale[]
  monthlySales: MonthlySale[]
}

export interface StatCard {
  label: string
  value: string | number
  sublabel: string
  icon: 'revenue' | 'sales' | 'customers' | 'products' | 'inventory' | 'warning' | 'error'
  color: 'green' | 'blue' | 'purple' | 'orange' | 'yellow' | 'red'
}
