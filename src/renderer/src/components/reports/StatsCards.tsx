import {
  AttachMoney,
  Error,
  Inventory,
  People,
  ShoppingBag,
  TrendingUp,
  Warning
} from '@mui/icons-material'
import { Avatar, Box, Paper, Typography } from '@mui/material'
import { StatCard } from '../../types/report'

interface StatsCardsProps {
  stats: StatCard[]
}

export default function StatsCards({ stats }: StatsCardsProps): React.JSX.Element {
  const getIcon = (iconType: string): React.ReactElement => {
    switch (iconType) {
      case 'revenue':
        return <AttachMoney sx={{ color: 'white' }} />
      case 'sales':
        return <ShoppingBag sx={{ color: 'white' }} />
      case 'customers':
        return <People sx={{ color: 'white' }} />
      case 'products':
      case 'inventory':
        return <Inventory sx={{ color: 'white' }} />
      case 'warning':
        return <Warning sx={{ color: 'white' }} />
      case 'error':
        return <Error sx={{ color: 'white' }} />
      default:
        return <TrendingUp sx={{ color: 'white' }} />
    }
  }

  const getColors = (color: string): { bgColor: string; valueColor: string } => {
    switch (color) {
      case 'green':
        return {
          bgColor: 'success.main',
          valueColor: 'success.main'
        }
      case 'blue':
        return {
          bgColor: 'primary.main',
          valueColor: 'primary.main'
        }
      case 'purple':
        return {
          bgColor: 'secondary.light',
          valueColor: 'secondary.main'
        }
      case 'orange':
        return {
          bgColor: 'warning.light',
          valueColor: 'warning.main'
        }
      case 'yellow':
        return {
          bgColor: 'warning.light',
          valueColor: 'warning.main'
        }
      case 'red':
        return {
          bgColor: 'error.main',
          valueColor: 'error.main'
        }
      default:
        return {
          bgColor: 'grey.500',
          valueColor: 'text.primary'
        }
    }
  }

  const getGridColumns = (): string => {
    const statCount = stats.length
    if (statCount === 4) {
      return 'repeat(4, 1fr)'
    } else if (statCount === 3) {
      return 'repeat(3, 1fr)'
    } else {
      return 'repeat(2, 1fr)'
    }
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: getGridColumns()
        },
        gap: 3,
        mb: 3
      }}
    >
      {stats.map((stat, index) => {
        const colors = getColors(stat.color)
        return (
          <Paper key={index} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  {stat.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: colors.valueColor }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {stat.sublabel}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: colors.bgColor
                }}
              >
                {getIcon(stat.icon)}
              </Avatar>
            </Box>
          </Paper>
        )
      })}
    </Box>
  )
}
