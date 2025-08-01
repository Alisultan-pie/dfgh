#!/usr/bin/env node

import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔑 PPC Blockchain Credentials Setup\n');

console.log('📋 You need the following credentials:');
console.log('1. Infura Project ID (for blockchain connection)');
console.log('2. Wallet Private Key (for transactions)');
console.log('3. Web3.Storage Token (for IPFS uploads)');
console.log('4. Testnet MATIC (for gas fees)\n');

console.log('🌐 Getting Infura Project ID:');
console.log('1. Go to https://infura.io/');
console.log('2. Sign up/Login');
console.log('3. Create a new project');
console.log('4. Go to Settings → Keys');
console.log('5. Copy your Project ID\n');

console.log('💰 Getting Wallet Private Key:');
console.log('1. Install MetaMask: https://metamask.io/');
console.log('2. Create a new account');
console.log('3. Go to Account Details → Export Private Key');
console.log('4. Enter password and copy private key\n');

console.log('☁️ Getting Web3.Storage Token:');
console.log('1. Go to https://web3.storage/');
console.log('2. Sign up/Login');
console.log('3. Go to API Tokens');
console.log('4. Create new token\n');

console.log('💎 Getting Testnet MATIC:');
console.log('1. Go to https://faucet.polygon.technology/');
console.log('2. Select Polygon Amoy testnet');
console.log('3. Enter your wallet address');
console.log('4. Request testnet MATIC\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupCredentials() {
  console.log('\n🔧 Let\'s set up your .env file:\n');

  const infuraProjectId = await askQuestion('Enter your Infura Project ID: ');
  const privateKey = await askQuestion('Enter your wallet private key (starts with 0x): ');
  const web3StorageToken = await askQuestion('Enter your Web3.Storage token: ');
  const walletAddress = await askQuestion('Enter your wallet address (for faucet): ');

  // Create .env content
  const envContent = `# Blockchain Configuration
PROVIDER_URL=https://polygon-amoy.infura.io/v3/${infuraProjectId}
PRIVATE_KEY=${privateKey}
CONTRACT_ADDRESS=your_deployed_contract_address

# IPFS Configuration
WEB3_STORAGE_TOKEN=${web3StorageToken}

# MongoDB Configuration (Optional)
MONGODB_URI=mongodb://localhost:27017/ppc

# Server Ports
PORT=3001

# Wallet Address (for reference)
WALLET_ADDRESS=${walletAddress}
`;

  // Write .env file
  fs.writeFileSync('.env', envContent);
  console.log('\n✅ .env file created successfully!');

  // Test connection
  console.log('\n🧪 Testing your credentials...');
  
  try {
    const { ethers } = await import('ethers');
    const provider = new ethers.providers.JsonRpcProvider(`https://polygon-amoy.infura.io/v3/${infuraProjectId}`);
    
    // Test connection
    const network = await provider.getNetwork();
    console.log(`✅ Connected to network: ${network.name}`);
    
    // Test wallet
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`✅ Wallet address: ${wallet.address}`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Wallet balance: ${ethers.utils.formatEther(balance)} MATIC`);
    
    if (balance.eq(0)) {
      console.log('\n⚠️  Your wallet has 0 MATIC!');
      console.log('💡 Get testnet MATIC from: https://faucet.polygon.technology/');
      console.log(`🔗 Your wallet address: ${wallet.address}`);
    } else {
      console.log('✅ Wallet has sufficient balance for transactions');
    }
    
  } catch (error) {
    console.error('❌ Error testing credentials:', error.message);
    console.log('💡 Please check your Infura Project ID and Private Key');
  }

  console.log('\n🎉 Setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. If balance is 0, get testnet MATIC from the faucet');
  console.log('2. Deploy smart contract: node deploy-contract.js');
  console.log('3. Start integration: node start-integration.js');
  console.log('4. Access website: http://localhost:3000');

  rl.close();
}

setupCredentials().catch(console.error); 