// scripts/deploy.js
require('dotenv').config();
const hre = require('hardhat');

async function main() {
  // If your contract is named differently, change this:
  const CONTRACT_NAME = 'PetStorage';

  // Hardhat will compile on demand, but explicit compile is okay:
  await hre.run('compile');

  const Factory = await hre.ethers.getContractFactory(CONTRACT_NAME);

  // Avoid hard-coding gasLimit unless you truly need it.
  // If you have constructor args, pass them here: Factory.deploy(arg1, arg2, { ...overrides })
  const contract = await Factory.deploy();

  // ethers v6 pattern
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const tx = contract.deploymentTransaction();

  console.log(`✅ ${CONTRACT_NAME} deployed to: ${address}`);
  console.log(`⛽  Tx: ${tx?.hash}`);
}

main().catch((err) => {
  console.error('❌ Deployment failed:', err);
  process.exit(1);                                                                                                             
});
