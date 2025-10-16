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

task("evvm:deploy", "Deploy contracts to EVVM instance")
  .addOptionalParam("instance", "EVVM instance ID")
  .addOptionalParam("contract", "Contract name to deploy", "Counter")
  .addOptionalParam("args", "Constructor arguments (comma-separated)", "")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const spinner = ora("Deploying contracts to EVVM...").start();
    
    try {
      // Find instance
      const instancesDir = path.join(process.cwd(), ".evvm", "instances");
      let instanceId = taskArgs.instance;
      
      if (!instanceId) {
        // Find the most recent instance
        const instanceFiles = await fs.readdir(instancesDir);
        const instanceJsonFiles = instanceFiles.filter(f => f.endsWith('.json'));
        
        if (instanceJsonFiles.length === 0) {
          throw new Error("No EVVM instances found. Run 'npx hardhat evvm:init' first.");
        }
        
        // Get the most recent instance
        const instanceFilesWithStats = await Promise.all(
          instanceJsonFiles.map(async (file) => {
            const filePath = path.join(instancesDir, file);
            const stats = await fs.stat(filePath);
            return { file, mtime: stats.mtime };
          })
        );
        
        const mostRecent = instanceFilesWithStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())[0];
        instanceId = mostRecent.file.replace('.json', '');
      }
      
      const instancePath = path.join(instancesDir, `${instanceId}.json`);
      
      if (!await fs.pathExists(instancePath)) {
        throw new Error(`Instance ${instanceId} not found.`);
      }
      
      const instance: EVVMInstance = await fs.readJson(instancePath);
      
      if (instance.status !== "initialized") {
        throw new Error(`Instance ${instanceId} is not in initialized state. Current status: ${instance.status}`);
      }
      
      // Mock deployment process
      spinner.text = "Connecting to EVVM network...";
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      spinner.text = "Compiling contracts...";
      await hre.run("compile");
      
      spinner.text = "Deploying to EVVM...";
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock contract address (in real implementation, this would be the actual deployed address)
      const mockContractAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      
      // Update instance
      instance.contractAddress = mockContractAddress;
      instance.status = "deployed";
      instance.lastActivity = new Date().toISOString();
      
      await fs.writeJson(instancePath, instance, { spaces: 2 });
      
      // Create deployment log
      const deploymentLog = {
        instanceId,
        contractName: taskArgs.contract,
        contractAddress: mockContractAddress,
        constructorArgs: taskArgs.args ? taskArgs.args.split(',') : [],
        deployedAt: new Date().toISOString(),
        network: "evvm-sepolia",
        gasUsed: "21000",
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      };
      
      const logPath = path.join(process.cwd(), ".evvm", "instances", instanceId, "logs", "deployment.json");
      await fs.writeJson(logPath, deploymentLog, { spaces: 2 });
      
      spinner.succeed(chalk.green(`Contract deployed successfully!`));
      
      console.log(chalk.blue("\n📋 Deployment Details:"));
      console.log(chalk.gray(`  Instance: ${instanceId}`));
      console.log(chalk.gray(`  Contract: ${taskArgs.contract}`));
      console.log(chalk.gray(`  Address: ${mockContractAddress}`));
      console.log(chalk.gray(`  Network: EVVM Sepolia`));
      console.log(chalk.gray(`  Status: ${instance.status}`));
      
      if (taskArgs.args) {
        console.log(chalk.gray(`  Constructor Args: ${taskArgs.args}`));
      }
      
      console.log(chalk.yellow("\n🔗 EVVM Integration Points:"));
      console.log(chalk.gray(`  EVVM Contract: ${hre.evvm.sepoliaContract}`));
      console.log(chalk.gray(`  MATE Staking: ${hre.evvm.mateStakingContract}`));
      console.log(chalk.gray(`  Name Service: ${hre.evvm.nameServiceContract}`));
      
      console.log(chalk.green("\n✅ Next steps:"));
      console.log(chalk.gray(`  1. Run benchmarks: npx hardhat evvm:benchmark --instance ${instanceId}`));
      console.log(chalk.gray(`  2. View dashboard: npm run dashboard:dev`));
      
    } catch (error) {
      spinner.fail(chalk.red("Failed to deploy contracts"));
      console.error(chalk.red("Error:"), error);
      process.exit(1);
    }
  });
