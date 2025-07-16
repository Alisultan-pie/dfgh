// backend/index.js

const path = require('path');
const fs = require('fs');
// note: adjust this if you used `module.exports = uploadEncryptedImage`
const { uploadEncryptedImage } = require('../ipfs/upload');
const { ethers } = require('ethers');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const crypto = require('crypto');
const { Web3Storage } = require('web3.storage');

// === CONFIGURATION ===
const PET_ID = 'pet123';
const ENCRYPTED_IMAGE_PATH = path.join(__dirname, '..', 'encryption', 'nose_encrypted.jpg');
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ABI = require('./PetStorageABI.json');
const PROVIDER_URL = process.env.PROVIDER_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WEB3STORAGE_TOKEN = process.env.WEB3STORAGE_TOKEN;
const web3Client = new Web3Storage({ token: WEB3STORAGE_TOKEN });

async function logToBlockchain(petId, cid, timestamp) {
  const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
  const tx = await contract.logPetData(petId, cid, timestamp);
  await tx.wait();
  console.log(`✅ Logged to blockchain. Tx hash: ${tx.hash}`);
  return tx.hash;
}

async function saveToMongoDB(petId, cid, timestamp) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not set in .env');
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const pets = db.collection('pets');
    await pets.insertOne({ petId, cid, timestamp, createdAt: new Date() });
    console.log('✅ Saved to MongoDB:', { petId, cid, timestamp });
  } catch (err) {
    console.error('❌ MongoDB error:', err);
  } finally {
    await client.close();
  }
}

async function downloadFromIPFS(cid, outputPath) {
  const res = await web3Client.get(cid);
  if (!res) throw new Error('No response from IPFS for CID: ' + cid);
  const files = await res.files();
  if (!files.length) throw new Error('No files found in IPFS response for CID: ' + cid);
  const file = files[0];
  const stream = fs.createWriteStream(outputPath);
  stream.write(Buffer.from(await file.arrayBuffer()));
  stream.close();
  console.log('📁 File downloaded from IPFS →', outputPath);
}

function computeFileHash(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

async function getPetFromMongoDB(petId) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not set in .env');
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const pets = db.collection('pets');
    const pet = await pets.findOne({ petId });
    if (pet) {
      console.log('🔎 Retrieved from MongoDB:', pet);
    } else {
      console.log('ℹ️ No record found in MongoDB for petId:', petId);
    }
    return pet;
  } catch (err) {
    console.error('❌ MongoDB retrieval error:', err);
  } finally {
    await client.close();
  }
}

async function main() {
  // 1. Ensure encryption already ran
  if (!fs.existsSync(ENCRYPTED_IMAGE_PATH)) {
    console.error('❌ Encrypted image not found. Run the encryption script first.');
    return;
  }

  // Compute hash before upload
  const originalHash = computeFileHash(ENCRYPTED_IMAGE_PATH);
  console.log('🔑 SHA-256 hash before IPFS upload:', originalHash);

  // 2. Upload to IPFS
  const cid = await uploadEncryptedImage(ENCRYPTED_IMAGE_PATH);
  const timestamp = Math.floor(Date.now() / 1000);

  // 3. Log to blockchain
  await logToBlockchain(PET_ID, cid, timestamp);

  // 4. Save to MongoDB
  await saveToMongoDB(PET_ID, cid, timestamp);

  // 5. Download from IPFS and verify hash
  const downloadedPath = path.join(__dirname, '..', 'downloaded_encrypted.jpg');
  await downloadFromIPFS(cid, downloadedPath);
  const downloadedHash = computeFileHash(downloadedPath);
  console.log('🔑 SHA-256 hash after IPFS download:', downloadedHash);
  if (originalHash === downloadedHash) {
    console.log('✅ File integrity verified: hashes match');
  } else {
    console.warn('⚠️ File integrity check failed: hashes do not match!');
  }

  // 6. Retrieve and log from MongoDB
  await getPetFromMongoDB(PET_ID);
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ Backend process failed:', err);
  });
}
