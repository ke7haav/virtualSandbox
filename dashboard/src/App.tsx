import React, { useState, useEffect } from 'react'
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  Clock, 
  Database, 
  Settings,
  Play,
  RefreshCw,
  BarChart3,
  Cpu,
  Layers
} from 'lucide-react'
import BenchmarkChart from './components/BenchmarkChart'
import MetricCard from './components/MetricCard'
import InstanceList from './components/InstanceList'
import BenchmarkResults from './components/BenchmarkResults'
import { BenchmarkData, InstanceData } from './types'

function App() {
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null)
  const [instances, setInstances] = useState<InstanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'instances' | 'benchmarks'>('overview')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load benchmark results
      const response = await fetch('/src/data/benchmark-results.json')
      if (response.ok) {
        const data = await response.json()
        setBenchmarkData(data)
      }
      
      // Load instances (mock data for now)
      const mockInstances: InstanceData[] = [
        {
          id: 'evvm-1703123456789-abc123def',
          name: 'test-instance',
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
          status: 'deployed',
          createdAt: '2024-01-01T00:00:00Z',
          lastActivity: '2024-01-01T12:00:00Z',
        },
        {
          id: 'evvm-1703123456790-def456ghi',
          name: 'demo-instance',
          contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
          status: 'running',
          createdAt: '2024-01-01T01:00:00Z',
          lastActivity: '2024-01-01T13:00:00Z',
        }
      ]
      setInstances(mockInstances)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const runBenchmark = async () => {
    setLoading(true)
    try {
      // In a real implementation, this would call the Hardhat plugin API
      console.log('Running benchmark...')
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      await loadData()
    } catch (error) {
      console.error('Failed to run benchmark:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !benchmarkData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Layers className="h-8 w-8 text-primary-600" />
                <h1 className="text-xl font-bold text-gray-900">Virtual Chain Sandbox</h1>
              </div>
              <span className="text-sm text-gray-500">Parallel Executor Tester</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={runBenchmark}
                disabled={loading}
                className="btn-primary flex items-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>Run Benchmark</span>
              </button>
              
              <button
                onClick={loadData}
                disabled={loading}
                className="btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'instances', label: 'Instances', icon: Database },
              { id: 'benchmarks', label: 'Benchmarks', icon: Cpu },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Instances"
                value={instances.length.toString()}
                icon={Database}
                trend="+2"
                trendLabel="this week"
              />
              <MetricCard
                title="Active Benchmarks"
                value={benchmarkData ? '1' : '0'}
                icon={Activity}
                trend="+1"
                trendLabel="today"
              />
              <MetricCard
                title="Avg TPS (Parallel)"
                value={benchmarkData ? benchmarkData.parallel.tps.toFixed(2) : '0'}
                icon={Zap}
                trend="+15%"
                trendLabel="vs serial"
              />
              <MetricCard
                title="Latency Improvement"
                value={benchmarkData ? `${benchmarkData.comparison.latencyImprovement.toFixed(1)}%` : '0%'}
                icon={TrendingUp}
                trend="+25%"
                trendLabel="vs serial"
              />
            </div>

            {/* Charts */}
            {benchmarkData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">TPS Comparison</h3>
                  <BenchmarkChart
                    data={[
                      { name: 'Serial', value: benchmarkData.serial.tps, color: '#ef4444' },
                      { name: 'Parallel', value: benchmarkData.parallel.tps, color: '#22c55e' },
                    ]}
                    type="bar"
                  />
                </div>
                
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Latency Comparison</h3>
                  <BenchmarkChart
                    data={[
                      { name: 'Serial', value: benchmarkData.serial.averageLatencyMs, color: '#ef4444' },
                      { name: 'Parallel', value: benchmarkData.parallel.averageLatencyMs, color: '#22c55e' },
                    ]}
                    type="bar"
                  />
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {instances.slice(0, 3).map((instance) => (
                  <div key={instance.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        instance.status === 'running' ? 'bg-success-500' :
                        instance.status === 'deployed' ? 'bg-warning-500' :
                        'bg-gray-400'
                      }`} />
                      <span className="text-sm font-medium text-gray-900">{instance.name}</span>
                      <span className="text-xs text-gray-500">{instance.contractAddress.slice(0, 10)}...</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(instance.lastActivity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'instances' && (
          <InstanceList instances={instances} onRefresh={loadData} />
        )}

        {activeTab === 'benchmarks' && (
          <BenchmarkResults 
            data={benchmarkData} 
            onRunBenchmark={runBenchmark}
            loading={loading}
          />
        )}
      </main>
    </div>
  )
}

export default App
