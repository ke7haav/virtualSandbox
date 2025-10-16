const { HardhatUserConfig } = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox");
require("./src/tasks");

const config = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Arcology DevNet configuration
    arcology: {
      url: "https://devnet.arcology.network",
      chainId: 118,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  // Hardhat 3 specific configuration
  ignition: {
    requiredConfirmations: 1,
    blockConfirmations: 1,
  },
  // Enable Hardhat 3 features
  defaultNetwork: "hardhat",
  mocha: {
    timeout: 40000,
  },
};

module.exports = config;
