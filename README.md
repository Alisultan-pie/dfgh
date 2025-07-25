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

```

## Automated Folder Watcher

Run `npm run watch` to start the watcher. Drop a file named `petId.png` into `./incoming` and the pipeline (encrypt → IPFS → Polygon) runs automatically.

## 🛠️ Amoy Network Setup

1. Add Polygon Amoy testnet to MetaMask:
   - RPC: https://rpc-amoy.polygon.technology
   - Chain ID: 80002
   - Currency: POL
2. Get test POL from the Amoy faucet.
3. In `hardhat.config.js`, set:
   ```js
   networks: {
     amoy: {
       url: process.env.PROVIDER_URL,
       accounts: [process.env.PRIVATE_KEY]
     }
   }
   ```

## 🔑 Web3.Storage Auth (JWT vs Storacha/UCAN)

- **Legacy JWT:**
  - Get your token from https://web3.storage/tokens
  - Add to `.env`:
    ```
    WEB3STORAGE_TOKEN=your-jwt-token
    UPLOAD_AUTH_METHOD=jwt
    ```
- **Storacha/UCAN:**
  - Get a UCAN token (see Storacha docs or your org admin)
  - Add to `.env`:
    ```
    UCAN_TOKEN=your-ucan-token
    UPLOAD_AUTH_METHOD=ucan
    ```

## .env Example
```
PROVIDER_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your-private-key
CONTRACT_ADDRESS=your-contract-address
WEB3STORAGE_TOKEN=your-jwt-token
UCAN_TOKEN=your-ucan-token
UPLOAD_AUTH_METHOD=jwt
```
