#!/usr/bin/env node

import fs from 'fs';

console.log('🔧 Creating a simple .env file for Storacha...\n');

// Simple .env content
const newEnvContent = `# Blockchain Configuration
PROVIDER_URL=https://polygon-amoy.infura.io/v3/33eec0a080aa42e7bca1b21850a88c73
PRIVATE_KEY=0x639d3b510b42a5ddac314be575d18ff06d199499bec4ed9c1ff83f53dcec72d7
CONTRACT_ADDRESS=0x22Be8Bffc52FDC8037CA237Ea19D0D62f1dC47ce

# IPFS Configuration (Storacha Only)
UPLOAD_AUTH_METHOD=storacha
UCAN_TOKEN=erootsgversionq"p5^wemtCurS@I/AasXD@XBbhˍ{(9WT"c"ave0.9.1cattccangspace/*dwithx8did:key:z6MkpF5psGV5eARSi3uD9wNeui67SLQSnPMXm7afNXj6mzPwccanfblob/*dwithx8did:key:z6MkpF5psGV5eARSi3uD9wNeui67SLQSnPMXm7afNXj6mzPwccangindex/*dwithx8did:key:z6MkpF5psGV5eARSi3uD9wNeui67SLQSnPMXm7afNXj6mzPwccangstore/*dwithx8did:key:z6MkpF5psGV5eARSi3uD9wNeui67SLQSnPMXm7afNXj6mzPwccanhupload/*dwithx8did:key:z6MkpF5psGV5eARSi3uD9wNeui67SLQSnPMXm7afNXj6mzPwccanhaccess/*dwithx8did:key:z6MkpF5psGV5eARSi3uD9wNeui67SLQSnPMXm7afNXj6mzPwccanjfilecoin/*dwithx8did:key:z6MkpF5psGV5eARSi3uD9wNeui67SLQSnPMXm7afNXj6mzPwccangusage/*dwithx8did:key:z6MkpF5psGV5eARSi3uD9wNeui67SLQSnPMXm7afNXj6mzPwcaudX"HeH(3؞I͐,OjEOicexp␦jl\`7cfctespacednnameiAlisultancissX"vX/0kƗ1.B>̳@)<TNcprfq Lż4t   Emǆ)casXD@S&bՄΕ;}iGnN9Sg+s@崿gave0.9.1cattccanistore/adddwithx8did:key:z6MkpF5psGV5eARSi3uD9wNeui67SLQSnPMXm7afNXj6mzPwccanjstore/listdwithx8did:key:z6MkpF5psGV5eARSi3uD9wNeui67SLQSnPMXm7afNXj6mzPwccanjupload/adddwithx8did:key:z6MkpF5psGV5eARSi3uD9wNeui67SLQSnPMXm7afNXj6mzPwccankupload/listdwithx8did:key:z6MkpF5psGV5eARSi3uD9wNeui67SLQSnPMXm7afNXj6mzPwcaudX"\\FĭŇ7o8CcexpcfctespacednameiAlisultancissX"HeH(3؞I͐,OjEOicprf*X%q"p5^wemtCurS@I/A

# MongoDB Configuration (Optional)
MONGODB_URI=mongodb://localhost:27017/ppc

# Server Ports
PORT=3001

# Note: Using Storacha only - no JWT references
`;

// Write the updated .env file
fs.writeFileSync('.env', newEnvContent);

console.log('✅ .env file created successfully!');
console.log('\n📋 What was done:');
console.log('- Created .env with Storacha configuration');
console.log('- Added your UCAN_TOKEN');
console.log('- Removed all JWT references');
console.log('- Everything now uses Storacha consistently');

console.log('\n🚀 Now try starting the backend:');
console.log('node backend/enhanced-server.js'); 