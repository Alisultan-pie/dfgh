// Hardhat deploy script for PetStorage.sol
require('dotenv').config();
const hre = require("hardhat");

async function main() {
  const PetStorage = await hre.ethers.getContractFactory("PetStorage");
  const contract = await PetStorage.deploy();
  await contract.waitForDeployment();

  console.log("✅ Contract deployed to:", contract.target);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
