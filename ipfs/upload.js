// ipfs/upload.js
const { W3upClient } = require('@web3-storage/w3up-client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// initialize the client with your token
const client = new W3upClient({ token: process.env.WEB3STORAGE_TOKEN });

/**
 * Uploads a single file to Web3.Storage (IPFS) and returns its CID.
 * @param {string} filePath  Absolute or relative path to the file.
 * @returns {Promise<string>}  The CID of the uploaded file.
 */
async function uploadEncryptedImage(filePath) {
  // read the encrypted file into memory
  const fullPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(__dirname, filePath);

  const data = fs.readFileSync(fullPath);
  const files = [{ name: path.basename(fullPath), data }];

  // put() returns the CID
  const cid = await client.put(files, { wrapWithDirectory: false });
  console.log('🚀 Uploaded to IPFS, CID:', cid);
  return cid;
}

module.exports = { uploadEncryptedImage };
