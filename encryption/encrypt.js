// encryption/encrypt.js
import fs from "fs";
import path from "path";
import crypto from "crypto";

// === ENCRYPTION SETTINGS ===
const algorithm = "aes-256-cbc";

/**
 * Encrypts a file at inputPath → outputPath, and logs key+IV to keyPath.
 *
 * @param {string} inputPath   - Path to plaintext (e.g. nose-print) image
 * @param {string} outputPath  - Where to write encrypted data (e.g. encrypted.bin)
 * @param {string} keyPath     - File to append key+IV info (e.g. keys.txt)
 */
export function encryptImage(inputPath, outputPath, keyPath) {
  // generate random key & iv
  const key = crypto.randomBytes(32);
  const iv  = crypto.randomBytes(16);

  const absIn  = path.isAbsolute(inputPath)  ? inputPath  : path.join(process.cwd(), inputPath);
  const absOut = path.isAbsolute(outputPath) ? outputPath : path.join(process.cwd(), outputPath);

  if (!fs.existsSync(absIn)) {
    throw new Error("Input file not found: " + absIn);
  }

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const input  = fs.createReadStream(absIn);
  const output = fs.createWriteStream(absOut);

  input.pipe(cipher).pipe(output);

  output.on("close", () => {
    const record = [
      `File: ${path.basename(absIn)}`,
      `Key:  ${key.toString("hex")}`,
      `IV:   ${iv.toString("hex")}`,
      `Timestamp: ${new Date().toISOString()}`,
      ""
    ].join("\n");
    fs.appendFileSync(keyPath, record);
    console.log(`✅ Encrypted ${absIn} → ${absOut}`);
    console.log(`🔑 Key+IV logged to ${keyPath}`);
  });
}

// If you want to run this file directly:
// node encryption/encrypt.js <inputPath> <outputPath> <keyPath>
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, inP, outP, kP] = process.argv;
  if (!inP || !outP || !kP) {
    console.error("Usage: node encrypt.js <input> <output> <keyLog>");
    process.exit(1);
  }
  encryptImage(inP, outP, kP);
}
