// Import built-in Node.js modules
const fs = require('fs');              // For file reading/writing
const crypto = require('crypto');      // For encryption
const path = require('path');          // For safe file paths

// === ENCRYPTION SETTINGS ===
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);    // 256-bit key
const iv = crypto.randomBytes(16);     // 128-bit IV

// === FILE PATHS ===

// Input image you want to encrypt (make sure it exists!)
const inputFilePath = path.join(__dirname, '..', 'photos', 'premium_photo-1666672388644-2d99f3feb9f1.jpg');

// Where to save the encrypted image
const outputFilePath = path.join(__dirname, '..', 'nos_encrypted.jpg');

// Where to store the encryption key + IV
const keyOutputPath = path.join(__dirname, 'keys.txt');

// === ENCRYPTION FUNCTION ===
function encryptFile(inputPath, outputPath, keyPath) {
  // Check that input file exists
  if (!fs.existsSync(inputPath)) {
    console.error('❌ Input file not found:', inputPath);
    return;
  }

  console.log('🔒 Starting encryption...');
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);

  // Error handling for streams
  input.on('error', (err) => {
    console.error('❌ Input file read error:', err.message);
  });
  output.on('error', (err) => {
    console.error('❌ Output file write error:', err.message);
  });
  cipher.on('error', (err) => {
    console.error('❌ Encryption error:', err.message);
  });

  // Pipe and wait for 'close' event
  input.pipe(cipher).pipe(output);

  output.on('close', () => {
    console.log('✅ Image encrypted and saved at:', outputPath);
    const fileName = path.basename(inputPath);
    const timestamp = new Date().toISOString();
    const keyData =
      `📸 File: ${fileName}\n` +
      `🔐 AES-256 Key: ${key.toString('hex')}\n` +
      `🧪 IV: ${iv.toString('hex')}\n` +
      `📅 Timestamp: ${timestamp}\n\n`;
    try {
      fs.writeFileSync(keyPath, keyData, { flag: 'a' });
      console.log('📁 Key + IV saved to:', keyPath);
    } catch (err) {
      console.error('❌ Failed to write keys:', err.message);
    }
  });
}

// === RUN SCRIPT ===
try {
  encryptFile(inputFilePath, outputFilePath, keyOutputPath);
} catch (err) {
  console.error('❌ Unexpected encryption error:', err.message);
}
