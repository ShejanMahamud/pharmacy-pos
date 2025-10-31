import { AttachMoney, CheckCircle, Receipt, TrendingUp } from '@mui/icons-material'
import { Avatar, Box, Paper, Typography } from '@mui/material'
import { Sale } from '../../types/sale'

interface SalesStatsProps {
  sales: Sale[]
  currencySymbol: string
}

export default function SalesStats({ sales, currencySymbol }: SalesStatsProps): React.JSX.Element {
  // Calculate stats
  const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  const totalTransactions = sales.length
  const completedSales = sales.filter((s) => s.status === 'completed').length
  const avgSaleValue = totalTransactions > 0 ? totalSales / totalTransactions : 0

  const stats = [
    {
      title: 'Total Sales',
      value: `${currencySymbol}${totalSales.toFixed(2)}`,
      subtitle: 'Revenue from all sales',
      icon: <AttachMoney sx={{ color: 'white' }} />,
      color: 'primary.main',
      bgColor: 'primary.main'
    },
    {
      title: 'Transactions',
      value: totalTransactions.toString(),
      subtitle: 'Total number of sales',
      icon: <Receipt sx={{ color: 'white' }} />,
      color: 'primary.light',
      bgColor: 'primary.light'
    },
    {
      title: 'Completed',
      value: completedSales.toString(),
      subtitle: 'Completed sales',
      icon: <CheckCircle sx={{ color: 'white' }} />,
      color: 'secondary.main',
      bgColor: 'secondary.light'
    },
    {
      title: 'Avg Sale Value',
      value: `${currencySymbol}${avgSaleValue.toFixed(2)}`,
      subtitle: 'Average per transaction',
      icon: <TrendingUp sx={{ color: 'white' }} />,
      color: 'warning.main',
      bgColor: 'warning.light'
    }
  ]

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 3
      }}
    >
      {stats.map((stat, index) => (
        <Paper key={index} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                {stat.title}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: stat.color }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {stat.subtitle}
              </Typography>
            </Box>
            <Avatar sx={{ width: 48, height: 48, bgcolor: stat.bgColor, color: stat.color }}>
              {stat.icon}
            </Avatar>
          </Box>
        </Paper>
      ))}
    </Box>
  )
}
