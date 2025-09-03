/**
 * CID validation utilities
 */

// CID validation using multiformats for bulletproof validation
export function isValidCid(x?: string): boolean {
  if (!x || typeof x !== 'string') return false;
  try { 
    // Use dynamic import to handle multiformats
    if (typeof window !== 'undefined') {
      // Browser fallback - basic validation
      const trimmed = x.trim();
      // CIDv0: starts with Qm, 46 characters, base58
      if (trimmed.startsWith('Qm') && trimmed.length === 46) {
        return /^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmed);
      }
      // CIDv1: starts with b, longer, base32
      if (trimmed.startsWith('b') && trimmed.length > 50) {
        return /^[a-z2-7]+$/.test(trimmed.substring(1));
      }
      if (trimmed.startsWith('baf') && trimmed.length > 50) {
        return /^[a-z2-7]+$/.test(trimmed.substring(1));
      }
      return false;
    } else {
      // Node.js - use multiformats if available
      const { CID } = require('multiformats/cid');
      CID.parse(x.trim()); 
      return true; 
    }
  } catch { 
    return false; 
  }
}

export function formatCid(cid: string): string {
  if (!isValidCid(cid)) return 'Invalid CID';
  
  // Truncate long CIDs for display
  if (cid.length > 20) {
    return `${cid.substring(0, 8)}...${cid.substring(cid.length - 8)}`;
  }
  
  return cid;
}

export function dedupeById<T extends { petId?: string; id?: string }>(list: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of list) {
    const key = item.petId ?? item.id;
    if (key) {
      map.set(key, item);
    }
  }
  return [...map.values()];
}
