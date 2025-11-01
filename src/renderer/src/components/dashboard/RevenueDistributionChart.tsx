import { Box, Paper, Typography } from '@mui/material'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

interface RevenueDistributionChartProps {
  data: Array<{ category: string; revenue: number; color: string }>
  currencySymbol: string
}

export default function RevenueDistributionChart({
  data,
  currencySymbol
}: RevenueDistributionChartProps): React.JSX.Element {
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Product Value by Category
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="category"
                stroke="#666"
                style={{ fontSize: '12px' }}
                tickLine={false}
              />
              <YAxis
                stroke="#666"
                style={{ fontSize: '12px' }}
                tickLine={false}
                tickFormatter={(value) => `${currencySymbol}${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
                formatter={(value: number) => [
                  `${currencySymbol}${value.toFixed(2)}`,
                  'Product Value'
                ]}
              />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary'
            }}
          >
            <Typography variant="body2">No data available</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  )
}
