// Hardhat 3.0.7 Plugin - Working ESM Version
import { task } from "hardhat/config";
import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";

// Import our plugin classes
import { evvmPlugin, EVVMInstance, BenchmarkResult } from "./plugin.mjs";

// Task: evvm:init
task("evvm:init", "Initialize an EVVM test instance")
  .addParam("name", "Instance name", "test-instance")
  .setAction(async (taskArgs, hre) => {
    const spinner = ora("Initializing EVVM instance...").start();
    
    try {
      const instance = await evvmPlugin.initInstance(taskArgs.name);
      
      // Save instance to file
      const instancesDir = path.join(hre.config.paths.root, "instances");
      await fs.ensureDir(instancesDir);
      
      const instanceFile = path.join(instancesDir, `${instance.id}.json`);
      await fs.writeJson(instanceFile, instance, { spaces: 2 });
      
      spinner.succeed(`EVVM instance '${taskArgs.name}' created successfully!`);
      console.log(chalk.blue(`Instance ID: ${instance.id}`));
      console.log(chalk.gray(`Instance file: ${instanceFile}`));
      
      return instance;
    } catch (error) {
      spinner.fail(`Failed to initialize EVVM instance: ${error}`);
      throw error;
    }
  });

// Task: evvm:deploy
task("evvm:deploy", "Deploy a contract to EVVM instance")
  .addParam("instanceId", "EVVM instance ID")
  .addParam("contract", "Contract name to deploy", "ParallelCounter")
  .setAction(async (taskArgs, hre) => {
    const spinner = ora("Deploying contract to EVVM...").start();
    
    try {
      // Load instance
      const instancesDir = path.join(hre.config.paths.root, "instances");
      const instanceFile = path.join(instancesDir, `${taskArgs.instanceId}.json`);
      
      if (!await fs.pathExists(instanceFile)) {
        throw new Error(`Instance ${taskArgs.instanceId} not found`);
      }
      
      const instance = await fs.readJson(instanceFile);
      
      // Deploy contract
      const deployedInstance = await evvmPlugin.deployContract(instance, taskArgs.contract);
      
      // Save updated instance
      await fs.writeJson(instanceFile, deployedInstance, { spaces: 2 });
      
      spinner.succeed(`Contract '${taskArgs.contract}' deployed successfully!`);
      console.log(chalk.blue(`Contract Address: ${deployedInstance.contractAddress}`));
      
      return deployedInstance;
    } catch (error) {
      spinner.fail(`Failed to deploy contract: ${error}`);
      throw error;
    }
  });

// Task: evvm:benchmark
task("evvm:benchmark", "Run performance benchmark on EVVM instance")
  .addParam("instanceId", "EVVM instance ID")
  .addParam("mode", "Benchmark mode", "all")
  .addParam("txCount", "Number of transactions", "100")
  .addFlag("demo", "Run with demo data")
  .setAction(async (taskArgs, hre) => {
    const spinner = ora("Running benchmark...").start();
    
    try {
      // Load instance
      const instancesDir = path.join(hre.config.paths.root, "instances");
      const instanceFile = path.join(instancesDir, `${taskArgs.instanceId}.json`);
      
      if (!await fs.pathExists(instanceFile)) {
        throw new Error(`Instance ${taskArgs.instanceId} not found`);
      }
      
      const instance = await fs.readJson(instanceFile);
      const txCount = parseInt(taskArgs.txCount);
      
      const results = [];
      
      if (taskArgs.mode === "all" || taskArgs.mode === "serial") {
        spinner.text = "Running serial benchmark...";
        const serialResult = await evvmPlugin.runBenchmark(instance, "serial", txCount);
        results.push(serialResult);
      }
      
      if (taskArgs.mode === "all" || taskArgs.mode === "parallel") {
        spinner.text = "Running parallel benchmark...";
        const parallelResult = await evvmPlugin.runBenchmark(instance, "parallel", txCount);
        results.push(parallelResult);
      }
      
      if (taskArgs.mode === "all" || taskArgs.mode === "evvm-async") {
        spinner.text = "Running EVVM async benchmark...";
        const evvmResult = await evvmPlugin.runBenchmark(instance, "evvm-async", txCount);
        results.push(evvmResult);
      }
      
      // Save results
      const resultsDir = path.join(hre.config.paths.root, "benchmark-results");
      await fs.ensureDir(resultsDir);
      
      const resultsFile = path.join(resultsDir, `${instance.id}-${Date.now()}.json`);
      await fs.writeJson(resultsFile, {
        instanceId: instance.id,
        config: {
          txCount,
          mode: taskArgs.mode,
          demo: taskArgs.demo
        },
        results,
        timestamp: new Date().toISOString()
      }, { spaces: 2 });
      
      spinner.succeed("Benchmark completed successfully!");
      
      // Display results
      console.log(chalk.blue.bold("\n📊 Benchmark Results:"));
      results.forEach(result => {
        console.log(chalk.green(`\n${result.mode.toUpperCase()}:`));
        console.log(`  TPS: ${result.tps.toFixed(2)}`);
        console.log(`  Latency: ${result.averageLatencyMs.toFixed(2)}ms`);
        console.log(`  Success Rate: ${((result.successfulTransactions / result.totalTransactions) * 100).toFixed(1)}%`);
        console.log(`  Gas Used: ${result.totalGasUsed}`);
      });
      
      console.log(chalk.blue(`\nResults saved to: ${resultsFile}`));
      
      return results;
    } catch (error) {
      spinner.fail(`Benchmark failed: ${error}`);
      throw error;
    }
  });

