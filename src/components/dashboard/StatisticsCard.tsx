import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatisticsCardProps {
  title: string
  value: number | string
  change?: number
  changeType?: 'increase' | 'decrease'
  icon?: ReactNode
  isLoading?: boolean
  description?: string
  valueFormatter?: (value: number | string) => string
  size?: 'default' | 'compact'
}

export function StatisticsCard({
  title,
  value,
  change,
  changeType,
  icon,
  isLoading = false,
  description,
  valueFormatter = (val) => val.toString(),
  size = 'default',
}: StatisticsCardProps) {
  const isCompact = size === 'compact'

  if (isLoading) {
    return (
      <Card>
        <CardHeader className={cn(
          "flex flex-row items-center justify-between space-y-0",
          isCompact ? "pb-1 px-5 pt-5" : "pb-2"
        )}>
          <CardTitle className={cn(
            "font-medium",
            isCompact ? "text-xs" : "text-sm"
          )}>{title}</CardTitle>
          {icon && <div className={cn(
            "text-muted-foreground",
            isCompact ? "h-3 w-3" : "h-5 w-5"
          )}>{icon}</div>}
        </CardHeader>
        <CardContent className={isCompact ? "px-5 pb-5" : undefined}>
          <div className="animate-pulse">
            <div className={cn(
              "bg-muted rounded mb-2",
              isCompact ? "h-6" : "h-8"
            )}></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0",
        isCompact ? "pb-1 px-5 pt-5" : "pb-2"
      )}>
        <CardTitle className={cn(
          "font-medium text-muted-foreground",
          isCompact ? "text-xs truncate pr-1" : "text-sm"
        )}>{title}</CardTitle>
        {icon && <div className={cn(
          "text-muted-foreground",
          isCompact ? "h-3 w-3 flex-shrink-0" : "h-5 w-5"
        )}>{icon}</div>}
      </CardHeader>
      <CardContent className={isCompact ? "px-5 pb-5" : undefined}>
        <div className={cn(
          "font-bold mb-1",
          isCompact ? "text-lg" : "text-2xl"
        )}>
          {valueFormatter(value)}
        </div>

        {(change !== undefined || description) && (
          <div className={cn(
            "text-muted-foreground",
            isCompact ? "text-xs" : "text-xs flex items-center space-x-2 mt-1"
          )}>
            {description && (
              <span className={isCompact ? "block mb-0.5" : ""}>{description}</span>
            )}

            {change !== undefined && (
              <div
                className={cn(
                  'flex items-center space-x-1',
                  changeType === 'increase' && 'text-semantic-success',
                  changeType === 'decrease' && 'text-semantic-error'
                )}
              >
                {changeType === 'increase' ? (
                  <TrendingUp className={isCompact ? "h-2.5 w-2.5" : "h-3 w-3"} />
                ) : changeType === 'decrease' ? (
                  <TrendingDown className={isCompact ? "h-2.5 w-2.5" : "h-3 w-3"} />
                ) : null}
                <span className="text-xs">
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}