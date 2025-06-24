const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// SETTINGS
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32); // 256-bit key
const iv = crypto.randomBytes(16);  // 128-bit IV

const inputFilePath = path.join(__dirname, '..', '1280px-Sunflower_from_Silesia2.jpg');
const outputFilePath = path.join(__dirname, '..', 'nose_encrypted.jpg');
const keyOutputPath = path.join(__dirname, '..', 'encryption', 'keys.txt');

// ENCRYPTION FUNCTION
function encryptFile(inputPath, outputPath, keyPath) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);

  input.pipe(cipher).pipe(output);

  output.on('finish', () => {
    console.log('✅ Image encrypted and saved at:', outputPath);

    const keyData = `🔐 AES-256 Key: ${key.toString('hex')}\n🧪 IV: ${iv.toString('hex')}\n\n`;
    fs.writeFileSync(keyPath, keyData, { flag: 'a' }); // Append mode
    console.log('📁 Key + IV saved in:', keyPath);
  });
}

encryptFile(inputFilePath, outputFilePath, keyOutputPath);
