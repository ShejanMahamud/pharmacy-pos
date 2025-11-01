import { Box } from '@mui/material'
import { ReportData, StatCard } from '../../types/report'
import InventoryAlerts from './InventoryAlerts'
import RecentSalesList from './RecentSalesList'
import SalesChart from './SalesChart'
import StatsCards from './StatsCards'
import TopProductsList from './TopProductsList'

interface OverviewReportProps {
  reportData: ReportData
  currencySymbol: string
  dateRange: string
}

export default function OverviewReport({
  reportData,
  currencySymbol,
  dateRange
}: OverviewReportProps): React.JSX.Element {
  const stats: StatCard[] = [
    {
      label: 'Total Revenue',
      value: `${currencySymbol}${reportData.totalRevenue.toFixed(2)}`,
      sublabel: `Last ${dateRange} days`,
      icon: 'revenue',
      color: 'green'
    },
    {
      label: 'Total Sales',
      value: reportData.totalSales,
      sublabel: 'Transactions',
      icon: 'sales',
      color: 'blue'
    },
    {
      label: 'Total Customers',
      value: reportData.totalCustomers,
      sublabel: 'Registered',
      icon: 'customers',
      color: 'purple'
    },
    {
      label: 'Total Products',
      value: reportData.totalProducts,
      sublabel: `${reportData.lowStockItems} low stock`,
      icon: 'products',
      color: 'orange'
    }
  ]

  return (
    <>
      <StatsCards stats={stats} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
          gap: 3,
          mb: 3
        }}
      >
        <TopProductsList products={reportData.topSellingProducts} currencySymbol={currencySymbol} />
        <RecentSalesList sales={reportData.recentSales} currencySymbol={currencySymbol} />
      </Box>

      <SalesChart data={reportData.monthlySales} currencySymbol={currencySymbol} />

      <InventoryAlerts
        lowStockCount={reportData.lowStockItems}
        outOfStockCount={reportData.outOfStockItems}
        lowStockProducts={reportData.lowStockProducts}
        outOfStockProducts={reportData.outOfStockProducts}
      />
    </>
  )
}
