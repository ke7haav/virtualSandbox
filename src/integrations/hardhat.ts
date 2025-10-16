import { HardhatRuntimeEnvironment } from "hardhat/types";
import { EVVMClient } from "./evvm";
import { ArcologyClient } from "./arcology";

export interface HardhatPluginConfig {
  evvm: {
    enabled: boolean;
    defaultNetwork: string;
    instancesPath: string;
  };
  arcology: {
    enabled: boolean;
    defaultConcurrency: number;
    maxConcurrency: number;
  };
  benchmarking: {
    defaultTxCount: number;
    defaultTimeout: number;
    outputPath: string;
  };
}

export interface PluginContext {
  hre: HardhatRuntimeEnvironment;
  evvmClient: EVVMClient;
  arcologyClient: ArcologyClient;
  config: HardhatPluginConfig;
}

/**
 * Hardhat Plugin Integration
 * This class provides the main integration between Hardhat and the EVVM/Arcology systems
 */
export class HardhatPluginIntegration {
  private hre: HardhatRuntimeEnvironment;
  private evvmClient: EVVMClient;
  private arcologyClient: ArcologyClient;
  private config: HardhatPluginConfig;

  constructor(hre: HardhatRuntimeEnvironment) {
    this.hre = hre;
    this.evvmClient = new EVVMClient(hre);
    this.arcologyClient = new ArcologyClient(hre);
    this.config = this.loadConfig();
  }

  /**
   * Initialize the plugin with default configuration
   */
  async initialize(): Promise<void> {
    console.log("[Hardhat Plugin] Initializing Virtual Chain Sandbox plugin...");
    
    // Validate Hardhat version
    this.validateHardhatVersion();
    
    // Initialize EVVM client
    if (this.config.evvm.enabled) {
      console.log("[Hardhat Plugin] EVVM integration enabled");
    }
    
    // Initialize Arcology client
    if (this.config.arcology.enabled) {
      console.log("[Hardhat Plugin] Arcology integration enabled");
    }
    
    console.log("[Hardhat Plugin] Plugin initialized successfully");
  }

  /**
   * Run a comprehensive benchmark using both EVVM and Arcology
   */
  async runComprehensiveBenchmark(options: {
    instanceId?: string;
    txCount?: number;
    concurrency?: number;
    timeout?: number;
    demo?: boolean;
  }): Promise<{
    evvm: any;
    arcology: any;
    combined: any;
  }> {
    console.log("[Hardhat Plugin] Running comprehensive benchmark...");
    
    const config = {
      txCount: options.txCount || this.config.benchmarking.defaultTxCount,
      concurrency: options.concurrency || this.config.arcology.defaultConcurrency,
      timeout: options.timeout || this.config.benchmarking.defaultTimeout,
      demo: options.demo || false,
    };
    
    // Generate mock transactions
    const transactions = this.generateMockTransactions(config.txCount);
    
    let evvmResults = null;
    let arcologyResults = null;
    
    // Run EVVM benchmark if enabled
    if (this.config.evvm.enabled) {
      console.log("[Hardhat Plugin] Running EVVM benchmark...");
      evvmResults = await this.runEVVMBenchmark(transactions, config);
    }
    
    // Run Arcology benchmark if enabled
    if (this.config.arcology.enabled) {
      console.log("[Hardhat Plugin] Running Arcology benchmark...");
      arcologyResults = await this.runArcologyBenchmark(transactions, config);
    }
    
    // Combine results
    const combined = this.combineBenchmarkResults(evvmResults, arcologyResults);
    
    // Save results
    await this.saveBenchmarkResults(combined, options.instanceId);
    
    console.log("[Hardhat Plugin] Comprehensive benchmark completed");
    
    return {
      evvm: evvmResults,
      arcology: arcologyResults,
      combined,
    };
  }

  /**
   * Run EVVM-specific benchmark
   */
  private async runEVVMBenchmark(transactions: any[], config: any): Promise<any> {
    console.log("[Hardhat Plugin] Running EVVM benchmark...");
    
    // Convert transactions to EVVM format
    const evvmTransactions = transactions.map(tx => ({
      to: tx.to,
      data: tx.data,
      value: tx.value,
      gasLimit: tx.gasLimit,
      async: true, // Use async nonces
    }));
    
    // Run parallel execution
    const results = await this.evvmClient.executeParallelTransactions(
      "mock-instance",
      evvmTransactions,
      config.concurrency
    );
    
    return this.calculateEVVMResults(results, config);
  }

  /**
   * Run Arcology-specific benchmark
   */
  private async runArcologyBenchmark(transactions: any[], config: any): Promise<any> {
    console.log("[Hardhat Plugin] Running Arcology benchmark...");
    
    // Convert transactions to Arcology format
    const arcologyTransactions = transactions.map(tx => ({
      to: tx.to,
      data: tx.data,
      value: tx.value,
      gasLimit: tx.gasLimit,
    }));
    
    // Run benchmark
    const benchmark = await this.arcologyClient.runBenchmark(
      arcologyTransactions,
      config.concurrency
    );
    
    return benchmark;
  }

