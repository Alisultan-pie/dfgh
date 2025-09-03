// Simple Storacha upload test using Node 18+ (global fetch/FormData/Blob)
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { create } from '@storacha/client';
import { File } from 'web3.storage';

async function main() {
  try {
    const spaceDid = process.env.W3UP_SPACE_DID;
    const proofRaw = process.env.W3UP_PROOF;
    if (!spaceDid || !proofRaw) {
      console.error('W3UP_SPACE_DID and W3UP_PROOF are required in .env');
      process.exit(1);
    }

    const fileArg = process.argv[2] || 'photos/Cat03.jpg';
    const filePath = path.resolve(fileArg);
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      process.exit(1);
    }

    const data = await fs.promises.readFile(filePath);
    const file = new File([data], path.basename(filePath));

    const client = await create();
    let proof;
    try {
      proof = JSON.parse(proofRaw);
    } catch {
      proof = proofRaw;
    }
    await client.addSpace(spaceDid);
    await client.addProof(proof);
    await client.setCurrentSpace(spaceDid);

    const cid = await client.uploadFile(file);
    console.log('CID:', cid);
  } catch (err) {
    console.error('Error:', err?.message || err);
    process.exit(1);
  }
}

await main();


