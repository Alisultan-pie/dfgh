// encryption/encrypt.js
import fs from "fs";
import path from "path";
import crypto from "crypto";

// === ENCRYPTION SETTINGS ===
const algorithm = "aes-256-gcm";

/**
 * Encrypts a file at inputPath → outputPath, and logs key+IV+TAG to keyPath.
 * Uses AES-256-GCM for confidentiality and integrity.
 *
 * @param {string} inputPath   - Path to plaintext (e.g. nose-print) image
 * @param {string} outputPath  - Where to write encrypted data (e.g. encrypted.bin)
 * @param {string} keyPath     - File to append key+IV+TAG info (e.g. keys.txt)
 */
export function encryptImage(inputPath, outputPath, keyPath) {
  const key = crypto.randomBytes(32); // 256-bit
  const iv = crypto.randomBytes(12);  // 96-bit IV recommended for GCM

  const absIn = path.isAbsolute(inputPath) ? inputPath : path.join(process.cwd(), inputPath);
  const absOut = path.isAbsolute(outputPath) ? outputPath : path.join(process.cwd(), outputPath);

  if (!fs.existsSync(absIn)) {
    throw new Error("Input file not found: " + absIn);
  }

  const plaintext = fs.readFileSync(absIn);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  fs.writeFileSync(absOut, ciphertext);

  const record = [
    `File: ${path.basename(absIn)}`,
    `Algo: ${algorithm}`,
    `Key:  ${key.toString("hex")}`,
    `IV:   ${iv.toString("hex")}`,
    `TAG:  ${authTag.toString("hex")}`,
    `Timestamp: ${new Date().toISOString()}`,
    ""
  ].join("\n");
  fs.appendFileSync(keyPath, record);
  console.log(`✅ Encrypted ${absIn} → ${absOut}`);
  console.log(`🔑 Key/IV/TAG logged to ${keyPath}`);
}

// If you want to run this file directly:
// node encryption/encrypt.js <inputPath> <outputPath> <keyPath>
if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , inP, outP, kP] = process.argv;
  if (!inP || !outP || !kP) {
    console.error("Usage: node encryption/encrypt.js <input> <output> <keyLog>");
    process.exit(1);
  }
  encryptImage(inP, outP, kP);
}
