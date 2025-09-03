#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * diagnose-real-ipfs.mjs
 *
 * What it does:
 * 1) Tries a real IPFS upload using Storacha UCAN or Web3.Storage.
 * 2) Scans the repo for fake-CID fallbacks (e.g., "Qm" + sha256 substring).
 * 3) (--apply) Rewrites those lines to throw a 422 error instead of fabricating CIDs.
 *
 * Usage:
 *   node scripts/diagnose-real-ipfs.mjs            # upload + scan
 *   node scripts/diagnose-real-ipfs.mjs --no-upload
 *   node scripts/diagnose-real-ipfs.mjs --apply    # scan and patch fake-CID lines
 *
 * Env it understands:
 *   UCAN_TOKEN / VITE_UCAN_TOKEN
 *   W3UP_SPACE_DID + W3UP_PROOF   (Storacha)
 *   WEB3_STORAGE_TOKEN            (Web3.Storage)
 */

import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const argv = new Set(process.argv.slice(2));
const ROOT = process.cwd();

async function tryRealUpload() {
  // Prefer Storacha UCAN, else Web3.Storage
  const UCAN = process.env.UCAN_TOKEN || process.env.VITE_UCAN_TOKEN || null;
  const SPACE = process.env.W3UP_SPACE_DID || null;
  const PROOF = process.env.W3UP_PROOF || null;
  const WEB3 = process.env.WEB3_STORAGE_TOKEN || process.env.WEB3STORAGE_TOKEN || null;

  // Prepare a tiny random payload so we don't waste quota.
  const payload = crypto.randomBytes(32);

  // helper to validate CIDs with multiformats if available
  async function validateCid(cid) {
    try {
      const { CID } = await import('multiformats/cid.js').catch(async () => {
        // fallback import path
        const mf = await import('multiformats');
        return { CID: mf.CID };
      });
      CID.parse(cid);
      return true;
    } catch {
      return false;
    }
  }

  // Try Storacha first
  if ((UCAN || (SPACE && PROOF))) {
    try {
      const storacha = await import('@storacha/client').catch(() => null);
      if (!storacha) throw new Error('Package @storacha/client not installed');

      const client = await storacha.create();
      if (UCAN) {
        await client.addProof(UCAN);
      } else {
        let proof = PROOF;
        try { proof = JSON.parse(PROOF); } catch {}
        await client.addSpace(SPACE);
        await client.addProof(proof);
        await client.setCurrentSpace(SPACE);
      }

      const fileModule = await import('web3.storage');
      const { File } = fileModule;
      const file = new File([payload], 'diagnostic.bin');
      const cid = await client.uploadFile(file);
      const ok = await validateCid(cid);
      if (!ok) throw new Error(`Returned CID is not valid: ${cid}`);
      console.log(`✅ Storacha upload OK → CID: ${cid}`);
      return { ok: true, cid, provider: 'storacha' };
    } catch (e) {
      console.warn(`⚠️ Storacha upload failed: ${e.message}`);
    }
  }

  // Try Web3.Storage
  if (WEB3) {
    try {
      const { Web3Storage, File } = await import('web3.storage');
      const w3 = new Web3Storage({ token: WEB3 });
      const cid = await w3.put([new File([payload], 'diagnostic.bin')], { wrapWithDirectory: false });
      // Validate
      const ok = await (async () => {
        try {
          const { CID } = await import('multiformats/cid.js').catch(async () => {
            const mf = await import('multiformats');
            return { CID: mf.CID };
          });
          CID.parse(cid);
          return true;
        } catch { return false; }
      })();
      if (!ok) throw new Error(`Returned CID is not valid: ${cid}`);
      console.log(`✅ Web3.Storage upload OK → CID: ${cid}`);
      return { ok: true, cid, provider: 'web3.storage' };
    } catch (e) {
      console.warn(`⚠️ Web3.Storage upload failed: ${e.message}`);
    }
  }

  console.error('❌ No working IPFS credential found (Storacha or Web3.Storage).');
  console.error('   Set one of: UCAN_TOKEN / VITE_UCAN_TOKEN, or W3UP_SPACE_DID + W3UP_PROOF, or WEB3_STORAGE_TOKEN');
  return { ok: false };
}

const FAKE_PATTERNS = [
  // explicit fake-CID builders
  /return\s+['"`]Qm['"`]\s*\+\s*[^;]+;/g,        // return "Qm" + ...
  /['"`]content-based CID['"`]/i,                // log text
  /Generating content-based CID/i,               // log text
  // suspicious hardcoded Qm that isn't parsed by multiformats later
  /\bconst\s+cid\s*=\s*['"`]Qm[1-9A-HJ-NP-Za-km-z]{20,}['"`]\s*;/g
];
// NOTE: we intentionally **do not** flag sha256(...) — allowed for verification.

// Conservative patch: replace "return <fake cid>" with throwing 422.
// We keep it simple and safe: only patch lines that literally build `'Qm' + ...`.
function patchContent(content) {
  return content.replace(
    /return\s+['"`]Qm['"`]\s*\+\s*[^;]+;/g,
    'throw Object.assign(new Error("IPFS_NOT_CONFIGURED: real IPFS required"), { status: 422 });'
  );
}

async function scanAndMaybePatch({ apply = false } = {}) {
  const offenders = [];
  async function walk(dir) {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (['node_modules', '.git', 'dist', 'build', 'scripts', 'tests'].includes(e.name)) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (/\.(m?js|tsx?|cjs|mts|jsx|json)$/i.test(e.name)) {
        const text = await fsp.readFile(full, 'utf8');
        if (FAKE_PATTERNS.some(rx => rx.test(text))) {
          offenders.push(full);
          if (apply) {
            const patched = patchContent(text);
            if (patched !== text) {
              await fsp.writeFile(full, patched, 'utf8');
              console.log(`🛠  Patched fake-CID fallback in ${full}`);
            } else {
              console.log(`⚠️ Found suspicious patterns but did not auto-patch in ${full}`);
            }
          }
        }
      }
    }
  }
  await walk(ROOT);
  return offenders;
}

async function main() {
  if (!argv.has('--no-upload')) {
    await tryRealUpload(); // best-effort; even failure is informative
  }

  const offenders = await scanAndMaybePatch({ apply: argv.has('--apply') });
  if (offenders.length) {
    console.log('\n❌ Fake-CID / fallback patterns detected in:');
    offenders.forEach(f => console.log('   - ' + path.relative(ROOT, f)));
    console.log('\n➡  Fix these files (or run with --apply for a conservative auto-patch).');
    process.exitCode = 2;
  } else {
    console.log('✅ No fake-CID patterns found.');
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
