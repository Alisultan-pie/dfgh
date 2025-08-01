#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🧪 Testing PPC Blockchain Integration Installation...\n');

// Test if basic dependencies are installed
const testDependencies = [
  'express',
  'cors',
  'ethers',
  'dotenv'
];

console.log('📦 Checking dependencies...');
for (const dep of testDependencies) {
  try {
    require.resolve(dep);
    console.log(`✅ ${dep} - OK`);
  } catch (error) {
    console.log(`❌ ${dep} - Missing`);
  }
}

// Test if backend can be imported
console.log('\n🔧 Testing backend import...');
try {
  const backendPath = './backend/enhanced-server.js';
  if (fs.existsSync(backendPath)) {
    console.log('✅ Backend file exists');
  } else {
    console.log('❌ Backend file missing');
  }
} catch (error) {
  console.log('❌ Backend import failed:', error.message);
}

// Test if website files exist
console.log('\n🌐 Testing website files...');
const websiteFiles = [
  './website/App.tsx',
  './website/components/BlockchainIntegration.tsx',
  './website/utils/blockchain/client.tsx'
];

for (const file of websiteFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - OK`);
  } else {
    console.log(`❌ ${file} - Missing`);
  }
}

// Test if .env exists
console.log('\n📝 Testing configuration...');
if (fs.existsSync('.env')) {
  console.log('✅ .env file exists');
} else {
  console.log('❌ .env file missing - run install-dependencies.js first');
}

console.log('\n🎯 Installation Test Complete!');
console.log('\n📋 Next steps:');
console.log('1. If all tests passed, run: node start-integration.js');
console.log('2. If some tests failed, run: node install-dependencies.js');
console.log('3. Access website at: http://localhost:3000'); 