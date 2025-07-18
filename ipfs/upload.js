// ipfs/upload.js
import fs from "fs";
import path from "path";
import { Web3Storage, File } from "web3.storage";
import dotenv from "dotenv";
dotenv.config();

const token = process.env.WEB3STORAGE_TOKEN;
if (!token) {
  console.error("🚨 Missing WEB3STORAGE_TOKEN in .env");
  process.exit(1);
}

const client = new Web3Storage({ token });

/**
 * Uploads a single file to Web3.Storage (IPFS) and returns its CID.
 *
 * @param {string} filePath  - Path to the file to upload (e.g. encrypted.bin)
 * @returns {Promise<string>} - The resulting CID
 */
export async function uploadEncryptedImage(filePath) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(abs)) {
    throw new Error("File does not exist: " + abs);
  }
  const data  = await fs.promises.readFile(abs);
  const files = [ new File([data], path.basename(abs)) ];
  const cid   = await client.put(files, { wrapWithDirectory: false });
  console.log(`✅ Uploaded ${abs} → CID: ${cid}`);
  return cid;
}

// If you want to run this file directly:
// node ipfs/upload.js <path/to/encrypted.bin>
if (import.meta.url === `file://${process.argv[1]}`) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: node upload.js <path/to/encrypted.bin>");
    process.exit(1);
  }
  uploadEncryptedImage(filePath).catch(err => {
    console.error("❌ Upload failed:", err);
    process.exit(1);
  });
}
