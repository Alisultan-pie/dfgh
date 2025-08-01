#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('📦 Installing PPC Blockchain Integration Dependencies...\n');

// List of required dependencies
const dependencies = [
  // Core dependencies
  'express',
  'cors',
  'multer',
  'dotenv',
  'ethers',
  'mongodb',
  'react',
  'react-dom',
  
  // Blockchain and IPFS
  '@web3-storage/w3up-client',
  '@ucan/client',
  '@ucan/core',
  
  // Development dependencies
  '@types/react',
  '@types/react-dom',
  'typescript',
  'hardhat',
  '@nomiclabs/hardhat-ethers',
  '@nomiclabs/hardhat-waffle',
  'ethereum-waffle',
  'chai',
  
  // UI and utilities
  'lucide-react',
  'sonner',
  'class-variance-authority',
  'clsx',
  'tailwind-merge',
  'tailwindcss',
  'autoprefixer',
  'postcss'
];

// Install dependencies
console.log('🔧 Installing npm packages...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully!');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Create necessary directories
console.log('\n📁 Creating necessary directories...');
const directories = [
  'uploads',
  'tmp',
  'website/components/ui',
  'website/utils/blockchain'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Create .env template if it doesn't exist
if (!fs.existsSync('.env')) {
  console.log('\n📝 Creating .env template...');
  const envTemplate = `# Blockchain Configuration
PROVIDER_URL=https://polygon-amoy.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=your_deployed_contract_address

# MongoDB Configuration (Optional)
MONGODB_URI=mongodb://localhost:27017/ppc

# IPFS Configuration
WEB3_STORAGE_TOKEN=your_web3_storage_token

# Server Ports
PORT=3001
`;
  fs.writeFileSync('.env', envTemplate);
  console.log('✅ Created .env template');
}

console.log('\n🎉 Installation complete!');
console.log('\n📋 Next steps:');
console.log('1. Edit .env with your blockchain credentials');
console.log('2. Deploy the smart contract to Polygon Amoy testnet');
console.log('3. Run: node start-integration.js');
console.log('4. Open http://localhost:3000 in your browser');
console.log('\n💡 For help, see INTEGRATION_README.md'); 