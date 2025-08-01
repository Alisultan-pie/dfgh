#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

console.log('🚀 Starting PPC Blockchain Integration...\n');

// Check if required files exist
const requiredFiles = [
  'backend/enhanced-server.js',
  'website/App.tsx',
  'contracts/PetStorage.sol',
  'ipfs/upload.js'
];

console.log('📋 Checking required files...');
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing`);
  }
}

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('\n⚠️  .env file not found. Creating template...');
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
  console.log('📝 Created .env template. Please update with your actual values.');
}

console.log('\n🔧 Starting services...\n');

// Start the enhanced blockchain backend
console.log('🔗 Starting Blockchain Backend (Port 3001)...');
const backend = spawn('node', ['backend/enhanced-server.js'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

// Start the website
console.log('🌐 Starting Website (Port 3000)...');
const website = spawn('node', ['start-website.js'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

backend.on('error', (error) => {
  console.error('❌ Backend failed to start:', error.message);
  console.log('💡 Make sure you have installed dependencies: npm install');
});

backend.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Backend exited with code ${code}`);
  }
});

// Wait a moment for backend to start
setTimeout(() => {
  console.log('\n🌐 Starting Website Frontend...');
  console.log('💡 The website should be available at: http://localhost:3000');
  console.log('🔗 Blockchain API available at: http://localhost:3001');
  console.log('\n📋 Available endpoints:');
  console.log('   GET  /health - Health check');
  console.log('   POST /upload - Upload file to IPFS');
  console.log('   POST /blockchain/log - Log to blockchain');
  console.log('   GET  /blockchain/pet/:id - Get pet from blockchain');
  console.log('   GET  /download/:id - Download from IPFS');
  console.log('   POST /verify/:id - Verify data integrity');
  console.log('   GET  /stats - Get blockchain stats');
  console.log('   POST /pets - Create pet record');
  console.log('   GET  /pets - Get all pets');
  console.log('   POST /transactions - Create transaction');
  console.log('   GET  /transactions - Get all transactions');
  console.log('   POST /verifications - Create verification');
  console.log('   GET  /verifications - Get all verifications');
  
  console.log('\n🎯 Integration Features:');
  console.log('   ✅ IPFS file storage with encryption');
  console.log('   ✅ Blockchain transaction logging');
  console.log('   ✅ Data integrity verification');
  console.log('   ✅ MongoDB data persistence');
  console.log('   ✅ Real-time connectivity monitoring');
  console.log('   ✅ File download from IPFS');
  console.log('   ✅ Transaction history tracking');
  
  console.log('\n🔐 Security Features:');
  console.log('   ✅ AES-256 encryption for files');
  console.log('   ✅ SHA-256 hash verification');
  console.log('   ✅ Blockchain immutability');
  console.log('   ✅ IPFS decentralized storage');
  console.log('   ✅ Tamper-proof records');
  
  console.log('\n📱 Website Features:');
  console.log('   ✅ Modern React UI with TypeScript');
  console.log('   ✅ Real-time blockchain integration');
  console.log('   ✅ Offline mode with local caching');
  console.log('   ✅ User authentication system');
  console.log('   ✅ Pet data management');
  console.log('   ✅ Transaction monitoring');
  console.log('   ✅ Data verification tools');
  
  console.log('\n🚀 Ready to use! Open your browser and navigate to the website.');
  console.log('💡 Use the "Blockchain" tab to upload pet data to IPFS and the blockchain.');
}, 2000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down services...');
  backend.kill();
  website.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down services...');
  backend.kill();
  website.kill();
  process.exit(0);
}); 