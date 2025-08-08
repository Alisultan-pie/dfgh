// scripts/deploy.js
require("dotenv").config();
const hre = require("hardhat");

async function main() {
  await hre.run("compile");
  const PetStorage = await hre.ethers.getContractFactory("PetStorage");
  const petStorage = await PetStorage.deploy({ gasLimit: 6_000_000 });
  const receipt = await petStorage.deploymentTransaction().wait();
  console.log("✅ PetStorage deployed to:", await petStorage.getAddress());
  console.log("⛽ Tx:", receipt?.hash || petStorage.deploymentTransaction().hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
