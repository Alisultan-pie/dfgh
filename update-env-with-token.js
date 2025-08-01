#!/usr/bin/env node

import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 UCAN Token Setup Helper\n');

console.log('📋 Instructions:');
console.log('1. Go to https://console.web3.storage/');
console.log('2. Sign in and go to API Tokens');
console.log('3. Create a new token');
console.log('4. Copy the UCAN token (starts with eyJ...)');
console.log('5. Paste it below when prompted\n');

rl.question('Paste your UCAN token here: ', (ucanToken) => {
  if (!ucanToken || ucanToken.trim() === '') {
    console.log('❌ No token provided');
    rl.close();
    return;
  }

  // Create .env content
  const envContent = `# Blockchain Configuration
PROVIDER_URL=https://polygon-amoy.infura.io/v3/33eec0a080aa42e7bca1b21850a88c73
PRIVATE_KEY=0x639d3b510b42a5ddac314be575d18ff06d199499bec4ed9c1ff83f53dcec72d7
CONTRACT_ADDRESS=0x22Be8Bffc52FDC8037CA237Ea19D0D62f1dC47ce

# IPFS Configuration (Storacha Only)
UPLOAD_AUTH_METHOD=storacha
UCAN_TOKEN=${ucanToken.trim()}

# MongoDB Configuration (Optional)
MONGODB_URI=mongodb://localhost:27017/ppc

# Server Ports
PORT=3001

# Note: Using Storacha only - no JWT references
`;

  // Write .env file
  fs.writeFileSync('.env', envContent);

  console.log('\n✅ .env file updated with your UCAN token!');
  console.log('\n🧪 Testing the token...');
  
  // Test the token
  const { execSync } = require('child_process');
  try {
    execSync('node check-ucan-token.js', { stdio: 'inherit' });
    console.log('\n🎉 Success! Your UCAN token is working.');
    console.log('\n🚀 Now you can start the backend:');
    console.log('node backend/enhanced-server.js');
  } catch (error) {
    console.log('\n❌ Token test failed. Please check your token.');
  }
  
  rl.close();
}); 