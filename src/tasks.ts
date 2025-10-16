// Hardhat 3 Tasks - Working Version
const { task } = require("hardhat/config");
const { evvmPlugin, EVVMInstance, BenchmarkResult } = require("./plugin.js");
const chalk = require("chalk");
const ora = require("ora");
const fs = require("fs-extra");
const path = require("path");

// Task: evvm:init
task("evvm:init", "Initialize an EVVM test instance")
  .addParam("name", "Instance name", "test-instance")
  .setAction(async (taskArgs, hre) => {
    const spinner = ora("Initializing EVVM instance...").start();
    
    try {
      const instance = await evvmPlugin.initInstance(taskArgs.name);
      
      // Save instance to file
      const instancesDir = path.join(process.cwd(), "instances");
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
      const instancesDir = path.join(process.cwd(), "instances");
      const instanceFile = path.join(instancesDir, `${taskArgs.instanceId}.json`);
      
      if (!await fs.pathExists(instanceFile)) {
        throw new Error(`Instance ${taskArgs.instanceId} not found`);
      }
      
      const instance: EVVMInstance = await fs.readJson(instanceFile);
      
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
      const instancesDir = path.join(process.cwd(), "instances");
      const instanceFile = path.join(instancesDir, `${taskArgs.instanceId}.json`);
      
      if (!await fs.pathExists(instanceFile)) {
        throw new Error(`Instance ${taskArgs.instanceId} not found`);
      }
      
      const instance: EVVMInstance = await fs.readJson(instanceFile);
      const txCount = parseInt(taskArgs.txCount);
      
      const results: BenchmarkResult[] = [];
      
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
      const resultsDir = path.join(process.cwd(), "benchmark-results");
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
        console.log(`  Gas Used: ${result.totalGasUsed.toString()}`);
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
    const instancesDir = path.join(process.cwd(), "instances");
    
    if (!await fs.pathExists(instancesDir)) {
      console.log(chalk.yellow("No instances found. Run 'npx hardhat evvm:init' to create one."));
      return;
    }
    
    const instanceFiles = await fs.readdir(instancesDir);
    const instances = await Promise.all(
      instanceFiles
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          const instance: EVVMInstance = await fs.readJson(path.join(instancesDir, file));
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
