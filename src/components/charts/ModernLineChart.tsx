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

interface ModernLineChartProps {
  data: ChartDataPoint[]
  lines: LineConfig[]
  title?: string
  description?: string
  isLoading?: boolean
  height?: number
  timeRange: string
  onTimeRangeChange: (range: string) => void
  footerText?: string
  trendIcon?: 'up' | 'down' | 'none'
}

const TIME_RANGES = [
  { value: "7d", label: "최근 1주일" },
  { value: "14d", label: "최근 2주일" },
  { value: "30d", label: "최근 한달" },
]

export function ModernLineChart({
  data,
  lines,
  title = "트렌드 분석",
  description,
  isLoading = false,
  height = 400,
  timeRange,
  onTimeRangeChange,
  footerText,
  trendIcon = 'none',
}: ModernLineChartProps) {
  // Create chart config from lines - use label as key to match data structure
  const chartConfig = lines.reduce((config, line) => {
    config[line.name] = {
      label: line.name,
      color: line.color,
    }
    return config
  }, {} as ChartConfig)

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Select value={timeRange} onValueChange={onTimeRangeChange} disabled>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="animate-pulse w-full">
              <div className="w-full bg-muted rounded" style={{ height: height - 40 }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-[140px]">
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
            <div className="text-center">
              <p className="text-muted-foreground">데이터가 없습니다</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-[140px]">
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
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
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
            {lines.map((line) => (
              <Line
                key={line.name}
                dataKey={line.name}
                type="natural"
                stroke={`var(--color-${line.name})`}
                strokeWidth={line.strokeWidth || 2}
                strokeDasharray={line.strokeDasharray}
                dot={{
                  fill: `var(--color-${line.name})`,
                  strokeWidth: 2,
                  r: 3,
                }}
                activeDot={{
                  r: 5,
                  stroke: `var(--color-${line.name})`,
                  strokeWidth: 2,
                  fill: "white",
                }}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
      {footerText && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            {footerText}
            {trendIcon === 'up' && <TrendingUp className="h-4 w-4" />}
            {trendIcon === 'down' && <TrendingDown className="h-4 w-4" />}
          </div>
          <div className="leading-none text-muted-foreground">
            선택한 기간 동안의 데이터를 보여줍니다
          </div>
        </CardFooter>
      )}
    </Card>
  )
}