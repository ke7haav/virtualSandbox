// Simple Hardhat 3 plugin for testing
import { extendEnvironment } from "hardhat/config";

// Extend Hardhat's runtime environment
extendEnvironment((hre) => {
  hre.evvm = {
    // EVVM configuration
    sepoliaContract: "0xF817e9ad82B4a19F00dA7A248D9e556Ba96e6366",
    mateStakingContract: "0x8eB2525239781e06dBDbd95d83c957C431CF2321",
    nameServiceContract: "0x8038e87dc67D87b31d890FD01E855a8517ebfD24",
    faucetUrl: "https://evvm.dev",
    
    // Arcology configuration
    arcologyRpcUrl: "https://devnet.arcology.network",
    
    // Benchmark configuration
    defaultTxCount: 100,
    defaultConcurrency: 4,
    defaultTimeout: 30000,
  };
});

// Export types for external use
export interface EVVMConfig {
  sepoliaContract: string;
  mateStakingContract: string;
  nameServiceContract: string;
  faucetUrl: string;
  arcologyRpcUrl: string;
  defaultTxCount: number;
  defaultConcurrency: number;
  defaultTimeout: number;
}

export interface BenchmarkResult {
  mode: "serial" | "parallel" | "evvm-async";
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

export interface EVVMInstance {
  id: string;
  name: string;
  contractAddress: string;
  status: "initialized" | "deployed" | "running" | "stopped";
  createdAt: string;
  lastActivity: string;
}

// Extend HardhatRuntimeEnvironment type
declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    evvm: EVVMConfig;
  }
}
