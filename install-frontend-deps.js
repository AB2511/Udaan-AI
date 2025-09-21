#!/usr/bin/env node

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📦 Installing Frontend Dependencies\n');

const frontendPath = path.join(__dirname, 'frontend');

// Check if node_modules exists
const nodeModulesPath = path.join(frontendPath, 'node_modules');

try {
  await fs.access(nodeModulesPath);
  console.log('✅ Frontend dependencies already installed');
  console.log('💡 You can now run: cd frontend && npm run dev');
} catch {
  console.log('📥 Installing frontend dependencies...');
  
  const npmInstall = spawn('npm', ['install'], {
    cwd: frontendPath,
    stdio: 'inherit',
    shell: true
  });

  npmInstall.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Frontend dependencies installed successfully!');
      console.log('\n🚀 Next steps:');
      console.log('   1. Backend is already running on port 5000');
      console.log('   2. Start frontend: cd frontend && npm run dev');
      console.log('   3. Open browser: http://localhost:5173');
    } else {
      console.log('\n❌ Failed to install frontend dependencies');
      console.log('💡 Try running manually: cd frontend && npm install');
    }
  });

  npmInstall.on('error', (error) => {
    console.error('❌ Error installing dependencies:', error.message);
  });
}