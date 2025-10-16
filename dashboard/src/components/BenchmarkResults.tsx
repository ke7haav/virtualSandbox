import React from 'react'
import { 
  Play, 
  Download, 
  RefreshCw, 
  Zap, 
  Clock, 
  Database,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import BenchmarkChart from './BenchmarkChart'
import { BenchmarkData } from '../types'

interface BenchmarkResultsProps {
  data: BenchmarkData | null
  onRunBenchmark: () => void
  loading: boolean
}

const BenchmarkResults: React.FC<BenchmarkResultsProps> = ({ 
  data, 
  onRunBenchmark, 
  loading 
}) => {
  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    })
  }

  const formatGas = (gas: bigint) => {
    const gasStr = gas.toString()
    if (gasStr.length > 6) {
      return `${(Number(gasStr) / 1000000).toFixed(2)}M`
    } else if (gasStr.length > 3) {
      return `${(Number(gasStr) / 1000).toFixed(2)}K`
    }
    return gasStr
  }

  const getImprovementColor = (improvement: number) => {
    if (improvement > 0) return 'text-success-600'
    if (improvement < 0) return 'text-error-600'
    return 'text-gray-600'
  }

  const getImprovementIcon = (improvement: number) => {
    if (improvement > 0) return <TrendingUp className="h-4 w-4 text-success-500" />
    if (improvement < 0) return <TrendingUp className="h-4 w-4 text-error-500 rotate-180" />
    return <div className="h-4 w-4 bg-gray-400 rounded-full" />
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Benchmark Results</h2>
          <button
            onClick={onRunBenchmark}
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            <Play className="h-4 w-4" />
            <span>Run Benchmark</span>
          </button>
        </div>

        <div className="card text-center py-12">
          <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No benchmark data</h3>
          <p className="text-gray-600 mb-4">
            Run your first benchmark to see performance metrics and comparisons
          </p>
          <button
            onClick={onRunBenchmark}
            disabled={loading}
            className="btn-primary flex items-center space-x-2 mx-auto"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>Run Benchmark</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Benchmark Results</h2>
          <p className="text-gray-600">
            Instance: {data.instanceId} • {new Date(data.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onRunBenchmark}
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>Run New Benchmark</span>
          </button>
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Configuration */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Transactions</label>
            <p className="text-lg font-semibold text-gray-900">{data.config.txCount}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Concurrency</label>
            <p className="text-lg font-semibold text-gray-900">{data.config.concurrency}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Timeout</label>
            <p className="text-lg font-semibold text-gray-900">{data.config.timeout}ms</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Mode</label>
            <p className="text-lg font-semibold text-gray-900">
              {data.config.demo ? 'Demo' : 'Live'}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">TPS Comparison</h3>
          <BenchmarkChart
            data={[
              { name: 'Serial', value: data.serial.tps, color: '#ef4444' },
              { name: 'Parallel', value: data.parallel.tps, color: '#22c55e' },
            ]}
            type="bar"
            height={250}
          />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Latency Comparison</h3>
          <BenchmarkChart
            data={[
              { name: 'Serial', value: data.serial.averageLatencyMs, color: '#ef4444' },
              { name: 'Parallel', value: data.parallel.averageLatencyMs, color: '#22c55e' },
            ]}
            type="bar"
            height={250}
          />
        </div>
      </div>

      {/* Detailed Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Serial Results */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Serial Execution</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Transactions</label>
                <p className="text-2xl font-bold text-gray-900">{data.serial.totalTransactions}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Success Rate</label>
                <p className="text-2xl font-bold text-gray-900">
                  {((data.serial.successfulTransactions / data.serial.totalTransactions) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">TPS</label>
                <p className="text-xl font-semibold text-gray-900">
                  {formatNumber(data.serial.tps)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Avg Latency</label>
                <p className="text-xl font-semibold text-gray-900">
                  {formatNumber(data.serial.averageLatencyMs)}ms
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Total Gas</label>
                <p className="text-lg font-semibold text-gray-900">
                  {formatGas(data.serial.totalGasUsed)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gas per Tx</label>
                <p className="text-lg font-semibold text-gray-900">
                  {formatGas(data.serial.averageGasPerTx)}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Total Time</label>
              <p className="text-lg font-semibold text-gray-900">
                {formatNumber(data.serial.totalTimeMs)}ms
              </p>
            </div>

            {data.serial.errors.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">Errors</label>
                <div className="mt-1 space-y-1">
                  {data.serial.errors.slice(0, 3).map((error, index) => (
                    <p key={index} className="text-sm text-error-600 bg-error-50 p-2 rounded">
                      {error}
                    </p>
                  ))}
                  {data.serial.errors.length > 3 && (
                    <p className="text-sm text-gray-500">
                      +{data.serial.errors.length - 3} more errors
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Parallel Results */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Parallel Execution</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Transactions</label>
                <p className="text-2xl font-bold text-gray-900">{data.parallel.totalTransactions}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Success Rate</label>
                <p className="text-2xl font-bold text-gray-900">
                  {((data.parallel.successfulTransactions / data.parallel.totalTransactions) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">TPS</label>
                <p className="text-xl font-semibold text-gray-900">
                  {formatNumber(data.parallel.tps)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Avg Latency</label>
                <p className="text-xl font-semibold text-gray-900">
                  {formatNumber(data.parallel.averageLatencyMs)}ms
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Total Gas</label>
                <p className="text-lg font-semibold text-gray-900">
                  {formatGas(data.parallel.totalGasUsed)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gas per Tx</label>
                <p className="text-lg font-semibold text-gray-900">
                  {formatGas(data.parallel.averageGasPerTx)}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Total Time</label>
              <p className="text-lg font-semibold text-gray-900">
                {formatNumber(data.parallel.totalTimeMs)}ms
              </p>
            </div>

            {data.parallel.errors.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">Errors</label>
                <div className="mt-1 space-y-1">
                  {data.parallel.errors.slice(0, 3).map((error, index) => (
                    <p key={index} className="text-sm text-error-600 bg-error-50 p-2 rounded">
                      {error}
                    </p>
                  ))}
                  {data.parallel.errors.length > 3 && (
                    <p className="text-sm text-gray-500">
                      +{data.parallel.errors.length - 3} more errors
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Improvements */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Improvements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              {getImprovementIcon(data.comparison.tpsImprovement)}
              <span className={`text-2xl font-bold ${getImprovementColor(data.comparison.tpsImprovement)}`}>
                {data.comparison.tpsImprovement > 0 ? '+' : ''}{data.comparison.tpsImprovement.toFixed(1)}%
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900">TPS Improvement</p>
            <p className="text-xs text-gray-500">Parallel vs Serial</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              {getImprovementIcon(data.comparison.latencyImprovement)}
              <span className={`text-2xl font-bold ${getImprovementColor(data.comparison.latencyImprovement)}`}>
                {data.comparison.latencyImprovement > 0 ? '+' : ''}{data.comparison.latencyImprovement.toFixed(1)}%
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900">Latency Improvement</p>
            <p className="text-xs text-gray-500">Faster execution</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Database className="h-5 w-5 text-gray-600" />
              <span className="text-2xl font-bold text-gray-900">
                {data.comparison.gasEfficiency.toFixed(2)}x
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900">Gas Efficiency</p>
            <p className="text-xs text-gray-500">Serial vs Parallel</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BenchmarkResults
