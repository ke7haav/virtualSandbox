export interface BenchmarkData {
  instanceId: string;
  config: {
    txCount: number;
    concurrency: number;
    timeout: number;
    demo: boolean;
  };
  serial: BenchmarkResult;
  parallel: BenchmarkResult;
  comparison: {
    tpsImprovement: number;
    latencyImprovement: number;
    gasEfficiency: number;
  };
  timestamp: string;
}

export interface BenchmarkResult {
  mode: "serial" | "parallel";
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalTimeMs: number;
  averageLatencyMs: number;
  tps: number;
  totalGasUsed: bigint;
  averageGasPerTx: bigint;
  errors: string[];
  timestamp: string;
}

export interface InstanceData {
  id: string;
  name: string;
  contractAddress: string;
  status: "initialized" | "deployed" | "running" | "stopped";
  createdAt: string;
  lastActivity: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendLabel?: string;
  loading?: boolean;
}
