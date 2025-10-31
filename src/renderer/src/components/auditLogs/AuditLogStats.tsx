import { Analytics, Description, People } from '@mui/icons-material'
import { Avatar, Box, Paper, Typography } from '@mui/material'
import { AuditStats } from '../../types/auditLog'

interface AuditLogStatsProps {
  stats: AuditStats
}

export default function AuditLogStats({ stats }: AuditLogStatsProps): React.JSX.Element {
  const statsData = [
    {
      label: 'Total Logs',
      value: stats.totalLogs,
      subtitle: 'System activities',
      icon: <Description />,
      color: 'primary'
    },
    {
      label: 'Active Users',
      value: stats.userActivity.length,
      subtitle: 'Users with activity',
      icon: <People />,
      color: 'success'
    },
    {
      label: 'Recent Activity',
      value: stats.recentActivity.length,
      subtitle: 'Recent actions',
      icon: <Analytics />,
      color: 'secondary'
    }
  ]

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gap: 3,
        mb: 3
      }}
    >
      {statsData.map((stat, index) => (
        <Paper
          key={index}
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                {stat.label}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  color: `${stat.color}.main`,
                  mb: 0.5
                }}
              >
                {stat.value}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {stat.subtitle}
              </Typography>
            </Box>
            <Avatar
              sx={{
                bgcolor: `${stat.color}.main`,
                width: 48,
                height: 48
              }}
            >
              {stat.icon}
            </Avatar>
          </Box>
        </Paper>
      ))}
    </Box>
  )
}
