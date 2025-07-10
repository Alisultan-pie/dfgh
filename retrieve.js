// Retrieves pet data from blockchain, downloads from IPFS, and decrypts
require("dotenv").config();
const { Web3Storage, File } = require("web3.storage");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// === CONFIG ===
const PET_ID = "pet123";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PROVIDER_URL = process.env.PROVIDER_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ABI = require("./PetStorageABI.json");
const WEB3STORAGE_TOKEN = process.env.WEB3STORAGE_TOKEN;

const client = new Web3Storage({ token: WEB3STORAGE_TOKEN });

async function getCIDFromContract(petId) {
  const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
  const [cid, timestamp] = await contract.getPetData(petId);
  console.log("📦 Retrieved CID from blockchain:", cid);
  return cid;
}

async function downloadFromIPFS(cid, outputPath) {
  const res = await client.get(cid);
  const files = await res.files();
  const file = files[0];
  const stream = fs.createWriteStream(outputPath);
  stream.write(await file.arrayBuffer());
  stream.close();
  console.log("📁 File downloaded from IPFS →", outputPath);
}

function getKeyAndIV(petId) {
  const keyFile = path.join(__dirname, "../encryption/keys.txt");
  const content = fs.readFileSync(keyFile, "utf-8");
  const entries = content.trim().split("\n\n");
  for (const block of entries) {
    if (block.includes(petId)) {
      const key = block.match(/Key: (.*)/)[1];
      const iv = block.match(/IV: (.*)/)[1];
      return { key: Buffer.from(key, "hex"), iv: Buffer.from(iv, "hex") };
    }
  }
  throw new Error("❌ Key/IV not found for petId: " + petId);
}

function decryptFile(encryptedPath, decryptedPath, key, iv) {
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const input = fs.createReadStream(encryptedPath);
  const output = fs.createWriteStream(decryptedPath);

  input.pipe(decipher).pipe(output);

  output.on("finish", () => {
    console.log("🔓 Decryption complete →", decryptedPath);
  });
}

async function main() {
  const cid = await getCIDFromContract(PET_ID);
  const encryptedPath = path.join(__dirname, "../downloaded_encrypted.jpg");
  const decryptedPath = path.join(__dirname, "../downloaded_decrypted.jpg");

  await downloadFromIPFS(cid, encryptedPath);

  const { key, iv } = getKeyAndIV(PET_ID);
  decryptFile(encryptedPath, decryptedPath, key, iv);
}

main().catch((err) => {
  console.error("❌ Retrieval failed:", err);
});
