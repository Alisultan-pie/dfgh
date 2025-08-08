// encryption/decrypt.js
import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Decrypts a GCM-encrypted file.
 * @param {string} inputPath - path to encrypted file (ciphertext only)
 * @param {string} outputPath - where to write plaintext
 * @param {string} keyHex - 64-hex chars (32 bytes)
 * @param {string} ivHex - 24-hex chars (12 bytes)
 * @param {string} tagHex - 32-hex chars (16 bytes auth tag)
 */
export function decryptImage(inputPath, outputPath, keyHex, ivHex, tagHex) {
  const key = Buffer.from(keyHex, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");

  if (key.length !== 32) throw new Error("Key must be 32 bytes (64 hex chars)");
  if (iv.length !== 12) throw new Error("IV must be 12 bytes (24 hex chars) for GCM");
  if (tag.length !== 16) throw new Error("Auth tag must be 16 bytes (32 hex chars)");

  const ciphertext = fs.readFileSync(inputPath);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  fs.writeFileSync(outputPath, plaintext);
}

// CLI: node encryption/decrypt.js <encrypted> <decrypted> <keyHex> <ivHex> <tagHex>
if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , inP, outP, keyHex, ivHex, tagHex] = process.argv;
  if (!inP || !outP || !keyHex || !ivHex || !tagHex) {
    console.error("Usage: node encryption/decrypt.js <encrypted> <decrypted> <keyHex> <ivHex> <tagHex>");
    process.exit(1);
  }
  try {
    decryptImage(inP, outP, keyHex, ivHex, tagHex);
    console.log(`✅ Decrypted → ${outP}`);
  } catch (err) {
    console.error("❌ Decryption failed:", err.message);
    process.exit(1);
  }
}
