#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🌐 Starting PPC Website...\n');

// Check if we're in the right directory
const websiteDir = './website';
if (!fs.existsSync(websiteDir)) {
  console.error('❌ Website directory not found');
  process.exit(1);
}

// Check if package.json exists in website directory
const websitePackageJson = path.join(websiteDir, 'package.json');
if (!fs.existsSync(websitePackageJson)) {
  console.log('📝 Creating website package.json...');
  
  const packageJson = {
    "name": "ppc-website",
    "version": "1.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview"
    },
    "dependencies": {
      "react": "^18.0.0",
      "react-dom": "^18.0.0",
      "lucide-react": "^0.263.1",
      "sonner": "^1.0.0",
      "class-variance-authority": "^0.7.0",
      "clsx": "^2.0.0",
      "tailwind-merge": "^2.0.0"
    },
    "devDependencies": {
      "@types/react": "^18.0.0",
      "@types/react-dom": "^18.0.0",
      "@vitejs/plugin-react": "^4.0.0",
      "autoprefixer": "^10.4.14",
      "postcss": "^8.4.24",
      "tailwindcss": "^3.3.2",
      "typescript": "^5.0.2",
      "vite": "^4.4.0"
    }
  };
  
  fs.writeFileSync(websitePackageJson, JSON.stringify(packageJson, null, 2));
  console.log('✅ Created website package.json');
}

// Check if vite.config.js exists
const viteConfigPath = path.join(websiteDir, 'vite.config.js');
if (!fs.existsSync(viteConfigPath)) {
  console.log('📝 Creating vite.config.js...');
  
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  root: '.',
  build: {
    outDir: 'dist'
  }
})`;
  
  fs.writeFileSync(viteConfigPath, viteConfig);
  console.log('✅ Created vite.config.js');
}

// Check if index.html exists
const indexHtmlPath = path.join(websiteDir, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.log('📝 Creating index.html...');
  
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pet Pet Club - Blockchain Integration</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/App.tsx"></script>
  </body>
</html>`;
  
  fs.writeFileSync(indexHtmlPath, indexHtml);
  console.log('✅ Created index.html');
}

// Check if tailwind.config.js exists
const tailwindConfigPath = path.join(websiteDir, 'tailwind.config.js');
if (!fs.existsSync(tailwindConfigPath)) {
  console.log('📝 Creating tailwind.config.js...');
  
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
  
  fs.writeFileSync(tailwindConfigPath, tailwindConfig);
  console.log('✅ Created tailwind.config.js');
}

// Check if postcss.config.js exists
const postcssConfigPath = path.join(websiteDir, 'postcss.config.js');
if (!fs.existsSync(postcssConfigPath)) {
  console.log('📝 Creating postcss.config.js...');
  
  const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
  
  fs.writeFileSync(postcssConfigPath, postcssConfig);
  console.log('✅ Created postcss.config.js');
}

// Check if tsconfig.json exists
const tsconfigPath = path.join(websiteDir, 'tsconfig.json');
if (!fs.existsSync(tsconfigPath)) {
  console.log('📝 Creating tsconfig.json...');
  
  const tsconfig = `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`;
  
  fs.writeFileSync(tsconfigPath, tsconfig);
  console.log('✅ Created tsconfig.json');
}

// Check if tsconfig.node.json exists
const tsconfigNodePath = path.join(websiteDir, 'tsconfig.node.json');
if (!fs.existsSync(tsconfigNodePath)) {
  console.log('📝 Creating tsconfig.node.json...');
  
  const tsconfigNode = `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.js"]
}`;
  
  fs.writeFileSync(tsconfigNodePath, tsconfigNode);
  console.log('✅ Created tsconfig.node.json');
}

console.log('🔧 Installing website dependencies...');
try {
  // Change to website directory and install dependencies
  const installProcess = spawn('npm', ['install'], {
    stdio: 'inherit',
    cwd: websiteDir
  });
  
  installProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Website dependencies installed');
      startWebsite();
    } else {
      console.error('❌ Failed to install website dependencies');
      process.exit(1);
    }
  });
} catch (error) {
  console.error('❌ Error installing dependencies:', error);
  process.exit(1);
}

function startWebsite() {
  console.log('🚀 Starting website development server...');
  
  const websiteProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    cwd: websiteDir
  });
  
  websiteProcess.on('error', (error) => {
    console.error('❌ Website failed to start:', error.message);
  });
  
  websiteProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Website exited with code ${code}`);
    }
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down website...');
    websiteProcess.kill();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down website...');
    websiteProcess.kill();
    process.exit(0);
  });
} 