/**
 * Environment Configuration - Functional .env alternative
 * 
 * This file provides the same functionality as .env but can be accessed programmatically
 * Copy values from env-template.example and customize for your deployment
 */

export const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    allowedOrigins: process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  // IPFS Configuration (choose one path)
  ipfs: {
    // Storacha UCAN (recommended)
    ucanToken: process.env.UCAN_TOKEN || process.env.VITE_UCAN_TOKEN || null,
    
    // or Storacha Space+Proof
    w3upSpaceDid: process.env.W3UP_SPACE_DID || null,
    w3upProof: process.env.W3UP_PROOF || null,
    
    // or Web3.Storage (fallback provider)
    web3StorageToken: process.env.WEB3_STORAGE_TOKEN || null,
    
    // Gateway for verification
    gateway: 'https://ipfs.io/ipfs/'
  },

  // Auth Configuration
  auth: {
    jwtPublicKey: process.env.JWT_PUBLIC_KEY || null,
    supabaseUrl: process.env.SUPABASE_URL || null,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null
  },

  // Security Settings
  security: {
    corsEnabled: process.env.CORS_ENABLED !== 'false',
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  },

  // Development Settings
  dev: {
    logLevel: process.env.LOG_LEVEL || 'info',
    useMock: process.env.VITE_USE_MOCK === 'true' && process.env.NODE_ENV === 'development'
  }
};

// Helper functions for configuration validation
export function validateConfig() {
  const errors = [];

  // Check for at least one IPFS configuration
  const hasIPFS = !!(
    config.ipfs.ucanToken || 
    (config.ipfs.w3upSpaceDid && config.ipfs.w3upProof) ||
    config.ipfs.web3StorageToken
  );

  if (!hasIPFS) {
    errors.push('No IPFS configuration found. Set UCAN_TOKEN, W3UP_SPACE_DID+W3UP_PROOF, or WEB3_STORAGE_TOKEN');
  }

  // Check allowed origins in production
  if (config.server.nodeEnv === 'production' && config.server.allowedOrigins.includes('localhost')) {
    errors.push('Production deployment should not allow localhost origins');
  }

  return errors;
}

export function getIPFSConfig() {
  if (config.ipfs.ucanToken) {
    return { type: 'ucan', token: config.ipfs.ucanToken };
  }
  
  if (config.ipfs.w3upSpaceDid && config.ipfs.w3upProof) {
    return { 
      type: 'w3up', 
      spaceDid: config.ipfs.w3upSpaceDid, 
      proof: config.ipfs.w3upProof 
    };
  }
  
  if (config.ipfs.web3StorageToken) {
    return { type: 'web3storage', token: config.ipfs.web3StorageToken };
  }
  
  return null;
}

// Production override (uncomment and customize for deployment)
/*
export const productionOverride = {
  server: {
    port: 3001,
    allowedOrigins: 'https://your-production-domain.com',
    nodeEnv: 'production'
  },
  ipfs: {
    ucanToken: 'ucan:eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...',
    // or other IPFS credentials
  },
  auth: {
    jwtPublicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----'
  }
};

// Merge production overrides
if (process.env.NODE_ENV === 'production') {
  Object.assign(config, productionOverride);
}
*/
