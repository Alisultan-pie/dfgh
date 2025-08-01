#!/usr/bin/env node

import fs from 'fs';

console.log('🔧 Converting UCAN token format...\n');

// Your base64 UCAN token
const base64Token = 'Y6Jlcm9vdHOC2CpYJQABcRIgVB5oDH4SHPJHtfMIqX6paAsMC4ki9RDECkzk8QtnjfrYKlglAAFxEiAePhmQDaFsYGvOi8NpXV3AWcoJiVKV2Edfk5DLL4VnLWd2ZXJzaW9uAZoCAXESIFQeaAx-EhzyR7XzCKl-qWgLDAuJIvUQxApM5PELZ436qGFzRICgAwBhdmUwLjkuMWNhdHSBomNjYW5hKmR3aXRoZnVjYW46KmNhdWRYIu0BSGXTSCgz2J7pSdIK7s2QriyLT2oJEoK3RRz2T-Np7tNjZXhw9mNmY3SBom5hY2Nlc3MvY29uZmlybdgqWCUAAXESIMV6Ig9nE8lIlY6_2z-mfFYT6F_lAGs54SZkdBLsYrUYbmFjY2Vzcy9yZXF1ZXN02CpYJQABcRIgYpjw0Wb010EAg62ZsWiMFDce1lPEt9xWOh3nr3ZEqSxjaXNzWCCdGm1haWx0bzpnbWFpbC5jb206YWxpc3VsdGFuYWtpbWNwcmaApwMBcRIgHj4ZkA2hbGBrzovDaV1dwFnKCYlSldhHX5OQyy-FZy2oYXNYRO2hA0Dw6DMJHgOnIgtkiUCKNYqfIQTiArADU7i08mdLa-YkuPHwhbSU83Dv1K5FvnFBVXT3iBUz1c26mX4JfSY6ZjkEYXZlMC45LjFjYXR0gaNibmKhZXByb29m2CpYJQABcRIgVB5oDH4SHPJHtfMIqX6paAsMC4ki9RDECkzk8QtnjfpjY2Fua3VjYW4vYXR0ZXN0ZHdpdGh4G2RpZDp3ZWI6dXAuc3RvcmFjaGEubmV0d29ya2NhdWRYIu0BSGXTSCgz2J7pSdIK7s2QriyLT2oJEoK3RRz2T-Np7tNjZXhw9mNmY3SBom5hY2Nlc3MvY29uZmlybdgqWCUAAXESIMV6Ig9nE8lIlY6_2z-mfFYT6F_lAGs54SZkdBLsYrUYbmFjY2Vzcy9yZXF1ZXN02CpYJQABcRIgYpjw0Wb010EAg62ZsWiMFDce1lPEt9xWOh3nr3ZEqSxjaXNzWBmdGndlYjp1cC5zdG9yYWNoYS5uZXR3b3JrY3ByZoA';

// Convert to JWT format
const jwtToken = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsInVjYW4iOiJhZG1pbiJ9.${base64Token}`;

console.log('✅ Converted to JWT format!');
console.log('\n📋 Your UCAN token (JWT format):');
console.log(jwtToken);

// Create .env file with the converted token
const envContent = `# Blockchain Configuration
PROVIDER_URL=https://polygon-amoy.infura.io/v3/33eec0a080aa42e7bca1b21850a88c73
PRIVATE_KEY=0x639d3b510b42a5ddac314be575d18ff06d199499bec4ed9c1ff83f53dcec72d7
CONTRACT_ADDRESS=0x22Be8Bffc52FDC8037CA237Ea19D0D62f1dC47ce

# IPFS Configuration (Storacha Only)
UPLOAD_AUTH_METHOD=storacha
UCAN_TOKEN=${jwtToken}

# MongoDB Configuration (Optional)
MONGODB_URI=mongodb://localhost:27017/ppc

# Server Ports
PORT=3001

# Note: Using Storacha only - no JWT references
`;

// Write .env file
fs.writeFileSync('.env', envContent);

console.log('\n✅ .env file created with your UCAN token!');
console.log('\n🧪 Testing the token...');

// Test the token
const { execSync } = require('child_process');
try {
  execSync('node check-ucan-token.js', { stdio: 'inherit' });
  console.log('\n🎉 Success! Your UCAN token is working.');
  console.log('\n🚀 Now you can start the backend:');
  console.log('node backend/enhanced-server.js');
} catch (error) {
  console.log('\n❌ Token test failed. Let me try a different approach...');
  
  // Try alternative format
  const altToken = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.${base64Token}`;
  
  const altEnvContent = envContent.replace(jwtToken, altToken);
  fs.writeFileSync('.env', altEnvContent);
  
  console.log('\n🔄 Trying alternative format...');
  try {
    execSync('node check-ucan-token.js', { stdio: 'inherit' });
    console.log('\n🎉 Success with alternative format!');
  } catch (error2) {
    console.log('\n❌ Both formats failed. The token might need to be generated differently.');
  }
} 