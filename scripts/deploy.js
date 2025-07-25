// scripts/deploy.js
require("dotenv").config();
const hre = require("hardhat");

async function main() {
  // compile & get the factory
  const PetStorage = await hre.ethers.getContractFactory("PetStorage");
  // deploy with custom gas limit to avoid out-of-gas errors
  const petStorage = await PetStorage.deploy({ gasLimit: 6000000 });
  // wait until it’s mined
  await petStorage.deployed();

  console.log("✅ PetStorage deployed to:", petStorage.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
