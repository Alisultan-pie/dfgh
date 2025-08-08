import { Web3Storage, File as W3File } from 'web3.storage';

export type EncryptResult = {
  cipherBytes: Uint8Array;
  keyJwk: JsonWebKey;
  iv: Uint8Array;
};

export async function encryptFileAESGCM(file: File): Promise<EncryptResult> {
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new Uint8Array(await file.arrayBuffer());
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext));
  const keyJwk = await crypto.subtle.exportKey('jwk', key);
  return { cipherBytes: cipher, keyJwk, iv };
}

function getClient(): Web3Storage | null {
  const token = import.meta.env.VITE_WEB3_STORAGE_TOKEN as string | undefined;
  if (!token) return null;
  try {
    return new Web3Storage({ token });
  } catch {
    return null;
  }
}

export async function uploadEncryptedToWeb3Storage(filename: string, bytes: Uint8Array) {
  const client = getClient();
  if (!client) throw new Error('Web3.Storage token missing (VITE_WEB3_STORAGE_TOKEN)');
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  const files = [new W3File([blob], `${filename}.enc`)];
  const cid = await client.put(files, { wrapWithDirectory: false });
  return cid;
}

export async function uploadEncryptedToStoracha(bytes: Uint8Array, filename = 'encrypted.bin') {
  const token = import.meta.env.VITE_UCAN_TOKEN as string | undefined;
  if (!token) throw new Error('UCAN token missing (VITE_UCAN_TOKEN)');
  const endpoint = (import.meta.env.VITE_STORACHA_UPLOAD_URL as string | undefined) || 'https://up.storacha.network/upload';
  const form = new FormData();
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  form.append('file', new File([blob], filename));

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Storacha upload failed (${res.status})`);
  }
  // Try to read JSON { cid } or plain text CID
  let cid: string;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await res.json();
    cid = json.cid || json.value || json.Hash || '';
  } else {
    cid = (await res.text()).trim();
  }
  if (!cid) throw new Error('Storacha upload succeeded but CID missing');
  return cid;
}


