#!/usr/bin/env node

// Environment check script for Udaan AI Platform
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Udaan AI Platform Environment Check\n');

// Check Node.js version
try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    console.log(`✅ Node.js: ${nodeVersion}`);
    
    if (majorVersion >= 18) {
        console.log('   ✅ Version requirement met (>=18)');
    } else {
        console.log('   ❌ Version requirement not met (need >=18)');
        console.log('   Please update Node.js to version 18 or higher');
    }
} catch (error) {
    console.log('❌ Node.js: Not found');
}

// Check npm version
try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm: ${npmVersion}`);
} catch (error) {
    console.log('❌ npm: Not found');
}

console.log('\n📁 Project Structure Check:');

// Check project directories
const directories = ['frontend', 'backend', '.kiro'];
directories.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`✅ ${dir}/ directory exists`);
    } else {
        console.log(`❌ ${dir}/ directory missing`);
    }
});

// Check package.json files
const packageFiles = [
    'package.json',
    'frontend/package.json',
    'backend/package.json'
];

console.log('\n📦 Package Configuration Check:');
packageFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
        try {
            const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
            console.log(`   Name: ${pkg.name}`);
            console.log(`   Version: ${pkg.version}`);
        } catch (error) {
            console.log(`   ❌ Invalid JSON in ${file}`);
        }
    } else {
        console.log(`❌ ${file} missing`);
    }
});

// Check node_modules
console.log('\n📚 Dependencies Check:');
const nodeModulesDirs = ['node_modules', 'frontend/node_modules', 'backend/node_modules'];
nodeModulesDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`✅ ${dir}/ exists`);
    } else {
        console.log(`❌ ${dir}/ missing - run npm install`);
    }
});

// Check environment files
console.log('\n🔧 Configuration Check:');
const configFiles = [
    'backend/.env',
    'backend/.env.example',
    'frontend/vite.config.js',
    'frontend/tailwind.config.js'
];

configFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
    }
});

console.log('\n🚀 Next Steps:');
console.log('1. Ensure Node.js >=18 is installed');
console.log('2. Run: npm run install:all');
console.log('3. Configure backend/.env file');
console.log('4. Run: npm run dev');

console.log('\n📖 For detailed setup instructions, see setup.md');