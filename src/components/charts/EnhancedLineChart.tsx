import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Brush,
} from 'recharts'
import { Card } from '@/components/ui/card'

interface ChartDataPoint {
  date: string
  [key: string]: number | string
}

interface LineConfig {
  dataKey: string
  name: string
  color: string
  strokeWidth?: number
  strokeDasharray?: string
}

interface EnhancedLineChartProps {
  data: ChartDataPoint[]
  lines: LineConfig[]
  title?: string
  isLoading?: boolean
  height?: number
  showBrush?: boolean
  showGrid?: boolean
  showLegend?: boolean
  enableZoom?: boolean
  yAxisLabel?: string
  xAxisLabel?: string
}

export function EnhancedLineChart({
  data,
  lines,
  title,
  isLoading = false,
  height = 400,
  showBrush = false,
  showGrid = true,
  showLegend = true,
  enableZoom = false,
  yAxisLabel,
  xAxisLabel,
}: EnhancedLineChartProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="animate-pulse">
            <div
              className="w-full bg-muted rounded"
              style={{ height: height - 40 }}
            ></div>
          </div>
        </div>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <p className="text-muted-foreground">데이터가 없습니다</p>
          </div>
        </div>
      </Card>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label)
      const formattedDate = date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      })

      return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-lg">
          <p className="font-medium mb-2">{formattedDate}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.name}:</span>
                </div>
                <span className="font-medium text-sm">
                  {entry.value.toLocaleString('ko-KR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  const formatXAxisLabel = (value: string) => {
    const date = new Date(value)
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    })
  }

  const averageValues = lines.reduce(
    (acc, line) => {
      const sum = data.reduce(
        (lineSum, point) => lineSum + (Number(point[line.dataKey]) || 0),
        0
      )
      acc[line.dataKey] = sum / data.length
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <Card className="p-6" style={{ border: 'none' }}>
      {title && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            {lines.map((line) => (
              <div key={line.dataKey} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: line.color }}
                />
                <span>
                  {line.name} 평균: {averageValues[line.dataKey].toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
        >
          <defs>
            {lines.map((line) => (
              <linearGradient
                key={`gradient-${line.dataKey}`}
                id={`gradient-${line.dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={line.color} stopOpacity={0.1} />
                <stop offset="95%" stopColor={line.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          {showGrid && (
            <CartesianGrid
              strokeDasharray="2 4"
              stroke="#e5e7eb"
              strokeOpacity={0.4}
            />
          )}

          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
            tickFormatter={formatXAxisLabel}
            interval={Math.max(Math.floor(data.length / 8), 0)}
          />

          <YAxis
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
            tickFormatter={(value) => value.toLocaleString('ko-KR')}
            label={
              yAxisLabel
                ? {
                    value: yAxisLabel,
                    angle: -90,
                    position: 'insideLeft',
                    style: {
                      textAnchor: 'middle',
                      fontSize: '12px',
                      fill: '#6b7280',
                    },
                  }
                : undefined
            }
          />

          <Tooltip content={<CustomTooltip />} />

          {showLegend && (
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px',
              }}
            />
          )}

          {/* Average reference lines */}
          {lines.map((line) => (
            <ReferenceLine
              key={`avg-${line.dataKey}`}
              y={averageValues[line.dataKey]}
              stroke={line.color}
              strokeDasharray="1 3"
              strokeOpacity={0.3}
            />
          ))}

          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={line.strokeWidth || 2.5}
              strokeDasharray={line.strokeDasharray}
              dot={{
                fill: line.color,
                strokeWidth: 1.5,
                r: 2.5,
                fillOpacity: 0.9,
              }}
              activeDot={{
                r: 4,
                stroke: line.color,
                strokeWidth: 2,
                fill: '#fff',
                shadow: `0 0 8px ${line.color}`,
              }}
              name={line.name}
              connectNulls={false}
              fill={`url(#gradient-${line.dataKey})`}
            />
          ))}

          {showBrush && (
            <Brush
              dataKey="date"
              height={30}
              stroke="#9ca3af"
              tickFormatter={formatXAxisLabel}
              fill="#f3f4f6"
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {xAxisLabel && (
        <p className="text-center text-sm text-muted-foreground mt-2">
          {xAxisLabel}
        </p>
      )}
    </Card>
  )
}
