// Backend orchestration: encrypt, upload to IPFS, log to blockchain
const path = require('path');
const fs = require('fs');
const uploadToIPFS = require('../ipfs/upload');
const { ethers } = require('ethers');

// === CONFIGURATION ===
const PET_ID = 'pet123'; // Example Pet ID
const ENCRYPTED_IMAGE_PATH = path.join(__dirname, '..', 'nose_encrypted.jpg');
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || 'YOUR_CONTRACT_ADDRESS';
const CONTRACT_ABI = require('./PetStorageABI.json'); // Place ABI JSON in backend/
const PROVIDER_URL = process.env.PROVIDER_URL || 'https://rpc-mumbai.maticvigil.com';
const PRIVATE_KEY = process.env.PRIVATE_KEY || 'YOUR_WALLET_PRIVATE_KEY';

async function logToBlockchain(petId, cid, timestamp) {
  const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
  const tx = await contract.logPetData(petId, cid, timestamp);
  await tx.wait();
  console.log(`✅ Logged to blockchain. Tx hash: ${tx.hash}`);
  return tx.hash;
}

async function main() {
  // 1. Check encrypted image exists
  if (!fs.existsSync(ENCRYPTED_IMAGE_PATH)) {
    console.error('❌ Encrypted image not found. Please run encryption first.');
    return;
  }

  // 2. Upload to IPFS
  const cid = await uploadToIPFS(ENCRYPTED_IMAGE_PATH);
  const timestamp = Math.floor(Date.now() / 1000);

  // 3. Log to blockchain
  await logToBlockchain(PET_ID, cid, timestamp);
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ Backend process failed:', err);
  });
}
