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
  barColor = '#3b82f6'
}: SalesChartProps): React.JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">
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
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <p>No sales data available for the selected period</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
