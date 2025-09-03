#!/usr/bin/env node
/**
 * Regression test to prevent fake CID patterns from being reintroduced
 * 
 * This test fails CI if someone adds fake CID generation back to the codebase
 */

import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const BAD = [
  /return\s+['"`]Qm['"`]\s*\+\s*[^;]+;/g,
  /content-based CID/i,
  /Generating content-based CID/i
];

async function walk(d, files = []) {
  for (const e of await fs.readdir(d, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'build', 'scripts', 'tests'].includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) await walk(p, files);
    else if (/\.(m?js|tsx?|cjs|mts|jsx)$/i.test(e.name)) files.push(p);
  }
  return files;
}

const files = await walk(ROOT);
let hit = [];
for (const f of files) {
  const txt = await fs.readFile(f, 'utf8');
  if (BAD.some(rx => rx.test(txt))) hit.push(f);
}

if (hit.length) {
  console.error('❌ Fake CID patterns found:');
  console.error(hit.map(x => '   - ' + path.relative(ROOT, x)).join('\n'));
  console.error('\n🚨 REGRESSION DETECTED: Fake CID generation has been reintroduced!');
  console.error('   Remove these patterns to maintain security standards.');
  process.exit(1);
} else {
  console.log('✅ No fake CID patterns found - security standards maintained!');
}