// Task: evvm:list
task("evvm:list", "List all EVVM instances")
  .setAction(async (taskArgs, hre) => {
    const instancesDir = path.join(hre.config.paths.root, "instances");
    
    if (!await fs.pathExists(instancesDir)) {
      console.log(chalk.yellow("No instances found. Run 'npx hardhat evvm:init' to create one."));
      return;
    }
    
    const instanceFiles = await fs.readdir(instancesDir);
    const instances = await Promise.all(
      instanceFiles
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          const instance = await fs.readJson(path.join(instancesDir, file));
          return instance;
        })
    );
    
    console.log(chalk.blue.bold("\n📋 EVVM Instances:"));
    instances.forEach(instance => {
      console.log(chalk.green(`\n${instance.name} (${instance.id}):`));
      console.log(`  Status: ${instance.status}`);
      console.log(`  Contract: ${instance.contractAddress || 'Not deployed'}`);
      console.log(`  Created: ${new Date(instance.createdAt).toLocaleString()}`);
    });
    
    return instances;
  });

// Task: evvm:demo
task("evvm:demo", "Run a complete demo workflow")
  .setAction(async (taskArgs, hre) => {
    console.log(chalk.blue.bold('\n🚀 Virtual Chain Sandbox Demo'));
    console.log(chalk.gray('Running complete workflow...\n'));
    
    try {
      // Step 1: Initialize instance
      console.log(chalk.yellow('Step 1: Initializing EVVM instance...'));
      const instance = await evvmPlugin.initInstance('demo-instance');
      console.log(chalk.green(`✅ Instance created: ${instance.id}\n`));
      
      // Step 2: Deploy contract
      console.log(chalk.yellow('Step 2: Deploying ParallelCounter contract...'));
      const deployedInstance = await evvmPlugin.deployContract(instance, 'ParallelCounter');
      console.log(chalk.green(`✅ Contract deployed: ${deployedInstance.contractAddress}\n`));
      
      // Step 3: Run benchmarks
      console.log(chalk.yellow('Step 3: Running performance benchmarks...'));
      
      const serialResult = await evvmPlugin.runBenchmark(deployedInstance, 'serial', 50);
      const parallelResult = await evvmPlugin.runBenchmark(deployedInstance, 'parallel', 50);
      const evvmResult = await evvmPlugin.runBenchmark(deployedInstance, 'evvm-async', 50);
      
      // Display results
      console.log(chalk.blue.bold('\n📊 Demo Results:'));
      console.log(chalk.green(`\nSERIAL: ${serialResult.tps.toFixed(2)} TPS, ${serialResult.averageLatencyMs.toFixed(2)}ms latency`));
      console.log(chalk.green(`PARALLEL: ${parallelResult.tps.toFixed(2)} TPS, ${parallelResult.averageLatencyMs.toFixed(2)}ms latency`));
      console.log(chalk.green(`EVVM ASYNC: ${evvmResult.tps.toFixed(2)} TPS, ${evvmResult.averageLatencyMs.toFixed(2)}ms latency`));
      
      const tpsImprovement = ((parallelResult.tps - serialResult.tps) / serialResult.tps) * 100;
      console.log(chalk.blue(`\n🚀 TPS Improvement: +${tpsImprovement.toFixed(1)}% with Arcology parallel execution!`));
      
      console.log(chalk.green('\n✅ Demo completed successfully!'));
      console.log(chalk.blue('🔗 Open dashboard: http://localhost:3000'));
      
      return { serialResult, parallelResult, evvmResult };
    } catch (error) {
      console.log(chalk.red(`❌ Demo failed: ${error}`));
      throw error;
    }
  });
