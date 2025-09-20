import { TrendingUp, TrendingDown } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

interface BeautifulLineChartProps {
  data: ChartDataPoint[]
  lines: LineConfig[]
  title?: string
  description?: string
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

export function BeautifulLineChart({
  data,
  lines,
  title = "트렌드 분석",
  description = "선택한 지표의 시간별 변화 추이",
  isLoading = false,
  height = 350,
  timeRange,
  onTimeRangeChange,
}: BeautifulLineChartProps) {
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

  // Calculate trend
  const calculateTrend = () => {
    if (chartData.length < 2) return { percentage: 0, isPositive: true }

    const firstWeek = chartData.slice(0, Math.ceil(chartData.length / 2))
    const secondWeek = chartData.slice(Math.ceil(chartData.length / 2))

    const firstWeekAvg = firstWeek.reduce((acc, item) => {
      lines.forEach((line) => {
        const key = line.name.replace(/\s+/g, '')
        acc += item[key] || 0
      })
      return acc
    }, 0) / (firstWeek.length * lines.length)

    const secondWeekAvg = secondWeek.reduce((acc, item) => {
      lines.forEach((line) => {
        const key = line.name.replace(/\s+/g, '')
        acc += item[key] || 0
      })
      return acc
    }, 0) / (secondWeek.length * lines.length)

    const percentage = ((secondWeekAvg - firstWeekAvg) / firstWeekAvg) * 100
    return { percentage: Math.abs(percentage), isPositive: percentage >= 0 }
  }

  const trend = calculateTrend()

  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Select value={timeRange} onValueChange={onTimeRangeChange} disabled>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
          </Select>
        </CardHeader>
        <CardContent className="pb-0">
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="animate-pulse w-full h-full bg-muted rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="@container/card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value} className="text-xs">
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="pb-0">
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">데이터가 없습니다</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:inline">{description}</span>
            <span className="@[540px]/card:hidden">시간별 추이</span>
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGES.map((range) => (
              <SelectItem key={range.value} value={range.value} className="text-xs">
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 24,
              left: 24,
              right: 24,
              bottom: 24,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-muted"
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                })
              }}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toLocaleString('ko-KR')}
              className="text-xs"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[180px] bg-background border shadow-lg"
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
                  strokeWidth={2.5}
                  strokeDasharray={line.strokeDasharray}
                  dot={false}
                  activeDot={{
                    r: 4,
                    strokeWidth: 2,
                    className: "fill-background stroke-current",
                  }}
                />
              )
            })}
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-sm pt-4">
        <div className="flex gap-2 font-medium leading-none items-center">
          {trend.isPositive ? '증가' : '감소'} {trend.percentage.toFixed(1)}% 이번 기간
          {trend.isPositive ? (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          {TIME_RANGES.find(r => r.value === timeRange)?.label} 데이터를 표시합니다
        </div>
      </CardFooter>
    </Card>
  )
}