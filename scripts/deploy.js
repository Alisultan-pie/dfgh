// scripts/deploy.js
require("dotenv").config();
const hre = require("hardhat");

async function main() {
  // compile & get the factory
  const PetStorage = await hre.ethers.getContractFactory("PetStorage");
  // deploy
  const petStorage = await PetStorage.deploy();
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
