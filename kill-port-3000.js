#!/usr/bin/env node

/**
 * Kill Port 3000 Script
 * Finds and kills any process using port 3000
 */

const { execSync } = require('child_process');

console.log('🔍 Checking for processes using port 3000...');

try {
  // Find processes using port 3000
  const result = execSync('netstat -ano | findstr :3000', { encoding: 'utf8' });
  
  if (result.trim()) {
    console.log('📋 Found processes using port 3000:');
    console.log(result);
    
    // Extract PIDs from the netstat output
    const lines = result.trim().split('\n');
    const pids = new Set();
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid) && pid !== '0') {
        pids.add(pid);
      }
    });
    
    if (pids.size > 0) {
      console.log(`\n🔪 Killing ${pids.size} process(es)...`);
      
      pids.forEach(pid => {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'pipe' });
          console.log(`✅ Killed process ${pid}`);
        } catch (error) {
          console.log(`⚠️  Could not kill process ${pid} (may already be dead)`);
        }
      });
      
      console.log('\n✅ Port 3000 should now be available!');
      console.log('\n🚀 You can now start your backend with: npm run dev');
    } else {
      console.log('⚠️  No valid PIDs found in netstat output');
    }
  } else {
    console.log('✅ Port 3000 is already free!');
  }
} catch (error) {
  if (error.message.includes('No matching processes')) {
    console.log('✅ Port 3000 is already free!');
  } else {
    console.log('❌ Error checking port 3000:', error.message);
    console.log('\n💡 Alternative solutions:');
    console.log('1. Manually check Task Manager for Node.js processes');
    console.log('2. Restart your computer');
    console.log('3. Change the port in backend/.env to PORT=3001');
  }
}

console.log('\n📝 Next steps:');
console.log('1. cd backend');
console.log('2. npm run dev');
console.log('3. Open http://localhost:3000 in your browser');