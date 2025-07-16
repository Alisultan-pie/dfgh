const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// === SETTINGS ===
// Replace these with your saved key and IV from keys.txt
const keyHex = 'bbdcb09c0b2d548b4458cbbdba92f0bf3fb9e688f6293c3cec88301cb5efef58';
const ivHex = '07223d3394f1ddc77e293b4b221abb0a';

const key = Buffer.from(keyHex, 'hex');
const iv = Buffer.from(ivHex, 'hex');

// === FILE PATHS ===
const encryptedFilePath = path.join(__dirname, '..', 'nose_encrypted.jpg'); // input
const decryptedOutputPath = path.join(__dirname, '..', 'nose_decrypted.jpg'); // output

// === DECRYPTION FUNCTION ===
function decryptFile(inputPath, outputPath) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);

  input.on('error', (err) => {
    console.error('❌ Input file read error:', err.message);
  });
  output.on('error', (err) => {
    console.error('❌ Output file write error:', err.message);
  });
  decipher.on('error', (err) => {
    console.error('❌ Decryption error:', err.message);
  });

  input.pipe(decipher).pipe(output);

  output.on('close', () => {
    console.log('✅ Decrypted image saved at:', outputPath);
  });
}

if (key.length !== 32 || iv.length !== 16) {
  console.error('❌ Invalid key or IV length. Key must be 32 bytes, IV must be 16 bytes.');
  process.exit(1);
}

try {
  decryptFile(encryptedFilePath, decryptedOutputPath);
} catch (err) {
  console.error('❌ Unexpected decryption error:', err.message);
}
