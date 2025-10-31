import { Box, Paper, Typography } from '@mui/material'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { MonthlySale } from '../../types/report'

interface SalesChartProps {
  data: MonthlySale[]
  currencySymbol: string
  title?: string
  barColor?: string
}

export default function SalesChart({
  data,
  currencySymbol,
  title = 'Monthly Sales Performance',
  barColor = '#1976d2'
}: SalesChartProps): React.JSX.Element {
  return (
    <Paper sx={{ mb: 3 }}>
      <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="semibold">
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, 'Revenue']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar dataKey="revenue" fill={barColor} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 300
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No sales data available for the selected period
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  )
}
