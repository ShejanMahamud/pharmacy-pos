import { AttachMoney, Close, Inventory, Warning } from '@mui/icons-material'
import { Avatar, Box, Paper, Typography } from '@mui/material'

interface InventoryStatsProps {
  totalItems: number
  lowStockCount: number
  outOfStockCount: number
  totalValue: number
  currencySymbol: string
}

export default function InventoryStats({
  totalItems,
  lowStockCount,
  outOfStockCount,
  totalValue,
  currencySymbol
}: InventoryStatsProps) {
  const stats = [
    {
      title: 'Total Items',
      value: totalItems,
      icon: <Inventory sx={{ color: 'white' }} />,
      color: 'primary.main',
      bgColor: 'primary.light'
    },
    {
      title: 'Low Stock',
      value: lowStockCount,
      icon: <Warning sx={{ color: 'white' }} />,
      color: 'warning.main',
      bgColor: 'warning.light'
    },
    {
      title: 'Out of Stock',
      value: outOfStockCount,
      icon: <Close sx={{ color: 'white' }} />,
      color: 'error.main',
      bgColor: 'error.light'
    },
    {
      title: 'Total Value',
      value: `${currencySymbol}${totalValue.toFixed(2)}`,
      icon: <AttachMoney sx={{ color: 'white' }} />,
      color: 'success.main',
      bgColor: 'success.light'
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
