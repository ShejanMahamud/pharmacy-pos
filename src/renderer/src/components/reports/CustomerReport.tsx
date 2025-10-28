import { ReportData, StatCard } from '../../types/report'
import RecentSalesList from './RecentSalesList'
import StatsCards from './StatsCards'

interface CustomerReportProps {
  reportData: ReportData
  currencySymbol: string
}

export default function CustomerReport({
  reportData,
  currencySymbol
}: CustomerReportProps): React.JSX.Element {
  const stats: StatCard[] = [
    {
      label: 'Total Customers',
      value: reportData.totalCustomers,
      sublabel: 'Registered customers',
      icon: 'customers',
      color: 'purple'
    },
    {
      label: 'Total Revenue',
      value: `${currencySymbol}${reportData.totalRevenue.toFixed(2)}`,
      sublabel: 'From all customers',
      icon: 'revenue',
      color: 'green'
    },
    {
      label: 'Average Per Customer',
      value: `${currencySymbol}${reportData.totalCustomers > 0 ? (reportData.totalRevenue / reportData.totalCustomers).toFixed(2) : '0.00'}`,
      sublabel: 'Customer lifetime value',
      icon: 'revenue',
      color: 'blue'
    }
  ]

  return (
    <>
      <StatsCards stats={stats} />

      <RecentSalesList
        sales={reportData.recentSales}
        currencySymbol={currencySymbol}
        title="Recent Customer Transactions"
        showCustomerIcon={true}
      />
    </>
  )
}
