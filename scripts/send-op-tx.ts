import { ethers } from "hardhat";

async function main() {
  console.log("Sending Optimism-like transaction...");

  // Get the signer
  const [signer] = await ethers.getSigners();
  console.log("Signer address:", signer.address);

  // Get the balance
  const balance = await ethers.provider.getBalance(signer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  // Create a simple transaction
  const tx = await signer.sendTransaction({
    to: signer.address, // Send to self
    value: ethers.parseEther("0.001"), // Send 0.001 ETH
    gasLimit: 21000,
  });

  console.log("Transaction hash:", tx.hash);
  console.log("Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt?.blockNumber);
  console.log("Gas used:", receipt?.gasUsed.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
