import { Add, BarChart, PersonAdd, ShoppingCart } from '@mui/icons-material'
import { Avatar, Box, ButtonBase, Card, CardContent, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

export default function QuickActionsCard(): React.JSX.Element {
  const actions = [
    {
      to: '/pos',
      label: 'New Sale',
      icon: ShoppingCart,
      color: '#2196f3',
      bgColor: '#e3f2fd',
      hoverBg: '#bbdefb'
    },
    {
      to: '/products',
      label: 'Add Product',
      icon: Add,
      color: '#4caf50',
      bgColor: '#e8f5e9',
      hoverBg: '#c8e6c9'
    },
    {
      to: '/customers',
      label: 'Add Customer',
      icon: PersonAdd,
      color: '#9c27b0',
      bgColor: '#f3e5f5',
      hoverBg: '#e1bee7'
    },
    {
      to: '/reports',
      label: 'View Reports',
      icon: BarChart,
      color: '#ff9800',
      bgColor: '#fff3e0',
      hoverBg: '#ffe0b2'
    }
  ]

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        border: '1px solid #e0e0e0'
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Quick Actions
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 2
          }}
        >
          {actions.map((action) => (
            <ButtonBase
              key={action.to}
              component={Link}
              to={action.to}
              sx={{
                borderRadius: 2,
                border: '2px solid #e0e0e0',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: action.color,
                  bgcolor: action.bgColor,
                  '& .action-avatar': {
                    bgcolor: action.hoverBg
                  },
                  '& .action-label': {
                    color: action.color
                  }
                }
              }}
            >
              <Avatar
                className="action-avatar"
                sx={{
                  bgcolor: action.bgColor,
                  width: 56,
                  height: 56,
                  mb: 2,
                  transition: 'background-color 0.2s'
                }}
              >
                <action.icon sx={{ color: action.color, fontSize: 28 }} />
              </Avatar>
              <Typography
                className="action-label"
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: 'text.primary',
                  transition: 'color 0.2s'
                }}
              >
                {action.label}
              </Typography>
            </ButtonBase>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}
