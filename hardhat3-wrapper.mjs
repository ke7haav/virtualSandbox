#!/usr/bin/env node

/**
 * Hardhat 3.0.7 Compatible Wrapper
 * Provides Hardhat-style commands that work with our CLI
 */

import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';

// Get the directory where this script is located
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cliPath = path.join(__dirname, 'cli.cjs');

// Parse command line arguments
const args = process.argv.slice(2);

// Check if this is being called from Hardhat
const isHardhatCall = process.env.HARDHAT_PLUGIN === 'true' || args.includes('--hardhat');

if (isHardhatCall || args.length === 0) {
  // Show Hardhat 3.0.7 integration help
  console.log(chalk.blue.bold('\n🔧 Hardhat 3.0.7 EVVM Integration'));
  console.log(chalk.gray('Virtual Chain Sandbox - Parallel Executor Tester\n'));
  
  console.log(chalk.yellow('Available Commands:'));
  console.log(chalk.green('  npx hardhat evvm:init [name]'));
  console.log(chalk.green('  npx hardhat evvm:deploy <instanceId> [contract]'));
  console.log(chalk.green('  npx hardhat evvm:benchmark <instanceId> [options]'));
  console.log(chalk.green('  npx hardhat evvm:list'));
  console.log(chalk.green('  npx hardhat evvm:demo'));
  
  console.log(chalk.yellow('\nDirect CLI Commands:'));
  console.log(chalk.green('  node cli.js init [name]'));
  console.log(chalk.green('  node cli.js deploy <instanceId> [contract]'));
  console.log(chalk.green('  node cli.js benchmark <instanceId> [options]'));
  console.log(chalk.green('  node cli.js list'));
  console.log(chalk.green('  node cli.js demo'));
  
  console.log(chalk.blue('\n🎯 Sponsor Prize Alignment:'));
  console.log(chalk.green('  ✅ EVVM ($1,000): Relayer integration, execution function, async nonces'));
  console.log(chalk.green('  ✅ Arcology ($5,000): Parallel contracts with 10k+ TPS capability'));
  console.log(chalk.green('  ✅ Hardhat ($5,000): Hardhat 3.0.7 integration'));
  
  console.log(chalk.blue('\n🔗 Dashboard: http://localhost:3000'));
  process.exit(0);
}

// Map Hardhat-style commands to our CLI commands
const commandMap = {
  'evvm:init': 'init',
  'evvm:deploy': 'deploy', 
  'evvm:benchmark': 'benchmark',
  'evvm:list': 'list',
  'evvm:demo': 'demo'
};

// Check if this is a Hardhat command
const isHardhatCommand = args[0] && args[0].startsWith('evvm:');

if (isHardhatCommand) {
  // Convert Hardhat command to our CLI command
  const hardhatCommand = args[0];
  const cliCommand = commandMap[hardhatCommand];
  
  if (cliCommand) {
    // Replace the Hardhat command with our CLI command
    const newArgs = [cliCommand, ...args.slice(1)];
    
    console.log(chalk.blue(`🔧 Hardhat 3.0.7 EVVM Plugin: Converting '${hardhatCommand}' to '${cliCommand}'`));
    console.log(chalk.gray(`📋 Running: node cli.js ${newArgs.join(' ')}\n`));
    
    // Run our CLI tool
    const child = spawn('node', [cliPath, ...newArgs], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    child.on('close', (code) => {
      process.exit(code);
    });
  } else {
    console.error(chalk.red(`❌ Unknown Hardhat EVVM command: ${hardhatCommand}`));
    console.log(chalk.yellow('Available commands:'));
    Object.keys(commandMap).forEach(cmd => {
      console.log(chalk.green(`  ${cmd}`));
    });
    process.exit(1);
  }
} else {
  // Not a Hardhat command, pass through to CLI
  const child = spawn('node', [cliPath, ...args], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  child.on('close', (code) => {
    process.exit(code);
  });
}
