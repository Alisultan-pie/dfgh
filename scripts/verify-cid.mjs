#!/usr/bin/env node
/**
 * CID Gateway Verifier - Validates CIDs and checks IPFS gateway accessibility
 */
import { CID } from 'multiformats/cid';
import https from 'https';

const cid = (process.argv[2] || '').trim();
if (!cid) { 
  console.error('Usage: node scripts/verify-cid.mjs <cid>'); 
  process.exit(2); 
}

try { 
  CID.parse(cid); 
  console.log(`✅ Valid CID format: ${cid}`);
} catch (e) { 
  console.error(`❌ Not a valid CID: ${e.message}`); 
  process.exit(1); 
}

const url = `https://ipfs.io/ipfs/${cid}`;
console.log(`🔍 Checking gateway accessibility: ${url}`);

https.get(url, res => {
  console.log(`🌐 Gateway response: ${res.statusCode} ${res.statusMessage}`);
  
  if (res.statusCode === 200) {
    console.log('✅ CID is accessible via IPFS gateway');
    process.exit(0);
  } else if (res.statusCode === 404) {
    console.log('⚠️  CID not found on gateway (may still be valid but not pinned)');
    process.exit(0);
  } else {
    console.log(`❌ Gateway error: ${res.statusCode}`);
    process.exit(1);
  }
}).on('error', e => { 
  console.error(`❌ Gateway error: ${e.message}`); 
  process.exit(1); 
});
