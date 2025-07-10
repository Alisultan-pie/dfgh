// IPFS upload logic using Web3.Storage
const { Web3Storage, getFilesFromPath } = require('web3.storage');
const path = require('path');

// TODO: Set your Web3.Storage API token here
const WEB3STORAGE_TOKEN = process.env.WEB3STORAGE_TOKEN || 'YOUR_WEB3STORAGE_API_TOKEN';

if (WEB3STORAGE_TOKEN === 'YOUR_WEB3STORAGE_API_TOKEN') {
  console.warn('⚠️  Please set your Web3.Storage API token in WEB3STORAGE_TOKEN or as an environment variable.');
}

const client = new Web3Storage({ token: WEB3STORAGE_TOKEN });

async function uploadToIPFS(filePath) {
  try {
    const files = await getFilesFromPath(filePath);
    const cid = await client.put(files);
    console.log(`✅ Uploaded to IPFS. CID: ${cid}`);
    return cid;
  } catch (err) {
    console.error('❌ IPFS upload failed:', err.message);
    throw err;
  }
}

module.exports = uploadToIPFS;
