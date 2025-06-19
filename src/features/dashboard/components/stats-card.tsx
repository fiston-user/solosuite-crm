import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
}

export function StatsCard({ title, value, description, icon }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <CardDescription className="text-xs text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  )
}