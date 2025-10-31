import { CheckCircle, Group, MonetizationOn, Stars } from '@mui/icons-material'
import { Avatar, Box, Paper, Typography } from '@mui/material'

interface CustomerStatsProps {
  totalCustomers: number
  activeCustomers: number
  totalLoyaltyPoints: number
  totalPurchaseValue: number
  currencySymbol: string
}

export default function CustomerStats({
  totalCustomers,
  activeCustomers,
  totalLoyaltyPoints,
  totalPurchaseValue,
  currencySymbol
}: CustomerStatsProps) {
  const stats = [
    {
      title: 'Total Customers',
      value: totalCustomers.toString(),
      subtitle: 'Registered customers',
      icon: <Group sx={{ color: 'white' }} />,
      color: 'primary.main',
      bgColor: 'primary.main'
    },
    {
      title: 'Active Customers',
      value: activeCustomers.toString(),
      subtitle: 'Currently active',
      icon: <CheckCircle sx={{ color: 'white' }} />,
      color: 'primary.light',
      bgColor: 'primary.light'
    },
    {
      title: 'Loyalty Points',
      value: totalLoyaltyPoints.toString(),
      subtitle: 'Total points earned',
      icon: <Stars sx={{ color: 'white' }} />,
      color: 'secondary.main',
      bgColor: 'secondary.light'
    },
    {
      title: 'Purchase Value',
      value: `${currencySymbol}${totalPurchaseValue.toFixed(2)}`,
      subtitle: 'Total customer purchases',
      icon: <MonetizationOn sx={{ color: 'white' }} />,
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
