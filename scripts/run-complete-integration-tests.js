#!/usr/bin/env node

/**
 * Complete Integration Test Runner
 * Orchestrates all integration tests for task 12.1
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class IntegrationTestRunner {
  constructor() {
    this.results = {
      backend: null,
      frontend: null,
      e2e: null,
      dataConsistency: null,
      performance: null
    };
    this.processes = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runCommand(command, cwd = process.cwd(), timeout = 300000) {
    return new Promise((resolve, reject) => {
      this.log(`Running: ${command} in ${cwd}`);
      
      const child = exec(command, { cwd, timeout }, (error, stdout, stderr) => {
        if (error) {
          this.log(`Command failed: ${error.message}`, 'error');
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });

      this.processes.push(child);

      child.stdout.on('data', (data) => {
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        process.stderr.write(data);
      });
    });
  }

  async startServers() {
    this.log('Starting backend and frontend servers...');
    
    // Start backend server
    const backendProcess = spawn('npm', ['start'], {
      cwd: path.join(__dirname, '..', 'backend'),
      stdio: 'pipe'
    });

    // Start frontend server
    const frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '..', 'frontend'),
      stdio: 'pipe'
    });

    this.processes.push(backendProcess, frontendProcess);

    // Wait for servers to start
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Verify servers are running
    try {
      await this.runCommand('curl -f http://localhost:5000/api/health');
      await this.runCommand('curl -f http://localhost:3000');
      this.log('Servers started successfully', 'success');
    } catch (error) {
      throw new Error('Failed to start servers');
    }
  }

  async runBackendTests() {
    this.log('Running backend integration tests...');
    
    try {
      const result = await this.runCommand('npm test', path.join(__dirname, '..', 'backend'));
      this.results.backend = { status: 'PASSED', output: result.stdout };
      this.log('Backend tests passed', 'success');
    } catch (error) {
      this.results.backend = { status: 'FAILED', error: error.message };
      this.log('Backend tests failed', 'error');
    }
  }

  async runFrontendTests() {
    this.log('Running frontend integration tests...');
    
    try {
      const result = await this.runCommand('npm test', path.join(__dirname, '..', 'frontend'));
      this.results.frontend = { status: 'PASSED', output: result.stdout };
      this.log('Frontend tests passed', 'success');
    } catch (error) {
      this.results.frontend = { status: 'FAILED', error: error.message };
      this.log('Frontend tests failed', 'error');
    }
  }

  async runE2ETests() {
    this.log('Running end-to-end tests...');
    
    try {
      // Install Playwright if not already installed
      await this.runCommand('npx playwright install', path.join(__dirname, '..', 'frontend'));
      
      // Run Playwright tests
      const result = await this.runCommand('npx playwright test', path.join(__dirname, '..', 'frontend'));
      this.results.e2e = { status: 'PASSED', output: result.stdout };
      this.log('E2E tests passed', 'success');
    } catch (error) {
      this.results.e2e = { status: 'FAILED', error: error.message };
      this.log('E2E tests failed', 'error');
    }
  }

  async runDataConsistencyTests() {
    this.log('Running data consistency validation...');
    
    try {
      const result = await this.runCommand('node scripts/data-consistency-validator.js', path.join(__dirname, '..'));
      this.results.dataConsistency = { status: 'PASSED', output: result.stdout };
      this.log('Data consistency tests passed', 'success');
    } catch (error) {
      this.results.dataConsistency = { status: 'FAILED', error: error.message };
      this.log('Data consistency tests failed', 'error');
    }
  }

  async runPerformanceTests() {
    this.log('Running performance tests...');
    
    try {
      const result = await this.runCommand('node scripts/integration-validation.js', path.join(__dirname, '..'));
      this.results.performance = { status: 'PASSED', output: result.stdout };
      this.log('Performance tests passed', 'success');
    } catch (error) {
      this.results.performance = { status: 'FAILED', error: error.message };
      this.log('Performance tests failed', 'error');
    }
  }

  async runAccessibilityTests() {
    this.log('Running accessibility tests...');
    
    try {
      // Run axe-core accessibility tests
      const result = await this.runCommand(
        'npx vitest run src/tests/accessibility/', 
        path.join(__dirname, '..', 'frontend')
      );
      this.results.accessibility = { status: 'PASSED', output: result.stdout };
      this.log('Accessibility tests passed', 'success');
    } catch (error) {
      this.results.accessibility = { status: 'FAILED', error: error.message };
      this.log('Accessibility tests failed', 'error');
    }
  }

  async runSecurityTests() {
    this.log('Running security validation...');
    
    try {
      // Run security-focused tests
      const result = await this.runCommand(
        'npm audit --audit-level moderate',
        path.join(__dirname, '..', 'backend')
      );
      
      // Check for common security issues
      await this.runCommand(
        'npx eslint --ext .js --config .eslintrc.security.js .',
        path.join(__dirname, '..', 'backend')
      );
      
      this.results.security = { status: 'PASSED', output: result.stdout };
      this.log('Security tests passed', 'success');
    } catch (error) {
      this.results.security = { status: 'FAILED', error: error.message };
      this.log('Security tests failed', 'warning'); // Warning instead of error for security
    }
  }

  async validateAPIEndpoints() {
    this.log('Validating all API endpoints...');
    
    const endpoints = [
      'GET /api/health',
      'GET /api/career/recommendations',
      'GET /api/assessments/types',
      'POST /api/assessments/start',
      'GET /api/activities/history',
      'GET /api/activities/stats',
      'POST /api/interviews/start',
      'GET /api/interviews/types',
      'POST /api/resume/analyze'
    ];

    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const [method, path] = endpoint.split(' ');
        let curlCommand = `curl -f -X ${method} http://localhost:5000${path}`;
        
        // Add auth header for protected endpoints
        if (path !== '/api/health') {
          curlCommand += ' -H "Authorization: Bearer test-token"';
        }
        
        await this.runCommand(curlCommand);
        results.push({ endpoint, status: 'PASSED' });
      } catch (error) {
        results.push({ endpoint, status: 'FAILED', error: error.message });
      }
    }

    const failedEndpoints = results.filter(r => r.status === 'FAILED');
    if (failedEndpoints.length > 0) {
      throw new Error(`${failedEndpoints.length} endpoints failed validation`);
    }

    this.log('All API endpoints validated successfully', 'success');
  }

  async generateComprehensiveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalCategories: Object.keys(this.results).length,
        passed: Object.values(this.results).filter(r => r && r.status === 'PASSED').length,
        failed: Object.values(this.results).filter(r => r && r.status === 'FAILED').length,
        skipped: Object.values(this.results).filter(r => r === null).length
      },
      results: this.results,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cwd: process.cwd()
      }
    };

    // Calculate success rate
    const total = report.summary.passed + report.summary.failed;
    report.summary.successRate = total > 0 ? `${((report.summary.passed / total) * 100).toFixed(2)}%` : '0%';

    // Write detailed report
    const reportPath = path.join(__dirname, '..', 'integration-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlReportPath = path.join(__dirname, '..', 'integration-test-report.html');
    fs.writeFileSync(htmlReportPath, htmlReport);

    this.log(`Comprehensive report generated: ${reportPath}`);
    this.log(`HTML report generated: ${htmlReportPath}`);

    return report;
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Integration Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .stat-card { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
        .passed { border-left: 4px solid #28a745; }
        .failed { border-left: 4px solid #dc3545; }
        .skipped { border-left: 4px solid #ffc107; }
        .results { margin-top: 30px; }
        .result-item { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .result-header { font-weight: bold; margin-bottom: 10px; }
        .result-status { padding: 4px 8px; border-radius: 4px; color: white; font-size: 12px; }
        .status-passed { background: #28a745; }
        .status-failed { background: #dc3545; }
        .status-skipped { background: #6c757d; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Integration Test Report</h1>
        <p>Generated: ${report.timestamp}</p>
        <p>Success Rate: ${report.summary.successRate}</p>
    </div>

    <div class="summary">
        <div class="stat-card passed">
            <h3>${report.summary.passed}</h3>
            <p>Passed</p>
        </div>
        <div class="stat-card failed">
            <h3>${report.summary.failed}</h3>
            <p>Failed</p>
        </div>
        <div class="stat-card skipped">
            <h3>${report.summary.skipped}</h3>
            <p>Skipped</p>
        </div>
        <div class="stat-card">
            <h3>${report.summary.totalCategories}</h3>
            <p>Total Categories</p>
        </div>
    </div>

    <div class="results">
        <h2>Test Results</h2>
        ${Object.entries(report.results).map(([category, result]) => `
            <div class="result-item">
                <div class="result-header">
                    ${category.charAt(0).toUpperCase() + category.slice(1)} Tests
                    <span class="result-status status-${result ? result.status.toLowerCase() : 'skipped'}">
                        ${result ? result.status : 'SKIPPED'}
                    </span>
                </div>
                ${result && result.error ? `<div style="color: #dc3545; margin-top: 10px;">Error: ${result.error}</div>` : ''}
                ${result && result.output ? `<pre>${result.output.substring(0, 1000)}${result.output.length > 1000 ? '...' : ''}</pre>` : ''}
            </div>
        `).join('')}
    </div>

    <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <h3>Environment Information</h3>
        <ul>
            <li>Node.js Version: ${report.environment.nodeVersion}</li>
            <li>Platform: ${report.environment.platform}</li>
            <li>Architecture: ${report.environment.arch}</li>
            <li>Working Directory: ${report.environment.cwd}</li>
        </ul>
    </div>
</body>
</html>
    `;
  }

  async cleanup() {
    this.log('Cleaning up processes...');
    
    // Kill all spawned processes
    this.processes.forEach(process => {
      if (process && !process.killed) {
        process.kill('SIGTERM');
      }
    });

    // Wait a moment for graceful shutdown
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Force kill if still running
    this.processes.forEach(process => {
      if (process && !process.killed) {
        process.kill('SIGKILL');
      }
    });
  }

  async run() {
    this.log('Starting complete integration test suite...');

    try {
      // Start servers
      await this.startServers();

      // Run all test categories
      await this.runBackendTests();
      await this.runFrontendTests();
      await this.runE2ETests();
      await this.runDataConsistencyTests();
      await this.runPerformanceTests();
      await this.runAccessibilityTests();
      await this.runSecurityTests();
      await this.validateAPIEndpoints();

      // Generate comprehensive report
      const report = await this.generateComprehensiveReport();

      this.log('Integration test suite completed!');
      this.log(`Results: ${report.summary.passed} passed, ${report.summary.failed} failed, ${report.summary.skipped} skipped`);
      this.log(`Success rate: ${report.summary.successRate}`);

      // Cleanup
      await this.cleanup();

      // Exit with appropriate code
      if (report.summary.failed > 0) {
        process.exit(1);
      }

    } catch (error) {
      this.log(`Integration test suite failed: ${error.message}`, 'error');
      await this.cleanup();
      process.exit(1);
    }
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, cleaning up...');
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, cleaning up...');
  process.exit(1);
});

// Run the test suite if this script is executed directly
if (require.main === module) {
  const runner = new IntegrationTestRunner();
  runner.run();
}

module.exports = IntegrationTestRunner;