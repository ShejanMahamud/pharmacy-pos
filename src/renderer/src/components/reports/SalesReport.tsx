import { Box } from '@mui/material'
import { ReportData, StatCard } from '../../types/report'
import RecentSalesList from './RecentSalesList'
import SalesChart from './SalesChart'
import StatsCards from './StatsCards'
import TopProductsList from './TopProductsList'

interface SalesReportProps {
  reportData: ReportData
  currencySymbol: string
  dateRange: string
}

export default function SalesReport({
  reportData,
  currencySymbol,
  dateRange
}: SalesReportProps): React.JSX.Element {
  const stats: StatCard[] = [
    {
      label: 'Total Revenue',
      value: `${currencySymbol}${reportData.totalRevenue.toFixed(2)}`,
      sublabel: `Last ${dateRange} days`,
      icon: 'revenue',
      color: 'green'
    },
    {
      label: 'Total Transactions',
      value: reportData.totalSales,
      sublabel: 'Sales count',
      icon: 'sales',
      color: 'blue'
    },
    {
      label: 'Average Sale Value',
      value: `${currencySymbol}${reportData.totalSales > 0 ? (reportData.totalRevenue / reportData.totalSales).toFixed(2) : '0.00'}`,
      sublabel: 'Per transaction',
      icon: 'revenue',
      color: 'purple'
    }
  ]

  return (
    <>
      <StatsCards stats={stats} />

      <SalesChart
        data={reportData.monthlySales}
        currencySymbol={currencySymbol}
        title="Sales Trend"
        barColor="#2e7d32"
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
          gap: 3
        }}
      >
        <TopProductsList products={reportData.topSellingProducts} currencySymbol={currencySymbol} />
        <RecentSalesList
          sales={reportData.recentSales}
          currencySymbol={currencySymbol}
          title="Recent Transactions"
        />
      </Box>
    </>
  )
}
