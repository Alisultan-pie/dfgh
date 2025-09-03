/**
 * Application configuration
 */

// Kill mocks in production - no ghost pets
export const USE_MOCK = import.meta.env.DEV && (import.meta.env.VITE_USE_MOCK === 'true');

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

// Security settings
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
