/**
 * Real IPFS Integration - No Fake CIDs
 * 
 * Uses Storacha (w3up) or Web3.Storage for authentic IPFS uploads
 */

import { create as createStoracha } from '@storacha/client';
import { File } from 'web3.storage'; // Node File polyfill
import { CID } from 'multiformats/cid';

let client = null;
let ready = false;
let ipfsMode = 'not_configured';

export async function initIPFS() {
  const useStoracha = process.env.UPLOAD_AUTH_METHOD === 'storacha' || 
                      process.env.W3UP_SPACE_DID || 
                      process.env.W3UP_PROOF ||
                      process.env.UCAN_TOKEN ||
                      process.env.VITE_UCAN_TOKEN;

  if (useStoracha) {
    // Storacha/w3up path
    const spaceDid = process.env.W3UP_SPACE_DID;
    const proofRaw = process.env.W3UP_PROOF || process.env.VITE_UCAN_TOKEN || process.env.UCAN_TOKEN;
    
    if (!spaceDid && !proofRaw) {
      console.warn('🔴 IPFS not configured: missing W3UP_SPACE_DID/W3UP_PROOF or UCAN_TOKEN');
      ready = false;
      ipfsMode = 'missing_credentials';
      return;
    }

    try {
      console.log('🔄 Initializing Storacha client...');
      client = await createStoracha();

      if (proofRaw && !spaceDid) {
        // UCAN token path
        console.log('📝 Using UCAN token authentication');
        let proof = proofRaw;
        try { proof = JSON.parse(proofRaw); } catch { /* token string is fine */ }
        await client.addProof(proof);
        ipfsMode = 'storacha_ucan';
      } else if (spaceDid && proofRaw) {
        // Space + Proof path
        console.log('📝 Using Space + Proof authentication');
        let proof = proofRaw;
        try { proof = JSON.parse(proofRaw); } catch { /* might be string */ }
        
        await client.addSpace(spaceDid);
        await client.addProof(proof);
        await client.setCurrentSpace(spaceDid);
        ipfsMode = 'storacha_space';
      } else {
        throw new Error('Invalid Storacha configuration');
      }

      ready = true;
      console.log('✅ Storacha client initialized successfully');
      
    } catch (error) {
      console.error('❌ Storacha initialization failed:', error.message);
      ready = false;
      ipfsMode = 'storacha_error';
    }
    
  } else if (process.env.WEB3_STORAGE_TOKEN) {
    // Web3.Storage token path
    try {
      console.log('🔄 Initializing Web3.Storage client...');
      const { Web3Storage } = await import('web3.storage');
      client = new Web3Storage({ token: process.env.WEB3_STORAGE_TOKEN });
      ready = true;
      ipfsMode = 'web3storage';
      console.log('✅ Web3.Storage client initialized successfully');
    } catch (error) {
      console.error('❌ Web3.Storage initialization failed:', error.message);
      ready = false;
      ipfsMode = 'web3storage_error';
    }
    
  } else {
    console.warn('🔴 No IPFS credentials found');
    console.warn('   Set one of:');
    console.warn('   - W3UP_SPACE_DID + W3UP_PROOF (Storacha Space + Proof)');
    console.warn('   - UCAN_TOKEN (Storacha UCAN token)');
    console.warn('   - WEB3_STORAGE_TOKEN (Web3.Storage API token)');
    ready = false;
    ipfsMode = 'no_credentials';
  }
}

export function requireRealIPFS(req, res, next) {
  if (!ready || !client) {
    return res.status(422).json({
      success: false,
      error: 'IPFS_NOT_CONFIGURED',
      details: 'Real IPFS credentials required. Provide W3UP_SPACE_DID + W3UP_PROOF, UCAN_TOKEN, or WEB3_STORAGE_TOKEN.',
      mode: ipfsMode
    });
  }
  next();
}

export async function uploadBufferToIPFS(buffer, filename = 'data.bin') {
  if (!ready || !client) {
    throw new Error('IPFS not initialized - call initIPFS() first');
  }

  console.log(`📤 Uploading to IPFS: ${filename} (${buffer.length} bytes)`);

  try {
    // Create File object (works in Node via polyfill)
    const file = new File([buffer], filename);

    let cid;
    
    // Storacha client exposes uploadFile; Web3.Storage uses put()
    if (typeof client.uploadFile === 'function') {
      console.log('🌐 Using Storacha uploadFile...');
      cid = await client.uploadFile(file);
    } else if (typeof client.put === 'function') {
      console.log('🌐 Using Web3.Storage put...');
      cid = await client.put([file], { wrapWithDirectory: false });
    } else {
      throw new Error('Unknown IPFS client type');
    }

    // Validate it's a real CID
    const cidString = String(cid);
    CID.parse(cidString); // This will throw if invalid
    
    console.log(`✅ IPFS upload successful: ${cidString}`);
    console.log(`🔗 Gateway URL: https://ipfs.io/ipfs/${cidString}`);
    
    return cidString;
    
  } catch (error) {
    console.error('❌ IPFS upload failed:', error.message);
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
}

export function getIPFSStatus() {
  return {
    ready,
    mode: ipfsMode,
    hasClient: !!client
  };
}
