import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TrendChartProps {
  title: string
  data: any[]
  isLoading?: boolean
  height?: number
  lines?: {
    dataKey: string
    name: string
    color: string
  }[]
}

export function TrendChart({
  title,
  data,
  isLoading = false,
  height = 300,
  lines = [
    { dataKey: 'newUsers', name: '신규 가입', color: '#FF7200' },
    { dataKey: 'deletedUsers', name: '탈퇴', color: '#FF434B' },
  ],
}: TrendChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-[300px] bg-neutral-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#666' }}
              tickFormatter={(value) => {
                // Format date as MM/DD
                const date = new Date(value)
                return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
                  .getDate()
                  .toString()
                  .padStart(2, '0')}`
              }}
            />
            <YAxis tick={{ fontSize: 12, fill: '#666' }} />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
              labelFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              }}
            />
            <Legend />
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                strokeWidth={2}
                dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: line.color, strokeWidth: 2 }}
                name={line.name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}