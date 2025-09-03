# 🚀 PRODUCTION DEPLOYMENT GUIDE

## 📋 QUICK START CHECKLIST

### 1. **Environment Configuration**
Choose one of these approaches:

#### Option A: Traditional .env file
```bash
# Copy template and customize
cp env-template.example .env
# Edit .env with your values
```

#### Option B: Functional config file (accessible via code)
```bash
# Edit config/environment.js directly
# Uncomment and customize productionOverride section
```

### 2. **IPFS Credentials** (choose one)
```bash
# Storacha UCAN (recommended)
export UCAN_TOKEN='ucan:eyJ...'

# OR Storacha Space+Proof
export W3UP_SPACE_DID='did:key:z...'
export W3UP_PROOF='{"iss":"did:...","aud":"did:..."}'

# OR Web3.Storage (fallback)
export WEB3_STORAGE_TOKEN='eyJ...'
```

### 3. **Production Setup Validation**
```bash
npm run prod:setup
# Validates config, checks dependencies, security settings
```

### 4. **Security Tests**
```bash
npm run cid:check        # Regression test (no fake CIDs)
npm run smoke-test       # Full system test
```

### 5. **Deploy**
```bash
# Production server (requires real IPFS creds)
npm run prod:start

# OR Demo server (works without creds)
npm run demo:start
```

## 🧪 SMOKE TESTS

### Health Check
```bash
curl -s http://localhost:3001/health | jq
# Expected: {"status":"ready","ipfs":"real"} (or "simulated")
```

### Upload Test (expect 422 if no creds)
```bash
curl -s -F "noseprint=@photos/Cat03.jpg" http://localhost:3001/secure-pet-upload | jq
# Without creds: {"success":false,"error":"IPFS_NOT_CONFIGURED"}
# With creds: {"success":true,"ipfs":{"photoCID":"baf..."}}
```

### CID Verification
```bash
npm run verify-cid bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi
# Validates CID format and checks IPFS gateway accessibility
```

## 🛡️ SECURITY FEATURES

### ✅ ACTIVE GUARDRAILS
- **No fake CID generation** - Only real IPFS or 422 errors
- **Memory-only uploads** - No plaintext files on disk
- **Input validation** - File type/size restrictions
- **Rate limiting** - Prevents abuse
- **CORS allowlist** - Restricts API access
- **PII separation** - Private data not on IPFS
- **Regression tests** - CI blocks fake CID reintroduction

### 🔍 ACCEPTANCE CRITERIA
- [x] Valid creds → 200 + real CID that `multiformats.CID.parse` accepts
- [x] No creds → 422 error (no fake CID)
- [x] UI shows 🔒 for valid CIDs, ⚠️ for invalid
- [x] `npm run cid:check` passes
- [x] No fake patterns in `scripts/diagnose-real-ipfs.mjs`

## 🌐 FRONTEND INTEGRATION

### CID Validation & Deduplication
```typescript
import { isValidCid } from './utils/cid';
import { dedupeByPetId } from './utils/dedupe';

// On data load
const merged = dedupeByPetId([...apiPets, ...localPets]);
const normalized = merged.map(p => ({
  ...p,
  ipfsStatus: isValidCid(p.ipfsCid) ? 'secure' : (p.ipfsCid ? 'invalid' : 'missing')
}));
```

### Badge Logic
```typescript
{pet.ipfsStatus === 'secure' && (
  <Badge className="bg-green-50 text-green-700">🔒 SECURE</Badge>
)}
{pet.ipfsStatus === 'invalid' && (
  <Badge className="bg-red-50 text-red-700">⚠️ INVALID CID</Badge>
)}
{pet.ipfsStatus === 'missing' && (
  <Badge className="bg-gray-50 text-gray-700">📝 NOT UPLOADED</Badge>
)}
```

## 🔧 CONFIGURATION ACCESS

### Programmatic Access
```javascript
import { config, getIPFSConfig, validateConfig } from './config/environment.js';

// Get current configuration
console.log('Server port:', config.server.port);
console.log('IPFS config:', getIPFSConfig());

// Validate before startup
const errors = validateConfig();
if (errors.length > 0) {
  console.error('Config errors:', errors);
  process.exit(1);
}
```

### Environment Override
```javascript
// In config/environment.js, uncomment and customize:
export const productionOverride = {
  server: {
    port: 3001,
    allowedOrigins: 'https://your-production-domain.com'
  },
  ipfs: {
    ucanToken: 'ucan:your-production-token'
  }
};
```

## 🚨 CI/CD INTEGRATION

### GitHub Actions
The included `.github/workflows/ci.yml` automatically:
- Runs regression tests (`npm run cid:check`)
- Validates configuration
- Tests CID validation utilities
- Builds and tests server startup

### Add to CI Pipeline
```yaml
- name: Security Check
  run: npm run cid:check
  
- name: Smoke Tests  
  run: npm run smoke-test
```

## 📊 MONITORING & ALERTS

### Key Metrics to Monitor
- **422 error rate** - Spikes indicate misconfigured IPFS creds
- **Upload success rate** - Should be >95% with valid creds
- **CID validation failures** - Should be near 0%
- **Memory usage** - Memory-only processing should be stable

### Health Endpoint
```bash
curl http://localhost:3001/health
```
Returns:
```json
{
  "status": "ready",
  "mode": "production",
  "security": "production-grade", 
  "ipfs": "real",
  "timestamp": "2025-09-03T20:30:00.000Z"
}
```

## 🎯 FINAL VERIFICATION

Before going live, ensure:

1. **All tests pass**:
   ```bash
   npm run cid:check     # ✅
   npm run prod:setup    # ✅
   npm run smoke-test    # ✅
   ```

2. **Real CID generation**:
   ```bash
   # Upload should return real CID like bafybeig...
   curl -F "noseprint=@test.jpg" http://localhost:3001/secure-pet-upload
   ```

3. **UI shows correct badges**:
   - 🔒 SECURE for valid CIDs
   - ⚠️ INVALID CID for malformed ones
   - No 🧪 MOCK DATA in production

**🎉 SYSTEM IS PRODUCTION-READY AND BULLETPROOF! 🛡️**
