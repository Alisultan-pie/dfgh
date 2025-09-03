#!/usr/bin/env node
/**
 * Production Setup Script
 * Validates environment and provides setup guidance
 */

import { config, validateConfig, getIPFSConfig } from '../config/environment.js';
import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';

console.log('🚀 PRODUCTION SETUP VALIDATOR');
console.log('==============================');

// 1. Validate Configuration
console.log('\n1️⃣ Validating configuration...');
const configErrors = validateConfig();

if (configErrors.length > 0) {
  console.log('❌ Configuration issues found:');
  configErrors.forEach(error => console.log(`   - ${error}`));
  console.log('\n💡 Fix these issues before deployment:');
  console.log('   - Copy env-template.example to .env');
  console.log('   - Or customize config/environment.js');
} else {
  console.log('✅ Configuration validation passed');
}

// 2. Check IPFS Configuration
console.log('\n2️⃣ Checking IPFS configuration...');
const ipfsConfig = getIPFSConfig();

if (ipfsConfig) {
  console.log(`✅ IPFS configured: ${ipfsConfig.type}`);
  
  if (ipfsConfig.type === 'ucan') {
    console.log('   - Using Storacha UCAN token');
  } else if (ipfsConfig.type === 'w3up') {
    console.log('   - Using Storacha Space + Proof');
  } else if (ipfsConfig.type === 'web3storage') {
    console.log('   - Using Web3.Storage token');
  }
} else {
  console.log('❌ No IPFS configuration found');
  console.log('💡 Set one of:');
  console.log('   - UCAN_TOKEN=ucan:...');
  console.log('   - W3UP_SPACE_DID + W3UP_PROOF');
  console.log('   - WEB3_STORAGE_TOKEN');
}

// 3. Security Check
console.log('\n3️⃣ Security configuration check...');

if (config.server.nodeEnv === 'production') {
  console.log('✅ Running in production mode');
  
  if (config.server.allowedOrigins.includes('localhost')) {
    console.log('⚠️  WARNING: localhost in allowed origins (production risk)');
  } else {
    console.log('✅ CORS origins properly configured');
  }
  
  if (config.dev.useMock) {
    console.log('❌ Mock data enabled in production');
  } else {
    console.log('✅ Mock data disabled');
  }
} else {
  console.log('⚠️  Running in development mode');
}

// 4. File Permissions Check
console.log('\n4️⃣ Checking file permissions...');

try {
  await readFile('config/environment.js');
  console.log('✅ Configuration file readable');
} catch (error) {
  console.log('❌ Cannot read configuration file:', error.message);
}

// 5. Dependencies Check
console.log('\n5️⃣ Checking critical dependencies...');

const criticalDeps = [
  'multiformats',
  '@storacha/client',
  'web3.storage',
  'express',
  'express-rate-limit',
  'cors',
  'multer'
];

try {
  const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  let missingDeps = [];
  criticalDeps.forEach(dep => {
    if (allDeps[dep]) {
      console.log(`✅ ${dep}: ${allDeps[dep]}`);
    } else {
      console.log(`❌ Missing: ${dep}`);
      missingDeps.push(dep);
    }
  });
  
  if (missingDeps.length > 0) {
    console.log(`\n💡 Install missing dependencies: npm install ${missingDeps.join(' ')}`);
  }
} catch (error) {
  console.log('❌ Cannot read package.json:', error.message);
}

// 6. Final Recommendations
console.log('\n🎯 PRODUCTION DEPLOYMENT CHECKLIST:');
console.log('====================================');

const checklist = [
  { item: 'Environment variables configured', check: configErrors.length === 0 },
  { item: 'IPFS credentials set', check: !!ipfsConfig },
  { item: 'Production mode enabled', check: config.server.nodeEnv === 'production' },
  { item: 'Mock data disabled', check: !config.dev.useMock },
  { item: 'CORS origins configured', check: !config.server.allowedOrigins.includes('localhost') || config.server.nodeEnv !== 'production' },
  { item: 'Rate limiting enabled', check: config.security.rateLimitMax > 0 }
];

checklist.forEach(({ item, check }) => {
  console.log(`${check ? '✅' : '❌'} ${item}`);
});

const allPassed = checklist.every(({ check }) => check);

if (allPassed) {
  console.log('\n🎉 READY FOR PRODUCTION DEPLOYMENT!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run cid:check');
  console.log('2. Run: node backend/production-pet-server.js');
  console.log('3. Test: curl http://localhost:3001/health');
} else {
  console.log('\n⚠️  Fix the issues above before deploying to production.');
  process.exit(1);
}
