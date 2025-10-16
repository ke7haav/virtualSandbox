// Virtual Chain Sandbox Plugin - ESM Version for Hardhat 3.0.7

// Plugin configuration
class EVVMConfig {
  constructor(config = {}) {
    this.sepoliaContract = config.sepoliaContract || "0xF817e9ad82B4a19F00dA7A248D9e556Ba96e6366";
    this.mateStakingContract = config.mateStakingContract || "0x8eB2525239781e06dBDbd95d83c957C431CF2321";
    this.nameServiceContract = config.nameServiceContract || "0x8038e87dc67D87b31d890FD01E855a8517ebfD24";
    this.faucetUrl = config.faucetUrl || "https://evvm.dev";
    this.arcologyRpcUrl = config.arcologyRpcUrl || "https://devnet.arcology.network";
    this.defaultTxCount = config.defaultTxCount || 100;
    this.defaultConcurrency = config.defaultConcurrency || 4;
    this.defaultTimeout = config.defaultTimeout || 30000;
  }
}

class BenchmarkResult {
  constructor(result = {}) {
    this.mode = result.mode || "serial";
    this.totalTransactions = result.totalTransactions || 0;
    this.successfulTransactions = result.successfulTransactions || 0;
    this.failedTransactions = result.failedTransactions || 0;
    this.totalTimeMs = result.totalTimeMs || 0;
    this.averageLatencyMs = result.averageLatencyMs || 0;
    this.tps = result.tps || 0;
    this.totalGasUsed = result.totalGasUsed || "0";
    this.averageGasPerTx = result.averageGasPerTx || "0";
    this.errors = result.errors || [];
    this.timestamp = result.timestamp || new Date().toISOString();
  }
}

class EVVMInstance {
  constructor(instance = {}) {
    this.id = instance.id || `evvm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.name = instance.name || "test-instance";
    this.contractAddress = instance.contractAddress || "";
    this.status = instance.status || "initialized";
    this.createdAt = instance.createdAt || new Date().toISOString();
    this.lastActivity = instance.lastActivity || new Date().toISOString();
  }
}

// Default configuration
const defaultEVVMConfig = new EVVMConfig();

// Plugin functions
class EVVMPlugin {
  constructor(config = defaultEVVMConfig) {
    this.config = config;
  }

  // Initialize EVVM instance
  async initInstance(name) {
    const instance = new EVVMInstance({
      name,
      status: "initialized"
    });

    console.log(`✅ EVVM instance '${name}' initialized with ID: ${instance.id}`);
    return instance;
  }

  // Deploy contract to EVVM
  async deployContract(instance, contractName) {
    const deployedInstance = new EVVMInstance({
      ...instance,
      contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      status: "deployed",
      lastActivity: new Date().toISOString()
    });

    console.log(`✅ Contract '${contractName}' deployed to EVVM instance '${instance.name}'`);
    console.log(`   Contract Address: ${deployedInstance.contractAddress}`);
    return deployedInstance;
  }

  // Run benchmark
  async runBenchmark(instance, mode, txCount = this.config.defaultTxCount) {
    console.log(`🚀 Running ${mode} benchmark with ${txCount} transactions...`);

    const startTime = Date.now();
    const errors = [];
    let successfulTxs = 0;
    let totalGasUsed = 0n;

    // Simulate different execution modes
    if (mode === "serial") {
      // Serial execution simulation
      for (let i = 0; i < txCount; i++) {
        try {
          await new Promise(resolve => setTimeout(resolve, Math.random() * 20 + 10));
          successfulTxs++;
          totalGasUsed += BigInt(21000 + Math.floor(Math.random() * 1000));
        } catch (error) {
          errors.push(`Transaction ${i} failed: ${error}`);
        }
      }
    } else if (mode === "parallel") {
      // Arcology parallel execution simulation
      const batchSize = Math.min(txCount, this.config.defaultConcurrency);
      const batches = Math.ceil(txCount / batchSize);
      
      for (let batch = 0; batch < batches; batch++) {
        const batchTxs = Math.min(batchSize, txCount - batch * batchSize);
        const batchPromises = Array.from({ length: batchTxs }, (_, i) => 
          this.simulateParallelTx(batch * batchSize + i)
        );
        
        const results = await Promise.allSettled(batchPromises);
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            successfulTxs++;
            totalGasUsed += result.value;
          } else {
            errors.push(`Transaction ${batch * batchSize + index} failed: ${result.reason}`);
          }
        });
      }
    } else if (mode === "evvm-async") {
      // EVVM async nonces simulation
      const promises = Array.from({ length: txCount }, (_, i) => 
        this.simulateAsyncTx(i)
      );
      
      const results = await Promise.allSettled(promises);
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulTxs++;
          totalGasUsed += result.value;
        } else {
          errors.push(`Transaction ${index} failed: ${result.reason}`);
        }
      });
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const tps = (successfulTxs / totalTime) * 1000;
    const averageLatency = totalTime / successfulTxs;

    const result = new BenchmarkResult({
      mode,
      totalTransactions: txCount,
      successfulTransactions: successfulTxs,
      failedTransactions: txCount - successfulTxs,
      totalTimeMs: totalTime,
      averageLatencyMs: averageLatency,
      tps: tps,
      totalGasUsed: totalGasUsed.toString(),
      averageGasPerTx: BigInt(Math.floor(Number(totalGasUsed) / (successfulTxs || 1))).toString(),
      errors: errors,
      timestamp: new Date().toISOString()
    });

    console.log(`📊 ${mode.toUpperCase()} Benchmark Results:`);
    console.log(`   TPS: ${tps.toFixed(2)}`);
    console.log(`   Latency: ${averageLatency.toFixed(2)}ms`);
    console.log(`   Success Rate: ${((successfulTxs / txCount) * 100).toFixed(1)}%`);

    return result;
  }

  async simulateParallelTx(index) {
    // Simulate Arcology parallel execution
    await new Promise(resolve => setTimeout(resolve, Math.random() * 5 + 2));
    return BigInt(18000 + Math.floor(Math.random() * 500));
  }

  async simulateAsyncTx(index) {
    // Simulate EVVM async nonces
    await new Promise(resolve => setTimeout(resolve, Math.random() * 8 + 3));
    return BigInt(18000 + Math.floor(Math.random() * 800));
  }
}

// Export plugin instance
const evvmPlugin = new EVVMPlugin();

export {
  EVVMConfig,
  BenchmarkResult,
  EVVMInstance,
  EVVMPlugin,
  evvmPlugin
};
