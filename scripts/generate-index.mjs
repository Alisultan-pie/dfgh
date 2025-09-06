#!/usr/bin/env node
/**
 * Generate static file list for IPFS website
 */
import fs from 'fs/promises';
import path from 'path';

const ROOT = process.argv[2] || 'site-src';
const TARGET = path.join(ROOT, 'index.html');
const SCAN_DIR = path.join(ROOT, 'encrypted');

function formatSize(bytes) {
  if (bytes < 1024) return { size: bytes, displaySize: bytes + ' B' };
  const kb = bytes / 1024;
  if (kb < 1024) return { size: bytes, displaySize: kb.toFixed(1) + ' KB' };
  return { size: bytes, displaySize: (kb / 1024).toFixed(2) + ' MB' };
}

async function scanFiles(dir) {
  const files = [];
  
  const walkDir = async (currentDir) => {
    try {
      const entries = await fs.readdir(currentDir);
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry);
        const stat = await fs.stat(fullPath);
        
        if (stat.isDirectory()) {
          await walkDir(fullPath);
        } else {
          const relativePath = path.relative(ROOT, fullPath).replace(/\\/g, '/');
          const { size, displaySize } = formatSize(stat.size);
          
          files.push({
            path: relativePath,
            size: size,
            displaySize: displaySize
          });
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan ${currentDir}:`, error.message);
    }
  };
  
  await walkDir(dir);
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

async function injectFileList() {
  try {
    console.log('🔍 Scanning files...');
    const files = await scanFiles(SCAN_DIR);
    
    console.log(`📁 Found ${files.length} files:`);
    files.forEach(f => console.log(`   ${f.path} (${f.displaySize})`));
    
    console.log('📝 Reading index.html...');
    let html = await fs.readFile(TARGET, 'utf8');
    
    // Find the fileList array
    const marker = 'const fileList = [';
    const startIndex = html.indexOf(marker);
    if (startIndex === -1) {
      throw new Error('Could not find fileList marker in index.html');
    }
    
    const endMarker = '];';
    const endIndex = html.indexOf(endMarker, startIndex);
    if (endIndex === -1) {
      throw new Error('Could not find end of fileList array');
    }
    
    // Generate the file list JavaScript
    const fileEntries = files.map(f => 
      `      { path: '${f.path}', size: ${f.size}, displaySize: '${f.displaySize}' }`
    ).join(',\n');
    
    // Replace the file list
    const newFileList = `const fileList = [
${fileEntries}
    ];`;
    
    html = html.substring(0, startIndex) + newFileList + html.substring(endIndex + 2);
    
    console.log('💾 Writing updated index.html...');
    await fs.writeFile(TARGET, html);
    
    console.log('✅ Success!');
    console.log(`   Injected ${files.length} files into ${TARGET}`);
    console.log(`   Total size: ${files.reduce((sum, f) => sum + f.size, 0)} bytes`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

injectFileList();
