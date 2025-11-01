import { Box, Paper, Typography } from '@mui/material'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

interface SalesTrendChartProps {
  data: Array<{ date: string; sales: number; revenue: number }>
  currencySymbol: string
}

export default function SalesTrendChart({
  data,
  currencySymbol
}: SalesTrendChartProps): React.JSX.Element {
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Sales Trend (Last 7 Days)
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2e7d32" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" stroke="#666" style={{ fontSize: '12px' }} tickLine={false} />
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
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? `${currencySymbol}${value.toFixed(2)}` : value,
                  name === 'revenue' ? 'Revenue' : 'Sales Count'
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#1976d2"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
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
            <Typography variant="body2">No sales data available</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  )
}
