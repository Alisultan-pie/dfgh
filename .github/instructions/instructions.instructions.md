## ✅ Updated Project Context (for GitHub Copilot or AI Assistants)

You're a **Blockchain Developer Intern** at **Pet Pet Club Limited** working on:

### 🔐 Secure Pet Biometric Storage (your focus)

You’re building a backend system to:

* **Encrypt** pet biometric data (e.g., nose prints) using **AES-256**
* **Store encrypted files on IPFS** (using Web3.Storage now, planning to switch to Storacha)
* **Log metadata on-chain** (Polygon Amoy testnet via **Hardhat + Solidity**)
* **Save metadata to MongoDB**
* Use **Node.js**, **Express**, **ethers.js**, **web3.storage**, and potentially **Storacha**
* Prepare the project for later **UCAN token support**

---

## ⚙️ Copilot Coding Guidelines (for your blockchain/backend work)

### 1. **Smart Contract Setup**

* Use `chainId: 80002` for **Polygon Amoy**
* Contract (`PetStorage.sol`) must:

  * Log CID + timestamp
  * Allow metadata lookup by index

### 2. **Hardhat**

* Use `dotenv` to load `PRIVATE_KEY` and `PROVIDER_URL`
* Keep deployment logic modular in `/scripts/deploy.js`
* Write contract tests in `/test` (currently missing)
* Use `ethers.js` for deployment and interaction

### 3. **Encryption + IPFS**

* AES-256 encryption via Node.js `crypto` module
* Use `@web3-storage/w3up-client` (JWT now)
* Refactor upload logic to support optional **Storacha + UCAN**

### 4. **Backend Integration**

* `backend/index.js`:

  * Accept encrypted image
  * Upload to IPFS
  * Write CID + timestamp to chain
  * Save CID + pet ID to MongoDB
* Future: add `GET /pet/:id` to decrypt and return image

### 5. **Dev Standards**

* Use `.env` for all secrets and keys
* Logging: `console.log` or `debug` with timestamps
* Project structure:

  ```
  /contracts/
  /scripts/
  /encryption/
  /ipfs/
  /backend/
  ```

---

## ✅ Tasks Copilot Should Be Helping With

Here’s what Copilot (or I) should focus on for you:

| Task                    | Description                                |
| ----------------------- | ------------------------------------------ |
| 🔧 Hardhat Config       | Add `chainId: 80002` under `networks.amoy` |
| 🔐 AES-256 Helper       | Modularize `encrypt.js` / `decrypt.js`     |
| 📦 IPFS Upload          | Abstract Web3.Storage vs Storacha clients  |
| 📜 Smart Contract Tests | Add `/test/PetStorage.test.js` using Chai  |
| 🔁 Route: GET /pet/\:id | Add backend route to fetch and decrypt     |
| 🧾 README               | Add dev setup for blockchain backend only  |

---

Would you like me to:

* Auto-generate the Hardhat test file?
* Build a modular IPFS uploader with switch logic for Storacha?
* Or help structure your backend `upload + log + save` route more cleanly?

Let me know what task you want Copilot (or me) to help with next.
