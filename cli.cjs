#!/usr/bin/env node

/**
 * Virtual Chain Sandbox CLI Tool
 * Standalone CLI for EVVM, Arcology, and Hardhat integration
 */

const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const { Command } = require('commander');

// Import our plugin
const { evvmPlugin } = require('./src/plugin.cjs');

const program = new Command();

program
  .name('evvm-bench')
  .description('Virtual Chain Sandbox - Parallel Executor Tester')
  .version('1.0.0');

// Command: init
program
  .command('init')
  .description('Initialize an EVVM test instance')
  .argument('[name]', 'Instance name', 'test-instance')
  .action(async (name) => {
    const spinner = ora('Initializing EVVM instance...').start();
    
    try {
      const instance = await evvmPlugin.initInstance(name);
      
      // Save instance to file
      const instancesDir = path.join(process.cwd(), 'instances');
      await fs.ensureDir(instancesDir);
      
      const instanceFile = path.join(instancesDir, `${instance.id}.json`);
      await fs.writeJson(instanceFile, instance, { spaces: 2 });
      
      spinner.succeed(`EVVM instance '${name}' created successfully!`);
      console.log(chalk.blue(`Instance ID: ${instance.id}`));
      console.log(chalk.gray(`Instance file: ${instanceFile}`));
      
    } catch (error) {
      spinner.fail(`Failed to initialize EVVM instance: ${error}`);
      process.exit(1);
    }
  });

// Command: deploy
program
  .command('deploy')
  .description('Deploy a contract to EVVM instance')
  .argument('<instanceId>', 'EVVM instance ID')
  .argument('[contract]', 'Contract name to deploy', 'ParallelCounter')
  .action(async (instanceId, contract) => {
    const spinner = ora('Deploying contract to EVVM...').start();
    
    try {
      // Load instance
      const instancesDir = path.join(process.cwd(), 'instances');
      const instanceFile = path.join(instancesDir, `${instanceId}.json`);
      
      if (!await fs.pathExists(instanceFile)) {
        throw new Error(`Instance ${instanceId} not found`);
      }
      
      const instance = await fs.readJson(instanceFile);
      
      // Deploy contract
      const deployedInstance = await evvmPlugin.deployContract(instance, contract);
      
      // Save updated instance
      await fs.writeJson(instanceFile, deployedInstance, { spaces: 2 });
      
      spinner.succeed(`Contract '${contract}' deployed successfully!`);
      console.log(chalk.blue(`Contract Address: ${deployedInstance.contractAddress}`));
      
    } catch (error) {
      spinner.fail(`Failed to deploy contract: ${error}`);
      process.exit(1);
    }
  });

// Command: benchmark
program
  .command('benchmark')
  .description('Run performance benchmark on EVVM instance')
  .argument('<instanceId>', 'EVVM instance ID')
  .option('-m, --mode <mode>', 'Benchmark mode', 'all')
  .option('-t, --tx-count <count>', 'Number of transactions', '100')
  .option('--demo', 'Run with demo data')
  .action(async (instanceId, options) => {
    const spinner = ora('Running benchmark...').start();
    
    try {
      // Load instance
      const instancesDir = path.join(process.cwd(), 'instances');
      const instanceFile = path.join(instancesDir, `${instanceId}.json`);
      
      if (!await fs.pathExists(instanceFile)) {
        throw new Error(`Instance ${instanceId} not found`);
      }
      
      const instance = await fs.readJson(instanceFile);
      const txCount = parseInt(options.txCount);
      
      const results = [];
      
      if (options.mode === 'all' || options.mode === 'serial') {
        spinner.text = 'Running serial benchmark...';
        const serialResult = await evvmPlugin.runBenchmark(instance, 'serial', txCount);
        results.push(serialResult);
      }
      
      if (options.mode === 'all' || options.mode === 'parallel') {
        spinner.text = 'Running parallel benchmark...';
        const parallelResult = await evvmPlugin.runBenchmark(instance, 'parallel', txCount);
        results.push(parallelResult);
      }
      
      if (options.mode === 'all' || options.mode === 'evvm-async') {
        spinner.text = 'Running EVVM async benchmark...';
        const evvmResult = await evvmPlugin.runBenchmark(instance, 'evvm-async', txCount);
        results.push(evvmResult);
      }
      
      // Save results
      const resultsDir = path.join(process.cwd(), 'benchmark-results');
      await fs.ensureDir(resultsDir);
      
      const resultsFile = path.join(resultsDir, `${instance.id}-${Date.now()}.json`);
      await fs.writeJson(resultsFile, {
        instanceId: instance.id,
        config: {
          txCount,
          mode: options.mode,
          demo: options.demo
        },
        results,
        timestamp: new Date().toISOString()
      }, { spaces: 2 });
      
      spinner.succeed('Benchmark completed successfully!');
      
      // Display results
      console.log(chalk.blue.bold('\n📊 Benchmark Results:'));
      results.forEach(result => {
        console.log(chalk.green(`\n${result.mode.toUpperCase()}:`));
        console.log(`  TPS: ${result.tps.toFixed(2)}`);
        console.log(`  Latency: ${result.averageLatencyMs.toFixed(2)}ms`);
        console.log(`  Success Rate: ${((result.successfulTransactions / result.totalTransactions) * 100).toFixed(1)}%`);
        console.log(`  Gas Used: ${result.totalGasUsed.toString()}`);
      });
      
      console.log(chalk.blue(`\nResults saved to: ${resultsFile}`));
      
    } catch (error) {
      spinner.fail(`Benchmark failed: ${error}`);
      process.exit(1);
    }
  });

// Command: list
program
  .command('list')
  .description('List all EVVM instances')
  .action(async () => {
    const instancesDir = path.join(process.cwd(), 'instances');
    
    if (!await fs.pathExists(instancesDir)) {
      console.log(chalk.yellow('No instances found. Run "evvm-bench init" to create one.'));
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
    
    console.log(chalk.blue.bold('\n📋 EVVM Instances:'));
    instances.forEach(instance => {
      console.log(chalk.green(`\n${instance.name} (${instance.id}):`));
      console.log(`  Status: ${instance.status}`);
      console.log(`  Contract: ${instance.contractAddress || 'Not deployed'}`);
      console.log(`  Created: ${new Date(instance.createdAt).toLocaleString()}`);
    });
  });

// Command: demo
program
  .command('demo')
  .description('Run a complete demo workflow')
  .action(async () => {
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
      
    } catch (error) {
      console.log(chalk.red(`❌ Demo failed: ${error}`));
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();
