import { ReportData, StatCard } from '../../types/report'
import InventoryAlerts from './InventoryAlerts'
import StatsCards from './StatsCards'

interface InventoryReportProps {
  reportData: ReportData
}

export default function InventoryReport({ reportData }: InventoryReportProps): React.JSX.Element {
  const stats: StatCard[] = [
    {
      label: 'Total Products',
      value: reportData.totalProducts,
      sublabel: 'In inventory',
      icon: 'inventory',
      color: 'blue'
    },
    {
      label: 'Low Stock Items',
      value: reportData.lowStockItems,
      sublabel: 'Need restocking',
      icon: 'warning',
      color: 'yellow'
    },
    {
      label: 'Out of Stock',
      value: reportData.outOfStockItems,
      sublabel: 'Require immediate action',
      icon: 'error',
      color: 'red'
    }
  ]

  return (
    <>
      <StatsCards stats={stats} />

      <InventoryAlerts
        lowStockCount={reportData.lowStockItems}
        outOfStockCount={reportData.outOfStockItems}
      />
    </>
  )
}
