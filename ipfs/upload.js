// ipfs/upload.js
import fs from "fs";
import path from "path";
import { create } from "@storacha/client";
import { File } from "web3.storage";
import dotenv from "dotenv";
dotenv.config();

const uploadMethod = "storacha"; // Always use Storacha

let client;
let isStoracha = false;

try {
  client = await create();

  // Configure space/proof from environment
  const spaceDid = process.env.W3UP_SPACE_DID || process.env.VITE_UCAN_TOKEN;
  const proofRaw = process.env.W3UP_PROOF || process.env.VITE_UCAN_TOKEN;
  if (!spaceDid || !proofRaw) {
    throw new Error(
      "W3UP_SPACE_DID and W3UP_PROOF are required. Generate them in Storacha Console or via w3cli."
    );
  }

  // Support JSON proof or base64/compact string
  let proof;
  try {
    proof = JSON.parse(proofRaw);
  } catch {
    proof = proofRaw;
  }

  await client.addSpace(spaceDid);
  await client.addProof(proof);
  await client.setCurrentSpace(spaceDid);

  console.log("✅ Storacha space configured:", spaceDid);
  isStoracha = true;
} catch (error) {
  console.error("❌ Failed to initialize Storacha client:", error.message);
  console.error(
    "Set W3UP_SPACE_DID and W3UP_PROOF in your .env (root) or use w3cli/console to obtain them."
  );
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
      throw new Error("Storacha client not initialized");
    }
    
    console.log(`✅ Uploaded ${abs} → CID: ${cid}`);
    return cid;
  } catch (error) {
    console.error("❌ Upload failed:", error.message);
    throw error;
  }
}

/**
 * Uploads pet metadata as JSON to IPFS and returns its CID.
 *
 * @param {Object} metadata - Pet metadata object
 * @returns {Promise<string>} - The resulting CID for the metadata
 */
export async function uploadPetMetadata(metadata) {
  try {
    // Create a comprehensive metadata object
    const petMetadata = {
      ...metadata,
      uploadedAt: new Date().toISOString(),
      version: "1.0",
      type: "pet-metadata"
    };
    
    // Convert to JSON and create a file
    const jsonData = JSON.stringify(petMetadata, null, 2);
    const metadataFile = new File([jsonData], `pet-metadata-${metadata.petId || Date.now()}.json`, {
      type: 'application/json'
    });
    
    let cid;
    if (isStoracha) {
      // Upload metadata to IPFS
      cid = await client.uploadFile(metadataFile);
    } else {
      throw new Error("Storacha client not initialized");
    }
    
    console.log(`✅ Pet metadata uploaded → CID: ${cid}`);
    console.log(`📋 Metadata includes: ${Object.keys(petMetadata).join(', ')}`);
    return cid;
  } catch (error) {
    console.error("❌ Metadata upload failed:", error.message);
    throw error;
  }
}

/**
 * Uploads both pet photo and metadata to IPFS
 *
 * @param {string} filePath - Path to the pet photo
 * @param {Object} metadata - Pet metadata object
 * @returns {Promise<Object>} - Object containing both CIDs
 */
export async function uploadPetComplete(filePath, metadata) {
  try {
    console.log(`🐕 Uploading complete pet data for: ${metadata.name || 'Unknown Pet'}`);
    
    // Upload photo first
    console.log(`📸 Step 1: Uploading pet photo...`);
    const photoCID = await uploadEncryptedImage(filePath);
    
    // Add photo CID to metadata
    const enhancedMetadata = {
      ...metadata,
      photoCID: photoCID,
      photoIPFSUrl: `https://ipfs.io/ipfs/${photoCID}`
    };
    
    // Upload metadata
    console.log(`📋 Step 2: Uploading pet metadata...`);
    const metadataCID = await uploadPetMetadata(enhancedMetadata);
    
    console.log(`✅ Complete pet data uploaded successfully!`);
    console.log(`📸 Photo CID: ${photoCID}`);
    console.log(`📋 Metadata CID: ${metadataCID}`);
    
    return {
      photoCID,
      metadataCID,
      photoIPFSUrl: `https://ipfs.io/ipfs/${photoCID}`,
      metadataIPFSUrl: `https://ipfs.io/ipfs/${metadataCID}`,
      metadata: enhancedMetadata
    };
  } catch (error) {
    console.error("❌ Complete pet upload failed:", error.message);
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
      throw new Error("Storacha client not initialized");
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
