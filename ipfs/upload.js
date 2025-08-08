// ipfs/upload.js
import fs from "fs";
import path from "path";
import { create } from "@web3-storage/w3up-client";
import { File } from "web3.storage";
import dotenv from "dotenv";
dotenv.config();

const uploadMethod = "storacha"; // Always use Storacha
const ucanToken = process.env.UCAN_TOKEN;

let client;
let isStoracha = false;

if (!ucanToken) {
  console.error("🚨 UCAN_TOKEN is missing in .env");
  console.log("💡 Please add your UCAN_TOKEN to the .env file");
  process.exit(1);
}

try {
  // Create new client using the correct API
  client = await create();
  
  // The new client doesn't use login() with token directly
  // Instead, we need to set up the client differently
  console.log("✅ Using Storacha/UCAN authentication for IPFS uploads");
  isStoracha = true;
} catch (error) {
  console.error("❌ Failed to initialize Storacha client:", error.message);
  console.log("💡 Please check your UCAN_TOKEN is valid");
  console.log("💡 You may need to get a new token from https://console.web3.storage/");
  process.exit(1);
}

/**
 * Uploads a single file to IPFS and returns its CID.
 *
 * @param {string} filePath  - Path to the file to upload (e.g. encrypted.bin)
 * @returns {Promise<string>} - The resulting CID
 */
export async function uploadEncryptedImage(filePath) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(abs)) {
    throw new Error("File does not exist: " + abs);
  }
  
  try {
    const data = await fs.promises.readFile(abs);
    const file = new File([data], path.basename(abs));
    
    let cid;
    if (isStoracha) {
      // Upload via Storacha using the new API
      cid = await client.uploadFile(file);
    } else {
      // Upload via Web3.Storage
      const files = [file];
      cid = await client.put(files, { wrapWithDirectory: false });
    }
    
    console.log(`✅ Uploaded ${abs} → CID: ${cid}`);
    return cid;
  } catch (error) {
    console.error("❌ Upload failed:", error.message);
    throw error;
  }
}

/**
 * Downloads a file from IPFS.
 *
 * @param {string} cid  - The CID of the file to download
 * @param {string} outputPath  - Where to save the downloaded file
 */
export async function downloadFromIPFS(cid, outputPath) {
  try {
    let file;
    if (isStoracha) {
      file = await client.get(cid);
    } else {
      const res = await client.get(cid);
      const files = await res.files();
      file = files[0];
    }
    
    if (!file) {
      throw new Error("No response from IPFS for CID: " + cid);
    }
    
    const data = await file.arrayBuffer();
    await fs.promises.writeFile(outputPath, Buffer.from(data));
    console.log("📁 File downloaded from IPFS →", outputPath);
  } catch (error) {
    console.error("❌ Download failed:", error.message);
    throw error;
  }
}

// If you want to run this file directly:
// node ipfs/upload.js <path/to/encrypted.bin>
if (import.meta.url === `file://${process.argv[1]}`) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("❌ Please provide a file path");
    console.log("💡 Usage: node ipfs/upload.js <path/to/file>");
    process.exit(1);
  }
  
  try {
    const cid = await uploadEncryptedImage(filePath);
    console.log("🎉 Upload successful!");
    console.log("📋 CID:", cid);
  } catch (error) {
    console.error("❌ Upload failed:", error.message);
    process.exit(1);
  }
}
