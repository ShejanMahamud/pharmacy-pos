import { CheckCircle, Email, Group, Receipt } from '@mui/icons-material'
import { Avatar, Box, Paper, Typography } from '@mui/material'
import { Supplier } from '../../types/supplier'

interface SupplierStatsProps {
  suppliers: Supplier[]
}

export default function SupplierStats({ suppliers }: SupplierStatsProps): React.JSX.Element {
  const totalSuppliers = suppliers.length
  const activeSuppliers = suppliers.filter((s) => s.isActive).length
  const withEmail = suppliers.filter((s) => s.email).length
  const withTaxId = suppliers.filter((s) => s.taxNumber).length

  const stats = [
    {
      title: 'Total Suppliers',
      value: totalSuppliers.toString(),
      subtitle: 'All registered suppliers',
      icon: <Group sx={{ color: 'white' }} />,
      color: 'primary.main',
      bgColor: 'primary.main'
    },
    {
      title: 'Active Suppliers',
      value: activeSuppliers.toString(),
      subtitle: 'Currently active',
      icon: <CheckCircle sx={{ color: 'white' }} />,
      color: 'success.main',
      bgColor: 'success.light'
    },
    {
      title: 'With Email',
      value: withEmail.toString(),
      subtitle: 'Email configured',
      icon: <Email sx={{ color: 'white' }} />,
      color: 'secondary.main',
      bgColor: 'secondary.light'
    },
    {
      title: 'With Tax ID',
      value: withTaxId.toString(),
      subtitle: 'Tax number registered',
      icon: <Receipt sx={{ color: 'white' }} />,
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
