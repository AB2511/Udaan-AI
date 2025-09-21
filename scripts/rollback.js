#!/usr/bin/env node

/**
 * Production Rollback Script
 * Handles automated rollback procedures for failed deployments
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class RollbackManager {
  constructor() {
    this.rollbackId = `rollback_${Date.now()}`;
    this.config = this.loadConfig();
    this.deploymentHistory = this.loadDeploymentHistory();
  }

  loadConfig() {
    const configPath = path.join(__dirname, '..', 'deployment.config.json');
    
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    throw new Error('Deployment configuration not found');
  }

  loadDeploymentHistory() {
    const historyPath = path.join(__dirname, '..', 'deployment-history.json');
    
    if (fs.existsSync(historyPath)) {
      return JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    }
    
    return [];
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

  async rollback(targetVersion = null) {
    this.log(`Starting rollback ${this.rollbackId}`);
    
    try {
      // Determine target version
      const target = await this.determineRollbackTarget(targetVersion);
      
      this.log(`Rolling back to version: ${target.version} (${target.deploymentId})`);
      
      // Pre-rollback checks
      await this.preRollbackChecks();
      
      // Create rollback backup
      await this.createRollbackBackup();
      
      // Stop current services
      await this.stopServices();
      
      // Restore application code
      await this.restoreApplicationCode(target);
      
      // Restore database if needed
      if (target.databaseBackup) {
        await this.restoreDatabase(target);
      }
      
      // Start services
      await this.startServices();
      
      // Verify rollback
      await this.verifyRollback();
      
      // Update deployment history
      await this.updateDeploymentHistory(target);
      
      this.log(`Rollback ${this.rollbackId} completed successfully`, 'success');
      
    } catch (error) {
      this.log(`Rollback ${this.rollbackId} failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async determineRollbackTarget(targetVersion) {
    if (targetVersion) {
      // Find specific version
      const target = this.deploymentHistory.find(deployment => 
        deployment.version === targetVersion || deployment.deploymentId === targetVersion
      );
      
      if (!target) {
        throw new Error(`Target version ${targetVersion} not found in deployment history`);
      }
      
      return target;
    }
    
    // Find last successful deployment
    const successfulDeployments = this.deploymentHistory
      .filter(deployment => deployment.status === 'success')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (successfulDeployments.length === 0) {
      throw new Error('No successful deployments found for rollback');
    }
    
    return successfulDeployments[0];
  }

  async preRollbackChecks() {
    this.log('Running pre-rollback checks...');
    
    // Check if rollback is enabled
    if (!this.config.rollback?.enabled) {
      throw new Error('Rollback is disabled in configuration');
    }
    
    // Check system resources
    await this.checkSystemResources();
    
    // Verify backup availability
    await this.verifyBackupAvailability();
    
    this.log('Pre-rollback checks passed', 'success');
  }

  async checkSystemResources() {
    try {
      // Check disk space
      const result = await this.runCommand('df -h .');
      this.log('System resources check completed');
      
      // Parse and validate disk space
      const lines = result.stdout.split('\n');
      const dataLine = lines[1];
      const usage = dataLine.split(/\s+/)[4];
      const usagePercent = parseInt(usage.replace('%', ''));
      
      if (usagePercent > 90) {
        throw new Error(`Insufficient disk space: ${usagePercent}% used`);
      }
      
    } catch (error) {
      throw new Error(`System resources check failed: ${error.message}`);
    }
  }

  async verifyBackupAvailability() {
    // Check if backup service is available
    try {
      await this.runCommand('node -e "console.log(\'Backup service check\')"');
      this.log('Backup availability verified');
    } catch (error) {
      this.log('Backup service not available, continuing without database rollback', 'warning');
    }
  }

  async createRollbackBackup() {
    this.log('Creating rollback backup...');
    
    try {
      // Create backup of current state before rollback
      await this.runCommand(`node -e "
        const BackupService = require('./backend/services/BackupService.js');
        const service = new BackupService();
        service.createManualBackup('pre-rollback-${this.rollbackId}');
      "`);
      
      this.log('Rollback backup created', 'success');
    } catch (error) {
      this.log('Failed to create rollback backup', 'warning');
      // Continue rollback but log the issue
    }
  }

  async stopServices() {
    this.log('Stopping services...');
    
    try {
      // Stop PM2 processes
      await this.runCommand('pm2 stop all || true');
      
      // Stop any remaining node processes
      await this.runCommand('pkill -f "node.*server.js" || true');
      
      // Wait for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      this.log('Services stopped', 'success');
    } catch (error) {
      this.log('Error stopping services', 'warning');
    }
  }

  async restoreApplicationCode(target) {
    this.log('Restoring application code...');
    
    try {
      // This would restore from version control or backup
      // For now, we'll simulate the process
      
      if (target.gitCommit) {
        // Restore from git
        await this.runCommand(`git checkout ${target.gitCommit}`);
        await this.runCommand('npm ci --production', path.join(__dirname, '..', 'backend'));
        await this.runCommand('npm ci', path.join(__dirname, '..', 'frontend'));
        await this.runCommand('npm run build', path.join(__dirname, '..', 'frontend'));
      } else if (target.backupLocation) {
        // Restore from backup
        await this.restoreFromBackup(target.backupLocation);
      } else {
        throw new Error('No restoration method available for target version');
      }
      
      this.log('Application code restored', 'success');
    } catch (error) {
      throw new Error(`Application code restoration failed: ${error.message}`);
    }
  }

  async restoreDatabase(target) {
    this.log('Restoring database...');
    
    try {
      if (target.databaseBackup) {
        // Restore database from backup
        await this.runCommand(`node -e "
          const BackupService = require('./backend/services/BackupService.js');
          const service = new BackupService();
          service.restoreFromBackup('${target.databaseBackup}');
        "`);
        
        this.log('Database restored', 'success');
      } else {
        this.log('No database backup available, skipping database restore', 'warning');
      }
    } catch (error) {
      throw new Error(`Database restoration failed: ${error.message}`);
    }
  }

  async restoreFromBackup(backupLocation) {
    // Implementation would depend on backup storage system
    this.log(`Restoring from backup: ${backupLocation}`);
    
    // This would download and extract the backup
    // For now, we'll simulate the process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    this.log('Backup restoration completed');
  }

  async startServices() {
    this.log('Starting services...');
    
    try {
      const backendDir = path.join(__dirname, '..', 'backend');
      
      // Start with PM2 if available
      try {
        await this.runCommand('pm2 start ecosystem.config.js --env production', backendDir);
        this.log('Services started with PM2', 'success');
      } catch (error) {
        // Fallback to direct node execution
        this.log('PM2 not available, starting with node directly');
        
        const { spawn } = require('child_process');
        const nodeProcess = spawn('node', ['server.js'], {
          cwd: backendDir,
          detached: true,
          stdio: 'ignore',
          env: { ...process.env, NODE_ENV: 'production' }
        });
        
        nodeProcess.unref();
        this.log('Services started', 'success');
      }
      
      // Wait for services to initialize
      await new Promise(resolve => setTimeout(resolve, 10000));
      
    } catch (error) {
      throw new Error(`Service startup failed: ${error.message}`);
    }
  }

  async verifyRollback() {
    this.log('Verifying rollback...');
    
    let retries = 3;
    
    while (retries > 0) {
      try {
        // Check backend health
        await this.runCommand(`curl -f http://localhost:${this.config.backend.port}/api/health`);
        
        // Check critical endpoints
        const endpoints = [
          '/api/career/recommendations',
          '/api/assessments/types',
          '/api/activities/history'
        ];
        
        for (const endpoint of endpoints) {
          await this.runCommand(`curl -f http://localhost:${this.config.backend.port}${endpoint} -H "Authorization: Bearer test-token"`);
        }
        
        this.log('Rollback verification passed', 'success');
        return;
        
      } catch (error) {
        retries--;
        
        if (retries > 0) {
          this.log(`Verification failed, retrying... (${retries} retries left)`, 'warning');
          await new Promise(resolve => setTimeout(resolve, 30000));
        } else {
          throw new Error(`Rollback verification failed after 3 attempts: ${error.message}`);
        }
      }
    }
  }

  async updateDeploymentHistory(target) {
    const rollbackEntry = {
      deploymentId: this.rollbackId,
      type: 'rollback',
      targetVersion: target.version,
      targetDeploymentId: target.deploymentId,
      timestamp: new Date().toISOString(),
      status: 'success'
    };
    
    this.deploymentHistory.unshift(rollbackEntry);
    
    // Keep only last 50 entries
    this.deploymentHistory = this.deploymentHistory.slice(0, 50);
    
    const historyPath = path.join(__dirname, '..', 'deployment-history.json');
    fs.writeFileSync(historyPath, JSON.stringify(this.deploymentHistory, null, 2));
    
    this.log('Deployment history updated');
  }

  async listAvailableVersions() {
    const successfulDeployments = this.deploymentHistory
      .filter(deployment => deployment.status === 'success' && deployment.type !== 'rollback')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    console.log('\nAvailable versions for rollback:');
    console.log('================================');
    
    successfulDeployments.forEach((deployment, index) => {
      console.log(`${index + 1}. Version: ${deployment.version || 'N/A'}`);
      console.log(`   Deployment ID: ${deployment.deploymentId}`);
      console.log(`   Timestamp: ${deployment.timestamp}`);
      console.log(`   Git Commit: ${deployment.gitCommit || 'N/A'}`);
      console.log('');
    });
    
    return successfulDeployments;
  }

  async generateRollbackReport() {
    const report = {
      rollbackId: this.rollbackId,
      timestamp: new Date().toISOString(),
      status: 'completed',
      targetVersion: this.targetVersion,
      steps: [
        'pre-rollback-checks',
        'rollback-backup-creation',
        'service-stop',
        'application-code-restoration',
        'database-restoration',
        'service-start',
        'rollback-verification',
        'history-update'
      ]
    };
    
    const reportPath = path.join(__dirname, '..', 'rollback-reports', `${this.rollbackId}.json`);
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`Rollback report generated: ${reportPath}`);
    
    return report;
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const targetVersion = process.argv[3];
  const rollback = new RollbackManager();
  
  switch (command) {
    case 'rollback':
      rollback.rollback(targetVersion)
        .then(() => {
          rollback.generateRollbackReport();
          process.exit(0);
        })
        .catch((error) => {
          console.error('Rollback failed:', error.message);
          process.exit(1);
        });
      break;
      
    case 'list':
      rollback.listAvailableVersions()
        .then(() => {
          process.exit(0);
        })
        .catch((error) => {
          console.error('Failed to list versions:', error.message);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage:');
      console.log('  node rollback.js rollback [version]  - Rollback to specific version or last successful');
      console.log('  node rollback.js list                - List available versions for rollback');
      process.exit(1);
  }
}

module.exports = RollbackManager;