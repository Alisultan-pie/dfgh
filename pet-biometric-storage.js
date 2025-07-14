// pet-biometric-storage.js
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { encryptImage } = require('./encryption/encrypt');
const { uploadEncryptedImage } = require('./ipfs/upload');
const { logToBlockchain } = require('./backend/index'); // assume you exported it there

/**
 * Full “store pet” flow.
 * @param {string} petId
 * @param {string} inputImagePath  Path to the raw nose-print image
 * @returns {Promise<{ cid: string, txHash: string }>}
 */
async function storePet(petId, inputImagePath) {
  // 1. Encrypt
  const encryptedFilename = `${petId}_encrypted.jpg`;
  const encryptedPath = path.join(__dirname, 'encryption', encryptedFilename);
  await encryptImage(inputImagePath, encryptedPath);
  console.log(`🔐 Encrypted image written to ${encryptedPath}`);

  // 2. Upload to IPFS
  const cid = await uploadEncryptedImage(path.relative(__dirname, encryptedPath));
  console.log(`🚀 Uploaded to IPFS: CID=${cid}`);

  // 3. Log on-chain
  const timestamp = Math.floor(Date.now() / 1000);
  const txHash = await logToBlockchain(petId, cid, timestamp);
  console.log(`✅ Logged on chain: txHash=${txHash}`);

  return { cid, txHash };
}

module.exports = { storePet };
