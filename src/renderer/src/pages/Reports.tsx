import { Box, CircularProgress, Container, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import CustomerReport from '../components/reports/CustomerReport'
import InventoryReport from '../components/reports/InventoryReport'
import OverviewReport from '../components/reports/OverviewReport'
import ReportFilters from '../components/reports/ReportFilters'
import SalesReport from '../components/reports/SalesReport'
import { useSettingsStore } from '../store/settingsStore'
import { ReportData } from '../types/report'

export default function Reports(): React.JSX.Element {
  const currency = useSettingsStore((state) => state.currency)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [dateRange, setDateRange] = useState('30')
  const [reportType, setReportType] = useState('overview')
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
    loadReportData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, reportType])

  const loadReportData = async (): Promise<void> => {
    setLoading(true)
    try {
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(dateRange))

      // Fetch all sales and filter in JavaScript for accuracy
      const allSalesData = await window.api.sales.getAll()

      // Filter sales by date range
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allSales = allSalesData.filter((sale: any) => {
        const saleDate = new Date(sale.createdAt)
        return saleDate >= startDate && saleDate <= endDate
      })

      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      // Load data from database in parallel
      const [salesSummary, topProducts, allCustomers, allProducts, inventoryData] =
        await Promise.all([
          window.api.reports.salesSummary(startDateStr, endDateStr),
          window.api.reports.topProducts(startDateStr, endDateStr, 5),
          window.api.customers.getAll(),
          window.api.products.getAll(),
          window.api.inventory.getAll()
        ])

      // Process inventory data
      const lowStockProducts = inventoryData.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) => item.quantity <= item.reorderLevel && item.quantity > 0
      )
      const outOfStockProducts = inventoryData.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) => item.quantity === 0
      )
      const lowStockItems = lowStockProducts.length
      const outOfStockItems = outOfStockProducts.length

      // Get recent sales (last 5)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recentSales = allSales.slice(0, 5).map((sale: any) => ({
        id: sale.id,
        invoiceNumber: sale.invoiceNumber,
        customerName: sale.customerName || 'Walk-in Customer',
        total: parseFloat(sale.totalAmount || 0),
        date: sale.createdAt
      }))

      // Calculate total revenue directly from sales array
      const totalRevenue = allSales.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sum, sale: any) => sum + parseFloat(sale.totalAmount || 0),
        0
      )
      const totalSalesCount = allSales.length

      // Calculate monthly sales for the last 6 months
      const monthlySalesMap = new Map<string, { revenue: number; sales: number }>()
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ]

      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthlySalesMap.set(monthKey, { revenue: 0, sales: 0 })
      }

      // Aggregate sales by month
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allSales.forEach((sale: any) => {
        const saleDate = new Date(sale.createdAt)
        const monthKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`

        if (monthlySalesMap.has(monthKey)) {
          const current = monthlySalesMap.get(monthKey)!
          current.revenue += parseFloat(sale.totalAmount || 0)
          current.sales += 1
        }
      })

      // Convert to array format
      const monthlySales = Array.from(monthlySalesMap.entries()).map(([key, data]) => {
        const month = key.split('-')[1]
        const monthIndex = parseInt(month) - 1
        return {
          month: monthNames[monthIndex],
          revenue: data.revenue,
          sales: data.sales
        }
      })

      console.log('Sales Summary:', salesSummary)
      console.log('Top Products:', topProducts)
      console.log('All Sales Count:', allSales.length)
      console.log('Total Revenue Calculated:', totalRevenue)
      console.log('First Sale:', allSales[0])
      console.log('Monthly Sales:', monthlySales)

      const reportDataObj: ReportData = {
        totalRevenue: totalRevenue,
        totalSales: totalSalesCount,
        totalCustomers: allCustomers.length,
        totalProducts: allProducts.length,
        lowStockItems,
        outOfStockItems,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lowStockProducts: lowStockProducts.map((item: any) => ({
          id: item.productId,
          name: item.productName,
          quantity: item.quantity,
          reorderLevel: item.reorderLevel
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        outOfStockProducts: outOfStockProducts.map((item: any) => ({
          id: item.productId,
          name: item.productName,
          quantity: item.quantity,
          reorderLevel: item.reorderLevel
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        topSellingProducts: topProducts.map((p: any) => ({
          id: p.productId,
          name: p.productName,
          quantity: parseInt(p.totalQuantity) || 0,
          revenue: parseFloat(p.totalRevenue) || 0
        })),
        recentSales,
        monthlySales
      }

      setReportData(reportDataObj)
    } catch (error) {
      console.error('Failed to load report data:', error)
      toast.error('Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = (): void => {
    toast.success('Report export functionality will be implemented')
  }

  const printReport = (): void => {
    window.print()
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, bgcolor: 'grey.100', minHeight: '100vh' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px'
          }}
        >
          <CircularProgress size={48} />
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Loading reports...
          </Typography>
        </Box>
      </Container>
    )
  }

  if (!reportData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, bgcolor: 'grey.100', minHeight: '100vh' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px'
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No data available
          </Typography>
        </Box>
      </Container>
    )
  }

  const currencySymbol = getCurrencySymbol()

  return (
    <Container maxWidth="xl" sx={{ py: 4, bgcolor: 'grey.100', minHeight: '100vh' }}>
      {/* Page Header */}
      <Box
        sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Reports & Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your pharmacy performance and insights
          </Typography>
        </Box>
      </Box>

      <ReportFilters
        reportType={reportType}
        dateRange={dateRange}
        onReportTypeChange={setReportType}
        onDateRangeChange={setDateRange}
        onPrint={printReport}
        onExport={exportReport}
      />

      {reportType === 'overview' && (
        <OverviewReport
          reportData={reportData}
          currencySymbol={currencySymbol}
          dateRange={dateRange}
        />
      )}
      {reportType === 'sales' && (
        <SalesReport
          reportData={reportData}
          currencySymbol={currencySymbol}
          dateRange={dateRange}
        />
      )}
      {reportType === 'inventory' && <InventoryReport reportData={reportData} />}
      {reportType === 'customer' && (
        <CustomerReport reportData={reportData} currencySymbol={currencySymbol} />
      )}
    </Container>
  )
}
