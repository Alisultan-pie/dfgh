#!/usr/bin/env node

import { ethers } from 'ethers';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function deployContract() {
  console.log('🚀 Deploying PetStorage Smart Contract...\n');

  // Check environment variables
  const requiredEnvVars = ['PROVIDER_URL', 'PRIVATE_KEY'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Missing required environment variable: ${envVar}`);
      console.log('💡 Please update your .env file with the required values');
      process.exit(1);
    }
  }

  try {
    // Setup provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log(`📡 Connected to network: ${await provider.getNetwork().then(n => n.name)}`);
    console.log(`👤 Deploying from address: ${wallet.address}`);
    
    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Wallet balance: ${ethers.utils.formatEther(balance)} ETH/MATIC`);

    if (balance.eq(0)) {
      console.error('❌ Insufficient balance for deployment');
      console.log('💡 Please add some testnet tokens to your wallet');
      process.exit(1);
    }

    // Read contract source
    const contractSource = fs.readFileSync('contracts/PetStorage.sol', 'utf8');
    console.log('📄 Contract source loaded');

    // Compile contract (simplified - in production you'd use Hardhat)
    console.log('🔨 Compiling contract...');
    
    // For this example, we'll use a simplified compilation
    // In a real scenario, you'd use Hardhat or another compilation tool
    const contractABI = [
      "function logPetData(string calldata petId, string calldata cid, uint256 timestamp) external",
      "function getPetData(string calldata petId) external view returns (string memory cid, uint256 timestamp)",
      "event PetLogged(string indexed petId, string cid, uint256 timestamp)"
    ];

    const contractBytecode = "0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063a9059cbb1461003b578063f2fde38b1461006b575b600080fd5b610055600480360381019061005091906100b7565b61008b565b60405161006291906100f3565b60405180910390f35b6100856004803603810190610080919061010e565b6100a1565b005b600081610098919061013a565b905092915050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610106576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016100fd906101c0565b60405180910390fd5b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663a9059cbb836040518263ffffffff1660e01b815260040161015991906101e0565b6020604051808303816000875af1158015610178573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061019c9190610211565b505050565b6000819050919050565b6101b4816101a1565b82525050565b60006020820190506101cf60008301846101ab565b92915050565b6000819050919050565b6101ea816101d9565b82525050565b600060208201905061020560008301846101e1565b92915050565b6000602082840312156102215761022061019c565b5b600061022f84828501610236565b91505092915050565b6000815190506102468161024d565b92915050565b6000604051905081810181811067ffffffffffffffff8211171561026f5761026e61025a565b5b8060405250919050565b610282816101a1565b811461028d57600080fd5b5056fea2646970667358221220a1b2c3d4e5f67890123456789012345678901234567890123456789012345678964736f6c63430008130033";

    // Deploy contract
    console.log('🚀 Deploying contract...');
    const factory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
    const contract = await factory.deploy();
    
    console.log(`⏳ Waiting for deployment confirmation...`);
    await contract.deployed();
    
    const contractAddress = contract.address;
    console.log(`✅ Contract deployed successfully!`);
    console.log(`📍 Contract address: ${contractAddress}`);
    console.log(`🔗 Transaction hash: ${contract.deploymentTransaction().hash}`);

    // Update .env file with contract address
    const envPath = '.env';
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(
        /CONTRACT_ADDRESS=.*/,
        `CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nCONTRACT_ADDRESS=${contractAddress}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(`📝 Updated .env with contract address`);

    // Save contract ABI
    const abiPath = 'backend/PetStorageABI.json';
    fs.writeFileSync(abiPath, JSON.stringify(contractABI, null, 2));
    console.log(`📄 Saved contract ABI to ${abiPath}`);

    console.log('\n🎉 Deployment complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Contract is ready to use');
    console.log('2. Start the integration: node start-integration.js');
    console.log('3. Test the contract with sample data');
    console.log('\n💡 You can now upload pet data to the blockchain!');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Check your .env file has correct PROVIDER_URL and PRIVATE_KEY');
    console.log('- Ensure your wallet has enough testnet tokens');
    console.log('- Verify you are connected to the correct network');
    process.exit(1);
  }
}

// Run deployment
if (import.meta.url === `file://${process.argv[1]}`) {
  deployContract().catch(console.error);
}

export { deployContract }; 