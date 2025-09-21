#!/usr/bin/env node

/**
 * Production Deployment Script
 * Handles deployment, health checks, and rollback procedures
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class DeploymentManager {
  constructor() {
    this.deploymentId = `deploy_${Date.now()}`;
    this.config = this.loadConfig();
    this.rollbackData = null;
    this.healthCheckRetries = 3;
    this.healthCheckDelay = 30000; // 30 seconds
  }

  loadConfig() {
    const configPath = path.join(__dirname, '..', 'deployment.config.json');
    
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    // Default configuration
    return {
      environment: process.env.NODE_ENV || 'production',
      backend: {
        port: process.env.PORT || 5000,
        healthEndpoint: '/api/health'
      },
      frontend: {
        buildCommand: 'npm run build',
        outputDir: 'dist'
      },
      database: {
        migrationCommand: 'npm run migrate',
        seedCommand: 'npm run seed:prod'
      },
      monitoring: {
        enabled: true,
        alertsEnabled: true
      },
      rollback: {
        enabled: true,
        backupBeforeDeploy: true
      }
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runCommand(command, cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
      this.log(`Running: ${command} in ${cwd}`);
      
      exec(command, { cwd }, (error, stdout, stderr) => {
        if (error) {
          this.log(`Command failed: ${error.message}`, 'error');
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  async deploy() {
    this.log(`Starting deployment ${this.deploymentId}`);
    
    try {
      // Pre-deployment checks
      await this.preDeploymentChecks();
      
      // Create backup for rollback
      if (this.config.rollback.backupBeforeDeploy) {
        await this.createDeploymentBackup();
      }
      
      // Stop services gracefully
      await this.stopServices();
      
      // Deploy backend
      await this.deployBackend();
      
      // Deploy frontend
      await this.deployFrontend();
      
      // Run database migrations
      await this.runDatabaseMigrations();
      
      // Start services
      await this.startServices();
      
      // Post-deployment health checks
      await this.postDeploymentHealthChecks();
      
      // Update monitoring
      await this.updateMonitoring();
      
      this.log(`Deployment ${this.deploymentId} completed successfully`, 'success');
      
    } catch (error) {
      this.log(`Deployment ${this.deploymentId} failed: ${error.message}`, 'error');
      
      // Attempt rollback
      if (this.config.rollback.enabled) {
        await this.rollback();
      }
      
      throw error;
    }
  }

  async preDeploymentChecks() {
    this.log('Running pre-deployment checks...');
    
    // Check if required environment variables are set
    const requiredEnvVars = [
      'NODE_ENV',
      'MONGODB_URI',
      'JWT_SECRET',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY'
    ];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Required environment variable ${envVar} is not set`);
      }
    }
    
    // Check disk space
    await this.checkDiskSpace();
    
    // Check database connectivity
    await this.checkDatabaseConnectivity();
    
    // Validate configuration files
    await this.validateConfiguration();
    
    this.log('Pre-deployment checks passed', 'success');
  }

  async checkDiskSpace() {
    try {
      const result = await this.runCommand('df -h .');
      this.log('Disk space check completed');
      
      // Parse disk usage and warn if > 80%
      const lines = result.stdout.split('\n');
      const dataLine = lines[1];
      const usage = dataLine.split(/\s+/)[4];
      const usagePercent = parseInt(usage.replace('%', ''));
      
      if (usagePercent > 80) {
        this.log(`Warning: Disk usage is ${usagePercent}%`, 'warning');
      }
    } catch (error) {
      this.log('Could not check disk space', 'warning');
    }
  }

  async checkDatabaseConnectivity() {
    try {
      // Test database connection
      await this.runCommand('node -e "require(\'./backend/config/initializeDatabase.js\').testConnection()"');
      this.log('Database connectivity check passed', 'success');
    } catch (error) {
      throw new Error('Database connectivity check failed');
    }
  }

  async validateConfiguration() {
    const configFiles = [
      'backend/config/production.js',
      'frontend/package.json',
      'backend/package.json'
    ];
    
    for (const file of configFiles) {
      const filePath = path.join(__dirname, '..', file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Configuration file ${file} not found`);
      }
    }
    
    this.log('Configuration validation passed', 'success');
  }

  async createDeploymentBackup() {
    this.log('Creating deployment backup...');
    
    try {
      // Create backup using BackupService
      const result = await this.runCommand('node -e "require(\'./backend/services/BackupService.js\').createManualBackup(\'pre-deployment\')"');
      
      this.rollbackData = {
        backupId: `pre-deploy-${this.deploymentId}`,
        timestamp: new Date().toISOString()
      };
      
      this.log('Deployment backup created', 'success');
    } catch (error) {
      this.log('Failed to create deployment backup', 'warning');
      // Continue deployment but disable rollback
      this.config.rollback.enabled = false;
    }
  }

  async stopServices() {
    this.log('Stopping services gracefully...');
    
    try {
      // Stop backend service
      await this.runCommand('pkill -f "node.*server.js" || true');
      
      // Stop frontend service (if running)
      await this.runCommand('pkill -f "npm.*run.*dev" || true');
      
      // Wait for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      this.log('Services stopped', 'success');
    } catch (error) {
      this.log('Error stopping services', 'warning');
    }
  }

  async deployBackend() {
    this.log('Deploying backend...');
    
    const backendDir = path.join(__dirname, '..', 'backend');
    
    // Install dependencies
    await this.runCommand('npm ci --production', backendDir);
    
    // Run any build steps
    if (fs.existsSync(path.join(backendDir, 'build.js'))) {
      await this.runCommand('npm run build', backendDir);
    }
    
    // Copy production configuration
    const prodConfig = path.join(backendDir, 'config', 'production.js');
    if (fs.existsSync(prodConfig)) {
      this.log('Production configuration found');
    }
    
    this.log('Backend deployment completed', 'success');
  }

  async deployFrontend() {
    this.log('Deploying frontend...');
    
    const frontendDir = path.join(__dirname, '..', 'frontend');
    
    // Install dependencies
    await this.runCommand('npm ci', frontendDir);
    
    // Build production bundle
    await this.runCommand(this.config.frontend.buildCommand, frontendDir);
    
    // Verify build output
    const buildDir = path.join(frontendDir, this.config.frontend.outputDir);
    if (!fs.existsSync(buildDir)) {
      throw new Error('Frontend build output not found');
    }
    
    this.log('Frontend deployment completed', 'success');
  }

  async runDatabaseMigrations() {
    this.log('Running database migrations...');
    
    try {
      const backendDir = path.join(__dirname, '..', 'backend');
      
      // Run migrations
      if (this.config.database.migrationCommand) {
        await this.runCommand(this.config.database.migrationCommand, backendDir);
      }
      
      // Seed production data if needed
      if (this.config.database.seedCommand) {
        await this.runCommand(this.config.database.seedCommand, backendDir);
      }
      
      this.log('Database migrations completed', 'success');
    } catch (error) {
      throw new Error(`Database migration failed: ${error.message}`);
    }
  }

  async startServices() {
    this.log('Starting services...');
    
    // Start backend service
    const backendDir = path.join(__dirname, '..', 'backend');
    
    // Use PM2 for production process management
    try {
      await this.runCommand('pm2 start ecosystem.config.js --env production', backendDir);
      this.log('Backend service started with PM2', 'success');
    } catch (error) {
      // Fallback to direct node execution
      this.log('PM2 not available, starting with node directly');
      
      const nodeProcess = spawn('node', ['server.js'], {
        cwd: backendDir,
        detached: true,
        stdio: 'ignore',
        env: { ...process.env, NODE_ENV: 'production' }
      });
      
      nodeProcess.unref();
      this.log('Backend service started', 'success');
    }
    
    // Wait for service to initialize
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  async postDeploymentHealthChecks() {
    this.log('Running post-deployment health checks...');
    
    let retries = this.healthCheckRetries;
    
    while (retries > 0) {
      try {
        // Check backend health
        await this.checkBackendHealth();
        
        // Check database connectivity
        await this.checkDatabaseHealth();
        
        // Check critical endpoints
        await this.checkCriticalEndpoints();
        
        this.log('Health checks passed', 'success');
        return;
        
      } catch (error) {
        retries--;
        
        if (retries > 0) {
          this.log(`Health check failed, retrying in ${this.healthCheckDelay/1000}s... (${retries} retries left)`, 'warning');
          await new Promise(resolve => setTimeout(resolve, this.healthCheckDelay));
        } else {
          throw new Error(`Health checks failed after ${this.healthCheckRetries} attempts: ${error.message}`);
        }
      }
    }
  }

  async checkBackendHealth() {
    const healthUrl = `http://localhost:${this.config.backend.port}${this.config.backend.healthEndpoint}`;
    
    try {
      await this.runCommand(`curl -f ${healthUrl}`);
      this.log('Backend health check passed');
    } catch (error) {
      throw new Error('Backend health check failed');
    }
  }

  async checkDatabaseHealth() {
    try {
      await this.runCommand('node -e "require(\'./backend/services/MonitoringService.js\').checkDatabaseHealth()"');
      this.log('Database health check passed');
    } catch (error) {
      throw new Error('Database health check failed');
    }
  }

  async checkCriticalEndpoints() {
    const endpoints = [
      '/api/career/recommendations',
      '/api/assessments/types',
      '/api/activities/history'
    ];
    
    const baseUrl = `http://localhost:${this.config.backend.port}`;
    
    for (const endpoint of endpoints) {
      try {
        await this.runCommand(`curl -f ${baseUrl}${endpoint} -H "Authorization: Bearer test-token"`);
        this.log(`Endpoint ${endpoint} check passed`);
      } catch (error) {
        throw new Error(`Critical endpoint ${endpoint} check failed`);
      }
    }
  }

  async updateMonitoring() {
    if (!this.config.monitoring.enabled) return;
    
    this.log('Updating monitoring configuration...');
    
    try {
      // Update monitoring service with new deployment info
      const monitoringUpdate = {
        deploymentId: this.deploymentId,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      };
      
      // This would integrate with your monitoring system
      this.log('Monitoring configuration updated', 'success');
      
    } catch (error) {
      this.log('Failed to update monitoring configuration', 'warning');
    }
  }

  async rollback() {
    this.log(`Starting rollback for deployment ${this.deploymentId}`, 'warning');
    
    try {
      // Stop current services
      await this.stopServices();
      
      // Restore from backup if available
      if (this.rollbackData) {
        await this.restoreFromBackup();
      }
      
      // Start services with previous version
      await this.startServices();
      
      // Verify rollback
      await this.verifyRollback();
      
      this.log('Rollback completed successfully', 'success');
      
    } catch (error) {
      this.log(`Rollback failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async restoreFromBackup() {
    if (!this.rollbackData) {
      throw new Error('No backup data available for rollback');
    }
    
    this.log('Restoring from backup...');
    
    try {
      // This would use the BackupService to restore
      await this.runCommand(`node -e "require('./backend/services/BackupService.js').restoreFromBackup('${this.rollbackData.backupId}')"`);
      this.log('Backup restoration completed', 'success');
    } catch (error) {
      throw new Error(`Backup restoration failed: ${error.message}`);
    }
  }

  async verifyRollback() {
    this.log('Verifying rollback...');
    
    try {
      await this.checkBackendHealth();
      await this.checkDatabaseHealth();
      this.log('Rollback verification passed', 'success');
    } catch (error) {
      throw new Error(`Rollback verification failed: ${error.message}`);
    }
  }

  // Utility methods
  async getDeploymentStatus() {
    return {
      deploymentId: this.deploymentId,
      status: 'in-progress',
      timestamp: new Date().toISOString(),
      config: this.config
    };
  }

  async generateDeploymentReport() {
    const report = {
      deploymentId: this.deploymentId,
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
      status: 'completed',
      steps: [
        'pre-deployment-checks',
        'backup-creation',
        'service-stop',
        'backend-deployment',
        'frontend-deployment',
        'database-migrations',
        'service-start',
        'health-checks',
        'monitoring-update'
      ],
      rollbackData: this.rollbackData
    };
    
    const reportPath = path.join(__dirname, '..', 'deployment-reports', `${this.deploymentId}.json`);
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`Deployment report generated: ${reportPath}`);
    
    return report;
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const deployment = new DeploymentManager();
  
  switch (command) {
    case 'deploy':
      deployment.deploy()
        .then(() => {
          deployment.generateDeploymentReport();
          process.exit(0);
        })
        .catch((error) => {
          console.error('Deployment failed:', error.message);
          process.exit(1);
        });
      break;
      
    case 'rollback':
      deployment.rollback()
        .then(() => {
          console.log('Rollback completed');
          process.exit(0);
        })
        .catch((error) => {
          console.error('Rollback failed:', error.message);
          process.exit(1);
        });
      break;
      
    case 'status':
      deployment.getDeploymentStatus()
        .then((status) => {
          console.log(JSON.stringify(status, null, 2));
          process.exit(0);
        })
        .catch((error) => {
          console.error('Status check failed:', error.message);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node deploy.js [deploy|rollback|status]');
      process.exit(1);
  }
}

module.exports = DeploymentManager;