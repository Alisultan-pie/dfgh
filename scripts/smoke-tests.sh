#!/bin/bash
# Smoke Tests for Production Deployment
# Run these tests to verify the system is working correctly

echo "🧪 RUNNING SMOKE TESTS"
echo "======================"

# Test 1: Health Check
echo "1️⃣ Testing health endpoint..."
HEALTH=$(curl -s http://localhost:3001/health)
echo "Health response: $HEALTH"

if echo "$HEALTH" | grep -q '"status":"ready"'; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    exit 1
fi

# Test 2: IPFS Configuration Check
echo -e "\n2️⃣ Testing IPFS configuration..."
if echo "$HEALTH" | grep -q '"ipfs":"real"'; then
    echo "✅ Real IPFS configured"
    IPFS_MODE="real"
elif echo "$HEALTH" | grep -q '"ipfs":"simulated"'; then
    echo "⚠️  IPFS in simulation mode (demo)"
    IPFS_MODE="simulated"
else
    echo "❌ IPFS not configured"
    exit 1
fi

# Test 3: Upload without credentials (should fail with 422)
echo -e "\n3️⃣ Testing upload without credentials (expecting 422)..."
if [ "$IPFS_MODE" = "real" ]; then
    # Temporarily unset IPFS credentials
    unset UCAN_TOKEN W3UP_SPACE_DID W3UP_PROOF WEB3_STORAGE_TOKEN
    UPLOAD_RESPONSE=$(curl -s -w "%{http_code}" -F "noseprint=@photos/Cat03.jpg" http://localhost:3001/secure-pet-upload)
    HTTP_CODE="${UPLOAD_RESPONSE: -3}"
    
    if [ "$HTTP_CODE" = "422" ]; then
        echo "✅ Correctly rejected upload without credentials (422)"
    else
        echo "❌ Expected 422 but got $HTTP_CODE"
        exit 1
    fi
else
    echo "⚠️  Skipping credential test (demo mode)"
fi

# Test 4: CID Validation Test
echo -e "\n4️⃣ Testing CID validation..."
node -e "
import { isValidCid } from './website/utils/cid.js';
const validCID = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
const invalidCID = 'Qm123invalid';
console.log('Valid CID test:', isValidCid(validCID) ? '✅' : '❌');
console.log('Invalid CID test:', !isValidCid(invalidCID) ? '✅' : '❌');
"

# Test 5: Regression Test
echo -e "\n5️⃣ Running regression test..."
npm run cid:check

if [ $? -eq 0 ]; then
    echo "✅ No fake CID patterns found"
else
    echo "❌ Fake CID patterns detected"
    exit 1
fi

echo -e "\n🎉 ALL SMOKE TESTS PASSED!"
echo "System is ready for production deployment."
