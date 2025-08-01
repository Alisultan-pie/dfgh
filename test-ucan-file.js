#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔧 UCAN Token File Tester\n');

console.log('📋 Instructions:');
console.log('1. Download the UCAN file from Web3.Storage');
console.log('2. Save it in your project folder');
console.log('3. Tell me the filename below\n');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('What is the filename of your UCAN file? (e.g., ucan.txt): ', (filename) => {
  try {
    const filePath = path.join(process.cwd(), filename);
    const ucanContent = fs.readFileSync(filePath, 'utf8');
    
    console.log('\n📄 UCAN file content:');
    console.log(ucanContent.substring(0, 100) + '...');
    
    // Update .env with the UCAN content
    const envContent = `# Blockchain Configuration
PROVIDER_URL=https://polygon-amoy.infura.io/v3/33eec0a080aa42e7bca1b21850a88c73
PRIVATE_KEY=0x639d3b510b42a5ddac314be575d18ff06d199499bec4ed9c1ff83f53dcec72d7
CONTRACT_ADDRESS=0x22Be8Bffc52FDC8037CA237Ea19D0D62f1dC47ce

# IPFS Configuration (Storacha Only)
UPLOAD_AUTH_METHOD=storacha
UCAN_TOKEN=${ucanContent.trim()}

# MongoDB Configuration (Optional)
MONGODB_URI=mongodb://localhost:27017/ppc

# Server Ports
PORT=3001

# Note: Using Storacha only - no JWT references
`;

    fs.writeFileSync('.env', envContent);
    
    console.log('\n✅ .env file updated with UCAN content!');
    console.log('\n🧪 Testing the token...');
    
    // Test the token
    const { execSync } = require('child_process');
    try {
      execSync('node check-ucan-token.js', { stdio: 'inherit' });
      console.log('\n🎉 Success! Your UCAN token is working.');
      console.log('\n🚀 Now you can start the backend:');
      console.log('node backend/enhanced-server.js');
    } catch (error) {
      console.log('\n❌ Token test failed.');
      console.log('💡 The UCAN format might need conversion.');
    }
    
  } catch (error) {
    console.log('❌ File not found or error reading file:', error.message);
    console.log('💡 Make sure the file is in your project folder.');
  }
  
  rl.close();
}); 