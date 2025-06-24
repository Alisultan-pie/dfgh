# Secure Pet Biometric Storage with Blockchain

This project is a prototype to securely encrypt and store pet biometric data (e.g., nose print images) using AES-256 encryption, IPFS, and blockchain technology. It is part of my internship at Pet Pet Club Limited.

## ✅ Current Progress

- [x] Project folder initialized
- [x] Node.js installed and working
- [x] AES-256 encryption script completed (`encryption/encrypt.js`)
- [x] Encrypted image is generated and saved
- [x] Key and IV are stored in a secure text file for future decryption

## 🔐 Encryption Details

- Algorithm: AES-256-CBC
- Keys are generated using Node.js `crypto` module
- Keys and IV are saved in `encryption/keys.txt` with timestamps
- Encrypted image output: `nose_encrypted.jpg`

## 🗂️ Folder Structure

/encryption → AES-256 encryption logic
/ipfs → Will handle IPFS upload logic
/contracts → Solidity smart contract for blockchain storage
/backend → (Optional) Backend API to connect MongoDB, blockchain, etc.

## 📌 To Do Next

- Upload encrypted image to IPFS
- Save IPFS hash and metadata on the Polygon blockchain
- Write and deploy Solidity smart contract
- Integrate everything into a working prototype

## 🧪 Run the encryption script

```bash
node encryption/encrypt.js
