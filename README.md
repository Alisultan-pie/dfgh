# Secure Pet Biometric Storage with Blockchain

This project is a prototype to securely encrypt and store pet biometric data (e.g., nose print images) using AES-256 encryption, IPFS, and blockchain technology. It is part of my internship at Pet Pet Club Limited.

## ✅ Current Progress

- [x] Project folder initialized
- [x] Node.js installed and working
- [x] AES-256 encryption script completed (`encryption/encrypt.js`)
- [x] Encrypted image is generated and saved
- [x] Key and IV are stored in a secure text file for future decryption
- [x] Basic smart contract deployed on Polygon Amoy testnet
- [x] IPFS upload via Web3.Storage functional
- [x] Backend script can encrypt → upload → store on-chain

## 🔐 Encryption Details

- Algorithm: AES-256-CBC
- Keys are generated using Node.js `crypto` module
- Keys and IV are saved in `encryption/keys.txt` with timestamps
- Encrypted image output: `nose_encrypted.jpg`

## 🗂️ Folder Structure

/encryption → AES-256 encryption logic
/ipfs → IPFS upload logic (currently Web3.Storage)
/contracts → Solidity smart contract for blockchain storage
/backend → Backend API to connect MongoDB, blockchain, etc.

## 📌 To Do Next

- [ ] Add unit tests for contract functions
- [ ] Create Express API routes for web access
- [ ] Integrate Storacha/UCAN authentication
- [ ] Add comprehensive error handling
- [ ] Complete documentation

## 🧪 Run the encryption script

```bash
node encryption/encrypt.js
```

## 🛠️ Amoy Network Setup

1. Add Polygon Amoy testnet to MetaMask:
   - RPC: https://rpc-amoy.polygon.technology
   - Chain ID: 80002
   - Currency: POL
2. Get test POL from the Amoy faucet.
3. Set up your `.env` file with:
   ```
   PROVIDER_URL=https://rpc-amoy.polygon.technology
   PRIVATE_KEY=your-private-key
   CONTRACT_ADDRESS=your-deployed-contract-address
   WEB3STORAGE_TOKEN=your-web3-storage-token
   ```

## Automated Folder Watcher

Run `npm run watch` to start the watcher. Drop a file named `petId.png` into `./incoming` and the pipeline (encrypt → IPFS → Polygon) runs automatically.

## Current Working Demo

1. Encrypt an image: `node encryption/encrypt.js <input> <output> <keyfile>`
2. Upload to IPFS: `node ipfs/upload.js <encrypted-file>`
3. Run backend script: `node backend/index.js` (uploads, stores on-chain, saves to MongoDB)
