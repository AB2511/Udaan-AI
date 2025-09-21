#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Running Udaan AI Integration Tests\n');

// Test configurations
const testSuites = [
  {
    name: 'Backend API Integration Tests',
    command: 'npm',
    args: ['test', '--', 'tests/integration/', '--verbose'],
    cwd: path.join(__dirname, 'backend'),
    description: 'Testing backend API endpoints and integration'
  },
  {
    name: 'Frontend Integration Tests',
    command: 'npm',
    args: ['test', '--', 'src/tests/integration/', '--watchAll=false'],
    cwd: path.join(__dirname, 'frontend'),
    description: 'Testing frontend user flows and integration'
  },
  {
    name: 'Responsive Design Tests',
    command: 'npm',
    args: ['test', '--', 'src/tests/responsive/', '--watchAll=false'],
    cwd: path.join(__dirname, 'frontend'),
    description: 'Testing responsive design across different screen sizes'
  }
];

// Helper function to run a test suite
const runTestSuite = (suite) => {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 ${suite.name}`);
    console.log(`   ${suite.description}`);
    console.log(`   Running: ${suite.command} ${suite.args.join(' ')}`);
    console.log(`   Directory: ${suite.cwd}\n`);

    const child = spawn(suite.command, suite.args, {
      cwd: suite.cwd,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${suite.name} completed successfully\n`);
        resolve({ suite: suite.name, success: true, code });
      } else {
        console.log(`❌ ${suite.name} failed with code ${code}\n`);
        resolve({ suite: suite.name, success: false, code });
      }
    });

    child.on('error', (error) => {
      console.error(`❌ Error running ${suite.name}:`, error.message);
      resolve({ suite: suite.name, success: false, error: error.message });
    });
  });
};

// Helper function to check if dependencies are installed
const checkDependencies = async () => {
  console.log('🔍 Checking dependencies...\n');
  
  const checks = [
    {
      name: 'Backend Dependencies',
      command: 'npm',
      args: ['list', '--depth=0'],
      cwd: path.join(__dirname, 'backend')
    },
    {
      name: 'Frontend Dependencies',
      command: 'npm',
      args: ['list', '--depth=0'],
      cwd: path.join(__dirname, 'frontend')
    }
  ];

  for (const check of checks) {
    try {
      console.log(`   Checking ${check.name}...`);
      const child = spawn(check.command, check.args, {
        cwd: check.cwd,
        stdio: 'pipe',
        shell: true
      });

      await new Promise((resolve) => {
        child.on('close', (code) => {
          if (code === 0) {
            console.log(`   ✅ ${check.name} - OK`);
          } else {
            console.log(`   ⚠️  ${check.name} - Some issues detected (code: ${code})`);
          }
          resolve();
        });
      });
    } catch (error) {
      console.log(`   ❌ ${check.name} - Error: ${error.message}`);
    }
  }
  console.log('');
};

// Main test runner
const runAllTests = async () => {
  const startTime = Date.now();
  
  console.log('🚀 Starting Udaan AI Integration Test Suite');
  console.log('=' .repeat(50));
  
  // Check dependencies first
  await checkDependencies();
  
  console.log('📊 Test Summary:');
  testSuites.forEach((suite, index) => {
    console.log(`   ${index + 1}. ${suite.name}`);
  });
  console.log('');

  // Run all test suites
  const results = [];
  
  for (const suite of testSuites) {
    const result = await runTestSuite(suite);
    results.push(result);
  }

  // Print final summary
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  
  console.log('=' .repeat(50));
  console.log('📊 Final Test Results Summary');
  console.log('=' .repeat(50));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const code = result.code !== undefined ? ` (code: ${result.code})` : '';
    const error = result.error ? ` - ${result.error}` : '';
    console.log(`${status} ${result.suite}${code}${error}`);
  });
  
  console.log('');
  console.log(`📈 Results: ${successful} passed, ${failed} failed`);
  console.log(`⏱️  Total time: ${duration}s`);
  
  if (failed === 0) {
    console.log('🎉 All integration tests completed successfully!');
    console.log('');
    console.log('✅ Backend API endpoints are working correctly');
    console.log('✅ Frontend user flows are functioning properly');
    console.log('✅ Responsive design is working across screen sizes');
    console.log('✅ API integration and error handling are validated');
  } else {
    console.log('⚠️  Some tests failed. Please review the output above.');
    console.log('');
    console.log('💡 Common issues:');
    console.log('   - MongoDB not running (for database tests)');
    console.log('   - Missing dependencies (run npm install)');
    console.log('   - Environment variables not set');
  }
  
  console.log('');
  console.log('📋 Next Steps:');
  console.log('   1. Review any failed tests and fix issues');
  console.log('   2. Ensure MongoDB is running for database tests');
  console.log('   3. Start the backend server: cd backend && npm run dev');
  console.log('   4. Start the frontend server: cd frontend && npm run dev');
  console.log('   5. Test the complete application manually');
  
  process.exit(failed > 0 ? 1 : 0);
};

// Handle process interruption
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Test execution interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Test execution terminated');
  process.exit(1);
});

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Fatal error running tests:', error);
  process.exit(1);
});