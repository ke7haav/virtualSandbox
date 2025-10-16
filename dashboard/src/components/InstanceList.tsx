import React from 'react'
import { 
  Database, 
  Play, 
  Pause, 
  Trash2, 
  ExternalLink, 
  Copy,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { InstanceData } from '../types'

interface InstanceListProps {
  instances: InstanceData[]
  onRefresh: () => void
}

const InstanceList: React.FC<InstanceListProps> = ({ instances, onRefresh }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-success-500" />
      case 'deployed':
        return <Clock className="h-4 w-4 text-warning-500" />
      case 'stopped':
        return <Pause className="h-4 w-4 text-gray-400" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'status-success'
      case 'deployed':
        return 'status-warning'
      case 'stopped':
        return 'status-error'
      default:
        return 'status-info'
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // In a real app, you'd show a toast notification
    console.log('Copied to clipboard:', text)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">EVVM Instances</h2>
        <button
          onClick={onRefresh}
          className="btn-secondary flex items-center space-x-2"
        >
          <Database className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {instances.length === 0 ? (
        <div className="card text-center py-12">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No instances found</h3>
          <p className="text-gray-600 mb-4">
            Create your first EVVM instance to start benchmarking
          </p>
          <button className="btn-primary">
            Create Instance
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {instances.map((instance) => (
            <div key={instance.id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(instance.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{instance.name}</h3>
                    <p className="text-sm text-gray-500">ID: {instance.id.slice(0, 12)}...</p>
                  </div>
                </div>
                <span className={`status-badge ${getStatusColor(instance.status)}`}>
                  {instance.status}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Contract Address
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded flex-1">
                      {formatAddress(instance.contractAddress)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(instance.contractAddress)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Copy address"
                    >
                      <Copy className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Created
                    </label>
                    <p className="text-gray-900 mt-1">{formatDate(instance.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Last Activity
                    </label>
                    <p className="text-gray-900 mt-1">{formatDate(instance.lastActivity)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  {instance.status === 'running' ? (
                    <button className="btn-secondary flex items-center space-x-1">
                      <Pause className="h-4 w-4" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button className="btn-success flex items-center space-x-1">
                      <Play className="h-4 w-4" />
                      <span>Start</span>
                    </button>
                  )}
                  
                  <button className="btn-secondary flex items-center space-x-1">
                    <ExternalLink className="h-4 w-4" />
                    <span>View</span>
                  </button>
                </div>

                <button className="btn-error flex items-center space-x-1">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default InstanceList