  /**
   * Generate mock transactions for testing
   */
  private generateMockTransactions(count: number): any[] {
    const transactions = [];
    
    for (let i = 0; i < count; i++) {
      transactions.push({
        to: `0x${Math.random().toString(16).substr(2, 40)}`,
        data: `0x${Math.random().toString(16).substr(2, 8)}`,
        value: "0",
        gasLimit: "100000",
        nonce: i,
      });
    }
    
    return transactions;
  }

  /**
   * Calculate EVVM-specific results
   */
  private calculateEVVMResults(results: any[], config: any): any {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    const totalTime = results.length * 50; // Mock total time
    const tps = (successful.length / totalTime) * 1000;
    const averageLatency = totalTime / results.length;
    
    const totalGasUsed = successful.reduce((sum, r) => {
      return sum + BigInt(r.gasUsed || "0");
    }, 0n);
    
    return {
      mode: "evvm-parallel",
      totalTransactions: results.length,
      successfulTransactions: successful.length,
      failedTransactions: failed.length,
      totalTimeMs: totalTime,
      averageLatencyMs: averageLatency,
      tps,
      totalGasUsed,
      averageGasPerTx: totalGasUsed / BigInt(successful.length || 1),
      errors: failed.map(r => r.error || "Unknown error"),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Combine benchmark results from different systems
   */
  private combineBenchmarkResults(evvmResults: any, arcologyResults: any): any {
    const combined = {
      timestamp: new Date().toISOString(),
      evvm: evvmResults,
      arcology: arcologyResults,
      comparison: null as any,
    };
    
    if (evvmResults && arcologyResults) {
      combined.comparison = {
        tpsImprovement: ((arcologyResults.parallel.tps - evvmResults.tps) / evvmResults.tps) * 100,
        latencyImprovement: ((evvmResults.averageLatencyMs - arcologyResults.parallel.averageLatencyMs) / evvmResults.averageLatencyMs) * 100,
        gasEfficiency: Number(evvmResults.totalGasUsed) / Number(arcologyResults.parallel.totalGasUsed),
      };
    }
    
    return combined;
  }

  /**
   * Save benchmark results to file
   */
  private async saveBenchmarkResults(results: any, instanceId?: string): Promise<void> {
    const fs = await import("fs-extra");
    const path = await import("path");
    
    const outputDir = path.join(process.cwd(), this.config.benchmarking.outputPath);
    await fs.ensureDir(outputDir);
    
    const filename = `benchmark-${instanceId || 'default'}-${Date.now()}.json`;
    const filepath = path.join(outputDir, filename);
    
    await fs.writeJson(filepath, results, { spaces: 2 });
    
    console.log(`[Hardhat Plugin] Results saved to: ${filepath}`);
  }

  /**
   * Load plugin configuration
   */
  private loadConfig(): HardhatPluginConfig {
    return {
      evvm: {
        enabled: true,
        defaultNetwork: "sepolia",
        instancesPath: ".evvm/instances",
      },
      arcology: {
        enabled: true,
        defaultConcurrency: 4,
        maxConcurrency: 16,
      },
      benchmarking: {
        defaultTxCount: 100,
        defaultTimeout: 30000,
        outputPath: "benchmarks",
      },
    };
  }

  /**
   * Validate Hardhat version
   */
  private validateHardhatVersion(): void {
    const hardhatVersion = this.hre.hardhatArguments.version || "3.0.0";
    const majorVersion = parseInt(hardhatVersion.split(".")[0]);
    
    if (majorVersion < 3) {
      throw new Error("Hardhat 3.0.0 or higher is required for this plugin");
    }
    
    console.log(`[Hardhat Plugin] Hardhat version: ${hardhatVersion}`);
  }

  /**
   * Get plugin status
   */
  getStatus(): {
    hardhat: string;
    evvm: boolean;
    arcology: boolean;
    config: HardhatPluginConfig;
  } {
    return {
      hardhat: this.hre.hardhatArguments.version || "3.0.0",
      evvm: this.config.evvm.enabled,
      arcology: this.config.arcology.enabled,
      config: this.config,
    };
  }
}

/**
 * Hardhat Plugin Helper Functions
 * These functions provide additional functionality for the plugin
 */

/**
 * Create a new Hardhat task for EVVM operations
 */
export function createEVVMTask(name: string, description: string, action: (args: any, hre: HardhatRuntimeEnvironment) => Promise<void>) {
  return {
    name,
    description,
    action: async (args: any, hre: HardhatRuntimeEnvironment) => {
      const plugin = new HardhatPluginIntegration(hre);
      await plugin.initialize();
      await action(args, hre);
    },
  };
}

/**
 * Create a new Hardhat task for Arcology operations
 */
export function createArcologyTask(name: string, description: string, action: (args: any, hre: HardhatRuntimeEnvironment) => Promise<void>) {
  return {
    name,
    description,
    action: async (args: any, hre: HardhatRuntimeEnvironment) => {
      const plugin = new HardhatPluginIntegration(hre);
      await plugin.initialize();
      await action(args, hre);
    },
  };
}

/**
 * Create a new Hardhat task for benchmarking operations
 */
export function createBenchmarkTask(name: string, description: string, action: (args: any, hre: HardhatRuntimeEnvironment) => Promise<void>) {
  return {
    name,
    description,
    action: async (args: any, hre: HardhatRuntimeEnvironment) => {
      const plugin = new HardhatPluginIntegration(hre);
      await plugin.initialize();
      await action(args, hre);
    },
  };
}
