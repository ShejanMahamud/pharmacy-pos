import { CheckCircle, ErrorOutline, Receipt, ShoppingBag } from '@mui/icons-material'
import { Avatar, Box, Paper, Typography } from '@mui/material'

interface PurchaseStatsProps {
  totalPurchases: number
  totalPaid: number
  totalDue: number
  totalTransactions: number
  currencySymbol: string
}

export default function PurchaseStats({
  totalPurchases,
  totalPaid,
  totalDue,
  totalTransactions,
  currencySymbol
}: PurchaseStatsProps): React.JSX.Element {
  const stats = [
    {
      title: 'Total Purchases',
      value: `${currencySymbol}${totalPurchases.toFixed(2)}`,
      subtitle: 'Overall purchase amount',
      icon: <ShoppingBag sx={{ color: 'white' }} />,
      color: 'primary.main',
      bgColor: 'primary.main'
    },
    {
      title: 'Total Paid',
      value: `${currencySymbol}${totalPaid.toFixed(2)}`,
      subtitle: 'Amount paid to suppliers',
      icon: <CheckCircle sx={{ color: 'white' }} />,
      color: 'success.main',
      bgColor: 'success.light'
    },
    {
      title: 'Total Due',
      value: `${currencySymbol}${totalDue.toFixed(2)}`,
      subtitle: 'Outstanding balance',
      icon: <ErrorOutline sx={{ color: 'white' }} />,
      color: 'error.main',
      bgColor: 'error.light'
    },
    {
      title: 'Transactions',
      value: totalTransactions.toString(),
      subtitle: 'Total purchase orders',
      icon: <Receipt sx={{ color: 'white' }} />,
      color: 'secondary.main',
      bgColor: 'secondary.light'
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
