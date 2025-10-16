#!/usr/bin/env node

/**
 * Hardhat 3.0.7 Task Definitions
 * Provides Hardhat-style commands that work with our CLI
 */

import { task } from "hardhat/config";
import chalk from "chalk";

// Task: evvm:init
task("evvm:init", "Initialize an EVVM test instance")
  .addParam("name", "Instance name", "test-instance")
  .setAction(async (taskArgs, hre) => {
    console.log(chalk.blue('🔧 Hardhat 3.0.7 EVVM Plugin'));
    console.log(chalk.gray('Delegating to CLI tool...\n'));
    
    const { spawn } = await import('child_process');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const cliPath = join(__dirname, 'cli.js');
    
    return new Promise((resolve, reject) => {
      const child = spawn('node', [cliPath, 'init', taskArgs.name], {
        stdio: 'inherit',
        cwd: hre.config.paths.root
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`CLI command failed with code ${code}`));
        }
      });
    });
  });

// Task: evvm:deploy
task("evvm:deploy", "Deploy a contract to EVVM instance")
  .addParam("instanceId", "EVVM instance ID")
  .addParam("contract", "Contract name to deploy", "ParallelCounter")
  .setAction(async (taskArgs, hre) => {
    console.log(chalk.blue('🔧 Hardhat 3.0.7 EVVM Plugin'));
    console.log(chalk.gray('Delegating to CLI tool...\n'));
    
    const { spawn } = await import('child_process');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const cliPath = join(__dirname, 'cli.js');
    
    return new Promise((resolve, reject) => {
      const child = spawn('node', [cliPath, 'deploy', taskArgs.instanceId, taskArgs.contract], {
        stdio: 'inherit',
        cwd: hre.config.paths.root
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`CLI command failed with code ${code}`));
        }
      });
    });
  });

// Task: evvm:benchmark
task("evvm:benchmark", "Run performance benchmark on EVVM instance")
  .addParam("instanceId", "EVVM instance ID")
  .addParam("mode", "Benchmark mode", "all")
  .addParam("txCount", "Number of transactions", "100")
  .addFlag("demo", "Run with demo data")
  .setAction(async (taskArgs, hre) => {
    console.log(chalk.blue('🔧 Hardhat 3.0.7 EVVM Plugin'));
    console.log(chalk.gray('Delegating to CLI tool...\n'));
    
    const { spawn } = await import('child_process');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const cliPath = join(__dirname, 'cli.js');
    
    const args = ['benchmark', taskArgs.instanceId, '--mode', taskArgs.mode, '--tx-count', taskArgs.txCount];
    if (taskArgs.demo) {
      args.push('--demo');
    }
    
    return new Promise((resolve, reject) => {
      const child = spawn('node', [cliPath, ...args], {
        stdio: 'inherit',
        cwd: hre.config.paths.root
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`CLI command failed with code ${code}`));
        }
      });
    });
  });

// Task: evvm:list
task("evvm:list", "List all EVVM instances")
  .setAction(async (taskArgs, hre) => {
    console.log(chalk.blue('🔧 Hardhat 3.0.7 EVVM Plugin'));
    console.log(chalk.gray('Delegating to CLI tool...\n'));
    
    const { spawn } = await import('child_process');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const cliPath = join(__dirname, 'cli.js');
    
    return new Promise((resolve, reject) => {
      const child = spawn('node', [cliPath, 'list'], {
        stdio: 'inherit',
        cwd: hre.config.paths.root
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`CLI command failed with code ${code}`));
        }
      });
    });
  });

// Task: evvm:demo
task("evvm:demo", "Run a complete demo workflow")
  .setAction(async (taskArgs, hre) => {
    console.log(chalk.blue('🔧 Hardhat 3.0.7 EVVM Plugin'));
    console.log(chalk.gray('Delegating to CLI tool...\n'));
    
    const { spawn } = await import('child_process');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const cliPath = join(__dirname, 'cli.js');
    
    return new Promise((resolve, reject) => {
      const child = spawn('node', [cliPath, 'demo'], {
        stdio: 'inherit',
        cwd: hre.config.paths.root
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`CLI command failed with code ${code}`));
        }
      });
    });
  });
