#!/usr/bin/env node

/**
 * CLEANUP UNNECESSARY FILES
 * Remove all the demo/test files created during development
 */

import fs from 'fs';
import path from 'path';

console.log('🧹 CLEANING UP UNNECESSARY FILES');
console.log('════════════════════════════════════════════════════════════════');

// List of unnecessary files to delete
const filesToDelete = [
  // Demo and test files I created
  'api-photo-upload.js',
  'api-registration-example.js',
  'blockchain-demo.js',
  'CODEBASE_ANALYSIS.md',
  'COMPLETE_EXAMPLES_SUMMARY.md',
  'complete-pet-example.js',
  'convert-ucan-token.js',
  'create-env-manual.js',
  'fix-ipfs-real.js',
  'generate-diagrams.html',
  'generate-report.js',
  'index.html',
  'IPFS_PROOF_FOR_MANAGER.md',
  'ipfs-proof-demo.js',
  'ipfs-verification-tool.html',
  'MANAGER_SUMMARY.md',
  'METADATA_IPFS_PROOF.md',
  'metadata-demo.js',
  'pet-demo-workflow.js',
  'pet-registration-example.js',
  'ppt-report.js',
  'practical-pet-lookup.js',
  'PRESENTATION_SLIDES.md',
  'presentation-visual-proof.html',
  'quick-photo-upload.js',
  'real-ipfs-demo.js',
  'register-pet-demo.js',
  'retrieve-pet-info.js',
  'simple-demo.js',
  'simple-env-update.js',
  'simple-metadata-demo.js',
  'simple-pet-retrieval.js',
  'simple-pet-workflow.js',
  'simple-real-upload.js',
  'test-ipfs-now.js',
  'test-metadata-upload.js',
  'test-secure-upload.js',
  'test-upload.js',
  'upload-photo-demo.js',
  'VISUAL_PROOF_SUMMARY.md',
  'working-cids-demo.js',
  
  // Unnecessary backend files
  'backend/working-server.js',
  
  // This cleanup script itself
  'cleanup-files.js'
];

let deletedCount = 0;
let totalSize = 0;

filesToDelete.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted: ${filePath} (${(stats.size / 1024).toFixed(1)} KB)`);
      deletedCount++;
    } else {
      console.log(`⚠️ Not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Failed to delete ${filePath}:`, error.message);
  }
});

console.log('\n🎯 CLEANUP SUMMARY:');
console.log('════════════════════════════════════════════════════════════════');
console.log(`✅ Files deleted: ${deletedCount}`);
console.log(`💾 Space freed: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
console.log('');
console.log('🚀 REMAINING ESSENTIAL FILES:');
console.log('────────────────────────────────────────────────────────────────');
console.log('✅ backend/secure-pet-server.js - Your secure encrypt-upload server');
console.log('✅ backend/enhanced-server.js - Original backend');
console.log('✅ backend/index.js - Complete workflow example');
console.log('✅ encryption/ - AES-256-GCM encryption system');
console.log('✅ ipfs/upload.js - IPFS upload functions');
console.log('✅ contracts/ - Smart contract');
console.log('✅ website/ - React frontend');
console.log('✅ photos/ - Test images');
console.log('');
console.log('🎉 Project cleaned up! Only essential files remain.');

export default { deletedCount, totalSize };
