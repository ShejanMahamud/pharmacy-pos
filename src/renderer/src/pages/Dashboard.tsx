import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'
import { DashboardStats as StatsType, LowStockItem, RecentSale } from '../types/dashboard'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardStats from '../components/dashboard/DashboardStats'
import RecentSalesCard from '../components/dashboard/RecentSalesCard'
import LowStockAlertsCard from '../components/dashboard/LowStockAlertsCard'
import QuickActionsCard from '../components/dashboard/QuickActionsCard'

export default function Dashboard(): React.JSX.Element {
  const user = useAuthStore((state) => state.user)
  const currency = useSettingsStore((state) => state.currency)

  const [stats, setStats] = useState<StatsType>({
    todaySales: 0,
    todayRevenue: 0,
    lowStockCount: 0,
    totalProducts: 0,
    totalCustomers: 0,
    monthlyRevenue: 0
  })
  const [recentSales, setRecentSales] = useState<RecentSale[]>([])
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [loading, setLoading] = useState(true)

  // Get currency symbol
  const getCurrencySymbol = (): string => {
    switch (currency) {
      case 'USD':
        return '$'
      case 'EUR':
        return '€'
      case 'GBP':
        return '£'
      case 'BDT':
        return '৳'
      case 'INR':
        return '₹'
      default:
        return '$'
    }
  }

  useEffect(() => {
    const loadDashboardData = async (): Promise<void> => {
      try {
        setLoading(true)

        // Get all sales first
        const allSales = await window.api.sales.getAll()

        // Filter today's sales
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todaySales = allSales.filter((sale: { createdAt: string }) => {
          const saleDate = new Date(sale.createdAt)
          saleDate.setHours(0, 0, 0, 0)
          return saleDate.getTime() === today.getTime()
        })
        const todayRevenue = todaySales.reduce(
          (sum: number, sale: { totalAmount: number }) => sum + sale.totalAmount,
          0
        )

        // Filter monthly sales
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        firstDayOfMonth.setHours(0, 0, 0, 0)
        const endOfToday = new Date()
        endOfToday.setHours(23, 59, 59, 999)

        const monthlySales = allSales.filter((sale: { createdAt: string }) => {
          const saleDate = new Date(sale.createdAt)
          return saleDate >= firstDayOfMonth && saleDate <= endOfToday
        })
        const monthlyRevenue = monthlySales.reduce(
          (sum: number, sale: { totalAmount: number }) => sum + sale.totalAmount,
          0
        )

        // Load low stock items
        const lowStock = await window.api.inventory.getLowStock()

        // Load products
        const products = await window.api.products.getAll()

        // Load customers
        const customers = await window.api.customers.getAll()

        // Get recent 5 sales
        const recent = allSales.slice(0, 5)

        setStats({
          todaySales: todaySales.length,
          todayRevenue,
          lowStockCount: lowStock.length,
          totalProducts: products.length,
          totalCustomers: customers.length,
          monthlyRevenue
        })

        setRecentSales(recent)
        setLowStockItems(lowStock.slice(0, 5))
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  const currencySymbol = getCurrencySymbol()

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DashboardHeader userName={user?.fullName || 'User'} />

      <DashboardStats stats={stats} currencySymbol={currencySymbol} />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RecentSalesCard sales={recentSales} currencySymbol={currencySymbol} />
        <LowStockAlertsCard items={lowStockItems} currencySymbol={currencySymbol} />
      </div>

      <QuickActionsCard />
    </div>
  )
}
