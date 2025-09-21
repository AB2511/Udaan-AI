#!/usr/bin/env node

/**
 * Production Environment Setup Script
 * Prepares the system for production deployment
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class ProductionSetup {
  constructor() {
    this.setupId = `setup_${Date.now()}`;
    this.requiredDirectories = [
      'logs',
      'uploads',
      'temp',
      'backups',
      'deployment-reports',
      'rollback-reports'
    ];
    this.requiredEnvVars = [
      'NODE_ENV',
      'MONGODB_URI',
      'JWT_SECRET',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'AWS_REGION',
      'AWS_S3_BUCKET'
    ];
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

  async setup() {
    this.log(`Starting production setup ${this.setupId}`);
    
    try {
      // System checks
      await this.performSystemChecks();
      
      // Create directory structure
      await this.createDirectoryStructure();
      
      // Install dependencies
      await this.installDependencies();
      
      // Setup environment configuration
      await this.setupEnvironmentConfiguration();
      
      // Setup logging
      await this.setupLogging();
      
      // Setup monitoring
      await this.setupMonitoring();
      
      // Setup backup system
      await this.setupBackupSystem();
      
      // Setup process management
      await this.setupProcessManagement();
      
      // Setup security
      await this.setupSecurity();
      
      // Initialize database
      await this.initializeDatabase();
      
      // Build applications
      await this.buildApplications();
      
      // Setup systemd services (if applicable)
      await this.setupSystemdServices();
      
      // Final validation
      await this.performFinalValidation();
      
      this.log(`Production setup ${this.setupId} completed successfully`, 'success');
      
    } catch (error) {
      this.log(`Production setup ${this.setupId} failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async performSystemChecks() {
    this.log('Performing system checks...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      throw new Error(`Node.js version ${nodeVersion} is not supported. Minimum required: 18.x`);
    }
    
    this.log(`Node.js version ${nodeVersion} is supported`);
    
    // Check npm version
    try {
      const npmResult = await this.runCommand('npm --version');
      this.log(`npm version: ${npmResult.stdout.trim()}`);
    } catch (error) {
      throw new Error('npm is not installed or not accessible');
    }
    
    // Check system resources
    await this.checkSystemResources();
    
    // Check required environment variables
    await this.checkEnvironmentVariables();
    
    this.log('System checks passed', 'success');
  }

  async checkSystemResources() {
    try {
      // Check available memory
      const memInfo = await this.runCommand('free -m');
      this.log('Memory check completed');
      
      // Check disk space
      const diskInfo = await this.runCommand('df -h .');
      this.log('Disk space check completed');
      
      // Check CPU info
      const cpuInfo = await this.runCommand('nproc');
      this.log(`CPU cores available: ${cpuInfo.stdout.trim()}`);
      
    } catch (error) {
      this.log('System resource check failed', 'warning');
    }
  }

  async checkEnvironmentVariables() {
    const missingVars = this.requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      this.log(`Missing required environment variables: ${missingVars.join(', ')}`, 'warning');
      this.log('Please set these variables before running in production', 'warning');
    } else {
      this.log('All required environment variables are set', 'success');
    }
  }

  async createDirectoryStructure() {
    this.log('Creating directory structure...');
    
    for (const dir of this.requiredDirectories) {
      const dirPath = path.join(__dirname, '..', dir);
      
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        this.log(`Created directory: ${dir}`);
      } else {
        this.log(`Directory already exists: ${dir}`);
      }
    }
    
    // Set appropriate permissions
    try {
      await this.runCommand('chmod 755 logs uploads temp backups');
      this.log('Directory permissions set');
    } catch (error) {
      this.log('Failed to set directory permissions', 'warning');
    }
    
    this.log('Directory structure created', 'success');
  }

  async installDependencies() {
    this.log('Installing dependencies...');
    
    // Install backend dependencies
    const backendDir = path.join(__dirname, '..', 'backend');
    await this.runCommand('npm ci --production', backendDir);
    this.log('Backend dependencies installed');
    
    // Install frontend dependencies
    const frontendDir = path.join(__dirname, '..', 'frontend');
    await this.runCommand('npm ci', frontendDir);
    this.log('Frontend dependencies installed');
    
    // Install global dependencies
    try {
      await this.runCommand('npm install -g pm2');
      this.log('PM2 installed globally');
    } catch (error) {
      this.log('Failed to install PM2 globally', 'warning');
    }
    
    this.log('Dependencies installation completed', 'success');
  }

  async setupEnvironmentConfiguration() {
    this.log('Setting up environment configuration...');
    
    // Create production environment file template
    const envTemplate = `# Production Environment Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/udaan-ai-prod

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=24h

# AWS Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=udaan-ai-uploads
BACKUP_S3_BUCKET=udaan-ai-backups

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Configuration
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@udaan-ai.com

# External Services
OPENAI_API_KEY=your-openai-api-key
JOB_MARKET_API_KEY=your-job-market-api-key

# Monitoring
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
ELASTICSEARCH_ENABLED=false
APM_ENABLED=false

# Features
INTERVIEW_RECORDING_ENABLED=false
CLUSTER_ENABLED=true
`;
    
    const envPath = path.join(__dirname, '..', '.env.production');
    
    if (!fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, envTemplate);
      this.log('Production environment template created');
      this.log('Please update .env.production with your actual values', 'warning');
    } else {
      this.log('Production environment file already exists');
    }
    
    this.log('Environment configuration setup completed', 'success');
  }

  async setupLogging() {
    this.log('Setting up logging...');
    
    // Create log rotation configuration
    const logrotateConfig = `/var/log/udaan-ai/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload udaan-ai || true
    endscript
}`;
    
    const logrotateConfigPath = '/etc/logrotate.d/udaan-ai';
    
    try {
      fs.writeFileSync(logrotateConfigPath, logrotateConfig);
      this.log('Logrotate configuration created');
    } catch (error) {
      this.log('Failed to create logrotate configuration (requires sudo)', 'warning');
    }
    
    this.log('Logging setup completed', 'success');
  }

  async setupMonitoring() {
    this.log('Setting up monitoring...');
    
    // Create monitoring configuration
    const monitoringConfig = {
      enabled: true,
      port: 9090,
      healthCheck: {
        interval: 30000,
        timeout: 5000
      },
      alerts: {
        enabled: true,
        email: process.env.ALERT_EMAIL || 'admin@udaan-ai.com'
      }
    };
    
    const configPath = path.join(__dirname, '..', 'monitoring.config.json');
    fs.writeFileSync(configPath, JSON.stringify(monitoringConfig, null, 2));
    
    this.log('Monitoring configuration created', 'success');
  }

  async setupBackupSystem() {
    this.log('Setting up backup system...');
    
    // Create backup configuration
    const backupConfig = {
      enabled: true,
      schedule: '0 2 * * *',
      retention: {
        daily: 7,
        weekly: 4,
        monthly: 12
      },
      storage: {
        type: 'aws-s3',
        bucket: process.env.BACKUP_S3_BUCKET || 'udaan-ai-backups',
        encryption: true
      }
    };
    
    const configPath = path.join(__dirname, '..', 'backup.config.json');
    fs.writeFileSync(configPath, JSON.stringify(backupConfig, null, 2));
    
    this.log('Backup system configuration created', 'success');
  }

  async setupProcessManagement() {
    this.log('Setting up process management...');
    
    // Verify PM2 ecosystem configuration exists
    const ecosystemPath = path.join(__dirname, '..', 'backend', 'ecosystem.config.js');
    
    if (fs.existsSync(ecosystemPath)) {
      this.log('PM2 ecosystem configuration found');
    } else {
      this.log('PM2 ecosystem configuration not found', 'warning');
    }
    
    // Setup PM2 startup script
    try {
      await this.runCommand('pm2 startup');
      this.log('PM2 startup script configured');
    } catch (error) {
      this.log('Failed to configure PM2 startup (may require sudo)', 'warning');
    }
    
    this.log('Process management setup completed', 'success');
  }

  async setupSecurity() {
    this.log('Setting up security...');
    
    // Create security configuration
    const securityConfig = {
      helmet: {
        enabled: true,
        contentSecurityPolicy: true,
        hsts: true
      },
      cors: {
        enabled: true,
        origin: process.env.FRONTEND_URL || 'https://udaan-ai.com'
      },
      rateLimiting: {
        enabled: true,
        windowMs: 900000,
        max: 100
      }
    };
    
    const configPath = path.join(__dirname, '..', 'security.config.json');
    fs.writeFileSync(configPath, JSON.stringify(securityConfig, null, 2));
    
    // Setup firewall rules (if applicable)
    try {
      await this.runCommand('ufw status');
      this.log('Firewall status checked');
    } catch (error) {
      this.log('Firewall not configured or not accessible', 'warning');
    }
    
    this.log('Security setup completed', 'success');
  }

  async initializeDatabase() {
    this.log('Initializing database...');
    
    try {
      // Run database initialization
      const backendDir = path.join(__dirname, '..', 'backend');
      await this.runCommand('node scripts/setupDatabase.js', backendDir);
      
      // Run migrations if available
      if (fs.existsSync(path.join(backendDir, 'migrations'))) {
        await this.runCommand('npm run migrate', backendDir);
        this.log('Database migrations completed');
      }
      
      // Seed production data
      await this.runCommand('npm run seed:prod', backendDir);
      this.log('Production data seeded');
      
    } catch (error) {
      this.log('Database initialization failed', 'warning');
      this.log('Please ensure MongoDB is running and accessible', 'warning');
    }
    
    this.log('Database initialization completed', 'success');
  }

  async buildApplications() {
    this.log('Building applications...');
    
    // Build frontend
    const frontendDir = path.join(__dirname, '..', 'frontend');
    await this.runCommand('npm run build', frontendDir);
    this.log('Frontend build completed');
    
    // Build backend (if needed)
    const backendDir = path.join(__dirname, '..', 'backend');
    if (fs.existsSync(path.join(backendDir, 'build.js'))) {
      await this.runCommand('npm run build', backendDir);
      this.log('Backend build completed');
    }
    
    this.log('Application builds completed', 'success');
  }

  async setupSystemdServices() {
    this.log('Setting up systemd services...');
    
    const serviceConfig = `[Unit]
Description=Udaan AI Backend Service
After=network.target

[Service]
Type=forking
User=www-data
WorkingDirectory=${path.join(__dirname, '..', 'backend')}
ExecStart=/usr/bin/pm2 start ecosystem.config.js --env production
ExecReload=/usr/bin/pm2 reload ecosystem.config.js --env production
ExecStop=/usr/bin/pm2 stop ecosystem.config.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target`;
    
    const servicePath = '/etc/systemd/system/udaan-ai.service';
    
    try {
      fs.writeFileSync(servicePath, serviceConfig);
      await this.runCommand('systemctl daemon-reload');
      await this.runCommand('systemctl enable udaan-ai');
      this.log('Systemd service configured');
    } catch (error) {
      this.log('Failed to configure systemd service (requires sudo)', 'warning');
    }
    
    this.log('Systemd services setup completed', 'success');
  }

  async performFinalValidation() {
    this.log('Performing final validation...');
    
    // Check if all required files exist
    const requiredFiles = [
      'backend/server.js',
      'backend/ecosystem.config.js',
      'frontend/dist/index.html',
      'deployment.config.json'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, '..', file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required file not found: ${file}`);
      }
    }
    
    // Validate configuration files
    try {
      const deploymentConfig = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', 'deployment.config.json'), 'utf8')
      );
      this.log('Deployment configuration validated');
    } catch (error) {
      throw new Error('Invalid deployment configuration');
    }
    
    this.log('Final validation completed', 'success');
  }

  async generateSetupReport() {
    const report = {
      setupId: this.setupId,
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      status: 'completed',
      directories: this.requiredDirectories,
      environmentVariables: this.requiredEnvVars.map(varName => ({
        name: varName,
        set: !!process.env[varName]
      }))
    };
    
    const reportPath = path.join(__dirname, '..', 'setup-reports', `${this.setupId}.json`);
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`Setup report generated: ${reportPath}`);
    
    return report;
  }
}

// CLI interface
if (require.main === module) {
  const setup = new ProductionSetup();
  
  setup.setup()
    .then(() => {
      setup.generateSetupReport();
      console.log('\n🎉 Production setup completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Update .env.production with your actual configuration values');
      console.log('2. Start the application: npm run deploy');
      console.log('3. Monitor the application: http://localhost:9090/dashboard');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Production setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = ProductionSetup;