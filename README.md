# PPC Blockchain — Pet Pet Club

Full-stack app for secure pet profiles with client-side encryption and decentralized storage.

### What’s inside
- Frontend (Vite + React + Tailwind) in `website/`
- Supabase Edge Function backend in `website/supabase/functions/server/`
- Optional scripts: encryption utilities, IPFS CLI helper, contracts

### Features
- Email/password auth with Supabase (session persisted)
- Add pets with details and image
- AES‑GCM 256 in-browser encryption of images
- Upload encrypted bytes to IPFS via Storacha (UCAN) or Web3.Storage
- Simple KV-backed API: list/create/get/delete pets; transactions; verifications

---

## 1) Quick start

Requirements: Node 18+, npm, a Supabase project (already linked in repo), and at least one IPFS provider token (Storacha UCAN or Web3.Storage).

Clone and install website deps:
```bash
git clone https://github.com/ppchenry/PPC_blockchain.git
cd PPC_blockchain/website
npm install
```

Create `website/.env` (frontend) with at least one of:
```bash
# Prefer Storacha (UCAN)
VITE_UCAN_TOKEN=...           # UCAN token
VITE_STORACHA_UPLOAD_URL=https://up.storacha.network/upload

# Or Web3.Storage
VITE_WEB3_STORAGE_TOKEN=...
```

Run the web app:
```bash
npm run dev
# open the printed URL (usually http://localhost:5173)
```

You should see the auth page. Sign up/sign in, go to “Add Pet”, fill details, choose an image, and upload. The pipeline will show “AES‑GCM 256‑bit” and then a real CID when a token is set.

---

## 2) Backend (Supabase Edge Function)

The backend lives in `website/supabase/functions/server/` and is deployed to the Supabase project configured in `website/utils/supabase/info.tsx`.

Endpoints (all prefixed by `/functions/v1/make-server-fc39f46a`):
- `POST /auth/signup` (admin auto-confirm)
- `GET /auth/user`
- `GET /pets`
- `POST /pets`
- `GET /pets/:petId`
- `DELETE /pets/:petId`  ← removes from KV and list
- `POST /transactions`, `GET /transactions`
- `POST /verifications`, `GET /verifications`

CORS allows localhost (5173/3000/3001).

---

## 3) Important files (frontend)
- `website/components/AuthContext.tsx` — auth provider and session handling.
- `website/components/AuthModal.tsx` — sign in/up UI.
- `website/components/PetUpload.tsx` — pet form, encryption, upload.
- `website/App.tsx` — main UI, lists pets, delete integration.
- `website/utils/ipfs.ts` — AES‑GCM + IPFS upload helpers (Storacha/Web3).
- `website/utils/supabase/client.tsx` — Supabase client + API helper + local fallbacks.

---

## 4) How encryption & upload works
1. Read file in browser → encrypt with WebCrypto AES‑GCM 256.
2. If `VITE_UCAN_TOKEN` is present, POST encrypted bytes to `VITE_STORACHA_UPLOAD_URL` (default: `https://up.storacha.network/upload`) using Bearer UCAN; else if `VITE_WEB3_STORAGE_TOKEN` is set, upload via Web3.Storage.
3. Save returned CID + metadata via the Supabase function.

Note: The bytes in IPFS are encrypted; keep the key (exported JWK in UI) to decrypt later.

---

## 5) Common issues
- Blank page after upload: open DevTools → Console. We guard typical null/undefined cases, but share the first error if you see one.
- Pets reappear after delete: ensure you’re on latest main and that the edge function `DELETE /pets/:petId` is deployed; the UI calls it and also removes from local fallback.
- 5173 doesn’t load: start dev with `npm run dev` inside `website/`. Another process might occupy 5173; use the printed URL.

---

## 6) Dev scripts
From `website/`:
```bash
npm run dev       # start Vite
npm run build     # build site
npm run preview   # preview build
```

Root scripts include blockchain/IPFS helpers; see `ipfs/`, `encryption/`, and `scripts/` directories.

---

## 7) Security notes
- Do not expose private keys in frontend `.env` files.
- UCAN and Web3 tokens grant upload capability—use dev tokens locally and rotate regularly.

---

## 8) Contributing
Create a feature branch, make changes, and submit a PR. Run `npm run build` in `website/` to ensure the app compiles.

