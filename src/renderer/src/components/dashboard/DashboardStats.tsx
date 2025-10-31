import {
  Assignment,
  AttachMoney,
  Inventory,
  People,
  TrendingUp,
  Warning
} from '@mui/icons-material'
import { Avatar, Box, Card, CardContent, Typography } from '@mui/material'
import { DashboardStats as StatsType } from '../../types/dashboard'

interface DashboardStatsProps {
  stats: StatsType
  currencySymbol: string
}

export default function DashboardStats({
  stats,
  currencySymbol
}: DashboardStatsProps): React.JSX.Element {
  const statsCards = [
    {
      title: "Today's Sales",
      value: stats.todaySales,
      subtitle: 'Transactions today',
      icon: Assignment,
      color: '#2196f3',
      bgColor: '#e3f2fd'
    },
    {
      title: "Today's Revenue",
      value: `${currencySymbol}${stats.todayRevenue.toFixed(2)}`,
      subtitle: 'Revenue generated today',
      icon: AttachMoney,
      color: '#4caf50',
      bgColor: '#e8f5e9'
    },
    {
      title: 'Monthly Revenue',
      value: `${currencySymbol}${stats.monthlyRevenue.toFixed(2)}`,
      subtitle: 'Total for this month',
      icon: TrendingUp,
      color: '#9c27b0',
      bgColor: '#f3e5f5'
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockCount,
      subtitle: 'Items need restocking',
      icon: Warning,
      color: '#f44336',
      bgColor: '#ffebee'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      subtitle: 'Products in inventory',
      icon: Inventory,
      color: '#ff9800',
      bgColor: '#fff3e0'
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      subtitle: 'Registered customers',
      icon: People,
      color: '#3f51b5',
      bgColor: '#e8eaf6'
    }
  ]

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
        gap: 3,
        mb: 3
      }}
    >
      {statsCards.map((card, index) => (
        <Card
          key={index}
          sx={{
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            border: '1px solid #e0e0e0'
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {card.title}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mt: 1,
                    color: card.color
                  }}
                >
                  {card.value}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {card.subtitle}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  bgcolor: card.bgColor,
                  width: 56,
                  height: 56
                }}
              >
                <card.icon sx={{ color: card.color, fontSize: 28 }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}
