import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

interface PieChartData {
  name: string
  value: number
  color: string
  iconPath?: string
}

interface PieChartProps {
  data: PieChartData[]
  isLoading?: boolean
  height?: number
  showLegend?: boolean
  centerLabel?: string
  centerValue?: string
  centerLabelOffset?: number
}

const COLORS = [
  '#FF7200', // primary-500
  '#FF9A3E', // primary-400
  '#FFB366', // primary-300
  '#FFCC8E', // primary-200
  '#FFE6B6', // primary-100
  '#F59E0B', // amber-500
]

export function PieChart({
  data,
  isLoading = false,
  height = 300,
  showLegend = true,
  centerLabel,
  centerValue,
  centerLabelOffset = -1.3,
}: PieChartProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="animate-pulse">
          <div className="w-48 h-48 bg-muted rounded-full"></div>
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

  const total = data.reduce((sum, item) => sum + item.value, 0)

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex justify-center gap-4 mt-4">
        {payload?.map((entry: any, index: number) => {
          const item = data.find(d => d.name === entry.value)
          return (
            <div key={index} className="flex items-center gap-1.5">
              {item?.iconPath ? (
                <img
                  src={item.iconPath}
                  alt={item.name}
                  className="w-3 h-3"
                />
              ) : (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
              )}
              <span className="text-xs text-gray-600">{entry.value}</span>
            </div>
          )
        })}
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / total) * 100).toFixed(1)
      return (
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value.toLocaleString('ko-KR')}건 ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ height, width: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={centerLabel ? 60 : 0}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          {centerLabel && (
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-900"
            >
              <tspan x="50%" dy={`${centerLabelOffset}em`} className="text-sm font-medium">
                {centerLabel}
              </tspan>
              <tspan x="50%" dy="1.2em" className="text-lg font-bold">
                {centerValue}
              </tspan>
            </text>
          )}

          <Tooltip content={<CustomTooltip />} />

          {showLegend && (
            <Legend
              content={<CustomLegend />}
              verticalAlign="bottom"
              height={36}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}
