import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface BarChartProps {
  data: any[]
  isLoading?: boolean
  height?: number
  bars?: {
    dataKey: string
    name: string
    color: string
  }[]
  xAxisKey?: string
  showGrid?: boolean
  showLegend?: boolean
}

export function BarChart({
  data,
  isLoading = false,
  height = 300,
  bars = [
    { dataKey: 'value', name: '값', color: '#FF7200' },
  ],
  xAxisKey = 'name',
  showGrid = true,
  showLegend = true,
}: BarChartProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="animate-pulse">
          <div className="w-full bg-muted rounded" style={{ height: height - 40 }}></div>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <p className="text-muted-foreground">데이터가 없습니다</p>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-lg">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString('ko-KR')}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        barCategoryGap="20%"
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12, fill: '#666' }}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#666' }}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend />}

        {bars.map((bar, index) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name}
            fill={bar.color}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}