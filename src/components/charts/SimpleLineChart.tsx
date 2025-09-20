import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

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

interface SimpleLineChartProps {
  data: ChartDataPoint[]
  lines: LineConfig[]
  isLoading?: boolean
  height?: number
  timeRange: string
  onTimeRangeChange: (range: string) => void
}

const TIME_RANGES = [
  { value: "7d", label: "최근 1주일" },
  { value: "14d", label: "최근 2주일" },
  { value: "30d", label: "최근 한달" },
]

export function SimpleLineChart({
  data,
  lines,
  isLoading = false,
  height = 350,
  timeRange,
  onTimeRangeChange,
}: SimpleLineChartProps) {
  // Create chart config matching shadcn/ui examples
  const chartConfig = lines.reduce((config, line) => {
    const key = line.name.replace(/\s+/g, '')
    config[key] = {
      label: line.name,
      color: line.color,
    }
    return config
  }, {} as ChartConfig)

  // Transform data to match chart config keys
  const chartData = data.map((item) => {
    const transformedItem: any = { date: item.date }
    lines.forEach((line) => {
      const key = line.name.replace(/\s+/g, '')
      transformedItem[key] = item[line.name] || 0
    })
    return transformedItem
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-medium">트렌드 분석</CardTitle>
          <Select value={timeRange} onValueChange={onTimeRangeChange} disabled>
            <SelectTrigger className="w-[130px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="animate-pulse w-full h-full bg-muted rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-medium">트렌드 분석</CardTitle>
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-[130px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <p className="text-sm text-muted-foreground">데이터가 없습니다</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-medium">트렌드 분석</CardTitle>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-[130px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGES.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              left: 12,
              right: 12,
              bottom: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                })
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toLocaleString('ko-KR')}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short',
                    })
                  }}
                />
              }
            />
            {lines.map((line) => {
              const key = line.name.replace(/\s+/g, '')
              return (
                <Line
                  key={key}
                  dataKey={key}
                  type="natural"
                  stroke={`var(--color-${key})`}
                  strokeWidth={2}
                  dot={false}
                />
              )
            })}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}