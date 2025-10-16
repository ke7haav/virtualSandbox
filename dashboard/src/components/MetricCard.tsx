import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { MetricCardProps } from '../types'

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  loading = false
}) => {
  const isPositiveTrend = trend?.startsWith('+')
  const isNegativeTrend = trend?.startsWith('-')

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Icon className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                value
              )}
            </p>
          </div>
        </div>
        
        {trend && trendLabel && !loading && (
          <div className="flex items-center space-x-1">
            {isPositiveTrend ? (
              <TrendingUp className="h-4 w-4 text-success-500" />
            ) : isNegativeTrend ? (
              <TrendingDown className="h-4 w-4 text-error-500" />
            ) : (
              <div className="h-4 w-4 bg-gray-400 rounded-full" />
            )}
            <div className="text-right">
              <p className={`text-sm font-medium ${
                isPositiveTrend ? 'text-success-600' : 
                isNegativeTrend ? 'text-error-600' : 
                'text-gray-600'
              }`}>
                {trend}
              </p>
              <p className="text-xs text-gray-500">{trendLabel}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MetricCard
