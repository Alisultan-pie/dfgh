// watcher.js – auto-encrypt, upload to Web3.Storage & store CID on-chain
import chokidar from "chokidar";
import path from "path";
import dotenv from "dotenv";
import { encryptImage } from "./encryption/encrypt.js";
import { uploadEncryptedImage } from "./ipfs/upload.js";
import { ethers } from "ethers";
import fs from "fs";

dotenv.config();

const INCOMING_DIR = "./incoming";       // plaintext images live here
const KEY_LOG      = "keys.txt";          // append key+IV entries

// initialise ethers
const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);
const wallet   = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const abi      = JSON.parse(fs.readFileSync("./PetStorageABI.json"));
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

async function processFile(filePath) {
  try {
    const ext    = path.extname(filePath);                // .png → .bin
    const petId  = path.basename(filePath, ext);          // e.g. pet123
    const encOut = path.join(path.dirname(filePath), `${petId}.bin`);

    // 1) encrypt
    await encryptImage(filePath, encOut, KEY_LOG);

    // 2) upload → IPFS
    const cid = await uploadEncryptedImage(encOut);

    // 3) store CID on-chain
    const tx = await contract.setPetData(petId, cid);
    console.log(`[${petId}] TX sent:`, tx.hash);
    await tx.wait();
    console.log(`[${petId}] ✅ CID stored →`, cid);
  } catch (err) {
    console.error("[ERROR]", err.message);
  }
}

// Watch the folder (ignore existing files)
chokidar.watch(INCOMING_DIR, { ignoreInitial: true })
  .on("add", file => processFile(file));

console.log("👀 Watching", INCOMING_DIR); 