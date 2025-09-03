/**
 * Deduplication utilities for preventing duplicate pets
 */

export function dedupeByPetId(list: any[]): any[] {
  const m = new Map<string, any>();
  for (const p of list) {
    const key = String(p.petId ?? p.id ?? '');
    if (key) {
      m.set(key, p);
    }
  }
  return [...m.values()];
}
