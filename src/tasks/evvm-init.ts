import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";

interface EVVMInstance {
  id: string;
  name: string;
  contractAddress: string;
  status: "initialized" | "deployed" | "running" | "stopped";
  createdAt: string;
  lastActivity: string;
}

task("evvm:init", "Initialize an EVVM test instance")
  .addOptionalParam("name", "Name for the EVVM instance", "test-instance")
  .addOptionalParam("network", "Network to use", "sepolia")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const spinner = ora("Initializing EVVM instance...").start();
    
    try {
      // Create instances directory if it doesn't exist
      const instancesDir = path.join(process.cwd(), ".evvm", "instances");
      await fs.ensureDir(instancesDir);
      
      // Generate unique instance ID
      const instanceId = `evvm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create instance configuration
      const instance: EVVMInstance = {
        id: instanceId,
        name: taskArgs.name,
        contractAddress: "",
        status: "initialized",
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      };
      
      // Save instance configuration
      const instancePath = path.join(instancesDir, `${instanceId}.json`);
      await fs.writeJson(instancePath, instance, { spaces: 2 });
      
      // Create instance-specific directories
      await fs.ensureDir(path.join(process.cwd(), ".evvm", "instances", instanceId, "contracts"));
      await fs.ensureDir(path.join(process.cwd(), ".evvm", "instances", instanceId, "logs"));
      await fs.ensureDir(path.join(process.cwd(), ".evvm", "instances", instanceId, "benchmarks"));
      
      spinner.succeed(chalk.green(`EVVM instance initialized successfully!`));
      
      console.log(chalk.blue("\n📋 Instance Details:"));
      console.log(chalk.gray(`  ID: ${instanceId}`));
      console.log(chalk.gray(`  Name: ${taskArgs.name}`));
      console.log(chalk.gray(`  Network: ${taskArgs.network}`));
      console.log(chalk.gray(`  Status: ${instance.status}`));
      console.log(chalk.gray(`  Created: ${instance.createdAt}`));
      
      console.log(chalk.yellow("\n🔗 EVVM Configuration:"));
      console.log(chalk.gray(`  Sepolia Contract: ${hre.evvm.sepoliaContract}`));
      console.log(chalk.gray(`  MATE Staking: ${hre.evvm.mateStakingContract}`));
      console.log(chalk.gray(`  Name Service: ${hre.evvm.nameServiceContract}`));
      console.log(chalk.gray(`  Faucet: ${hre.evvm.faucetUrl}`));
      
      console.log(chalk.cyan("\n📁 Instance files created in:"));
      console.log(chalk.gray(`  ${path.join(process.cwd(), ".evvm", "instances", instanceId)}`));
      
      console.log(chalk.green("\n✅ Next steps:"));
      console.log(chalk.gray(`  1. Deploy contracts: npx hardhat evvm:deploy --instance ${instanceId}`));
      console.log(chalk.gray(`  2. Run benchmarks: npx hardhat evvm:benchmark --instance ${instanceId}`));
      
    } catch (error) {
      spinner.fail(chalk.red("Failed to initialize EVVM instance"));
      console.error(chalk.red("Error:"), error);
      process.exit(1);
    }
  });
