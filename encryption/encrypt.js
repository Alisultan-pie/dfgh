// Import built-in Node.js modules
const fs = require('fs');            // For reading and writing files
const crypto = require('crypto');    // For encryption
const path = require('path');        // For handling file paths

// === ENCRYPTION SETTINGS ===
const algorithm = 'aes-256-cbc';            // AES encryption algorithm
const key = crypto.randomBytes(32);         // Generates a secure 256-bit encryption key
const iv = crypto.randomBytes(16);          // Generates a 128-bit initialization vector (IV)

// === INPUT & OUTPUT FILE PATHS ===

// Image you want to encrypt (make sure it exists in the root folder)
const inputFilePath = path.join(__dirname, '..', '1280px-Sunflower_from_Silesia2.jpg');

// Where to save the encrypted version of the image
const outputFilePath = path.join(__dirname, '..', 'nose_encrypted.jpg');

// Where to store the encryption key and IV (for future decryption)
const keyOutputPath = path.join(__dirname, 'keys.txt');  // inside /encryption folder

// === ENCRYPTION FUNCTION ===
function encryptFile(inputPath, outputPath, keyPath) {
  // Create AES-256-CBC cipher using the key and IV
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  // Read the original image file
  const input = fs.createReadStream(inputPath);

  // Create a writable stream for the encrypted file
  const output = fs.createWriteStream(outputPath);

  // Pipe the image through the cipher and save the result
  input.pipe(cipher).pipe(output);

  // After encryption is complete:
  output.on('finish', () => {
    console.log('✅ Image encrypted and saved at:', outputPath);

    // Build readable metadata (which file, key, IV, and timestamp)
    const fileName = path.basename(inputPath);
    const keyData = 
      `📸 File: ${fileName}\n` +
      `🔐 AES-256 Key: ${key.toString('hex')}\n` +
      `🧪 IV: ${iv.toString('hex')}\n` +
      `📅 Timestamp: ${new Date().toISOString()}\n\n`;

    // Save metadata to keys.txt (append so nothing gets overwritten)
    fs.writeFileSync(keyPath, keyData, { flag: 'a' });

    console.log('📁 Key + IV saved in:', keyPath);
  });
}

// === RUN SCRIPT ===
encryptFile(inputFilePath, outputFilePath, keyOutputPath);
