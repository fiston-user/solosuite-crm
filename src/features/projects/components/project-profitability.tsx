'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc'
import { DollarSign, TrendingUp, TrendingDown, Clock, Receipt } from 'lucide-react'

interface ProjectProfitabilityProps {
  projectId: string
}

export function ProjectProfitability({ projectId }: ProjectProfitabilityProps) {
  const { data: profitability, isLoading } = trpc.project.getProfitability.useQuery({ id: projectId })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Profitability</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!profitability) {
    return null
  }

  const formatHours = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-green-600'
    if (profit < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getProfitIcon = (profit: number) => {
    if (profit > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (profit < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <DollarSign className="h-4 w-4 text-gray-500" />
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Project Profitability
          </CardTitle>
          <CardDescription>
            Financial overview for {profitability.project.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                  <div>
                    <p className="text-lg font-bold text-blue-700">
                      ${profitability.profitability.totalRevenue.toFixed(2)}
                    </p>
                    <p className="text-xs text-blue-600">Total Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingDown className="h-4 w-4 text-orange-500 mr-2" />
                  <div>
                    <p className="text-lg font-bold text-orange-700">
                      ${profitability.profitability.totalCosts.toFixed(2)}
                    </p>
                    <p className="text-xs text-orange-600">Total Costs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${profitability.profitability.profit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <CardContent className="p-4">
                <div className="flex items-center">
                  {getProfitIcon(profitability.profitability.profit)}
                  <div className="ml-2">
                    <p className={`text-lg font-bold ${getProfitColor(profitability.profitability.profit)}`}>
                      ${profitability.profitability.profit.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600">Net Profit</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="h-4 w-4 bg-gray-500 rounded mr-2" />
                  <div>
                    <p className={`text-lg font-bold ${getProfitColor(profitability.profitability.profit)}`}>
                      {profitability.profitability.profitMargin.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-600">Profit Margin</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Time & Revenue */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time & Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Hours:</span>
                  <Badge variant="secondary">
                    {formatHours(profitability.timeMetrics.totalHours)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hourly Rate:</span>
                  <span className="font-medium">${profitability.timeMetrics.hourlyRate}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Time Revenue:</span>
                  <span className="font-medium">${profitability.timeMetrics.timeRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Billable Expenses:</span>
                  <span className="font-medium">${profitability.expenseMetrics.billableExpenses.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Expenses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Business Expenses:</span>
                  <span className="font-medium text-red-600">
                    ${profitability.expenseMetrics.businessExpenses.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Reimbursable:</span>
                  <span className="font-medium text-blue-600">
                    ${profitability.expenseMetrics.reimbursableExpenses.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Billable to Client:</span>
                  <span className="font-medium text-green-600">
                    ${profitability.expenseMetrics.billableExpenses.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Total Expenses:</span>
                  <span className="font-medium">${profitability.expenseMetrics.totalExpenses.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profitability Status */}
          <div className="mt-6">
            <Card className={`${profitability.profitability.profit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <CardContent className="p-4">
                <div className="text-center">
                  {profitability.profitability.profit >= 0 ? (
                    <div>
                      <p className="text-green-700 font-medium">✅ This project is profitable!</p>
                      <p className="text-sm text-green-600 mt-1">
                        Profit margin of {profitability.profitability.profitMargin.toFixed(1)}% with ${profitability.profitability.profit.toFixed(2)} net profit
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-red-700 font-medium">⚠️ This project is running at a loss</p>
                      <p className="text-sm text-red-600 mt-1">
                        Loss of ${Math.abs(profitability.profitability.profit).toFixed(2)} - consider reviewing costs or rates
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}