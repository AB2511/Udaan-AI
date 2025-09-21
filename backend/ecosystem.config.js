/**
 * PM2 Ecosystem Configuration for Production Deployment
 * Manages backend processes, clustering, and monitoring
 */

module.exports = {
  apps: [
    {
      name: 'udaan-ai-backend',
      script: 'server.js',
      cwd: __dirname,
      instances: process.env.CLUSTER_WORKERS || 'max',
      exec_mode: 'cluster',
      
      // Environment configuration
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5000,
        MONGODB_URI: process.env.MONGODB_URI,
        JWT_SECRET: process.env.JWT_SECRET,
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT: process.env.REDIS_PORT,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_REGION: process.env.AWS_REGION,
        AWS_S3_BUCKET: process.env.AWS_S3_BUCKET
      },
      
      // Process management
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads', 'temp'],
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Advanced features
      kill_timeout: 5000,
      listen_timeout: 8000,
      shutdown_with_message: true,
      
      // Health monitoring
      health_check_grace_period: 3000,
      
      // Auto restart conditions
      restart_delay: 4000,
      autorestart: true,
      
      // Source map support
      source_map_support: true,
      
      // Instance variables
      instance_var: 'INSTANCE_ID',
      
      // Graceful shutdown
      kill_retry_time: 100,
      
      // Process title
      treekill: true
    },
    
    // Monitoring service
    {
      name: 'udaan-ai-monitoring',
      script: 'scripts/monitoring-daemon.js',
      cwd: path.join(__dirname, '..'),
      instances: 1,
      exec_mode: 'fork',
      
      env_production: {
        NODE_ENV: 'production',
        MONITORING_PORT: process.env.MONITORING_PORT || 9090
      },
      
      watch: false,
      autorestart: true,
      max_memory_restart: '500M',
      
      log_file: './logs/monitoring.log',
      out_file: './logs/monitoring-out.log',
      error_file: './logs/monitoring-error.log'
    },
    
    // Backup service
    {
      name: 'udaan-ai-backup',
      script: 'scripts/backup-daemon.js',
      cwd: path.join(__dirname, '..'),
      instances: 1,
      exec_mode: 'fork',
      
      env_production: {
        NODE_ENV: 'production'
      },
      
      watch: false,
      autorestart: true,
      max_memory_restart: '300M',
      
      log_file: './logs/backup.log',
      out_file: './logs/backup-out.log',
      error_file: './logs/backup-error.log',
      
      // Run backup service with cron
      cron_restart: '0 2 * * *' // Daily at 2 AM
    }
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: process.env.DEPLOY_USER || 'ubuntu',
      host: process.env.DEPLOY_HOST || 'your-server.com',
      ref: 'origin/main',
      repo: process.env.DEPLOY_REPO || 'git@github.com:your-org/udaan-ai.git',
      path: process.env.DEPLOY_PATH || '/var/www/udaan-ai',
      
      // Pre-deployment
      'pre-deploy-local': 'echo "Starting deployment..."',
      
      // Post-deployment
      'post-deploy': [
        'npm install --production',
        'npm run migrate',
        'pm2 reload ecosystem.config.js --env production',
        'pm2 save'
      ].join(' && '),
      
      // Pre-setup
      'pre-setup': 'echo "Setting up deployment environment..."',
      
      // Post-setup
      'post-setup': [
        'ls -la',
        'npm install --production',
        'pm2 save',
        'pm2 startup'
      ].join(' && '),
      
      // Environment variables
      env: {
        NODE_ENV: 'production'
      }
    },
    
    staging: {
      user: process.env.STAGING_USER || 'ubuntu',
      host: process.env.STAGING_HOST || 'staging.your-server.com',
      ref: 'origin/develop',
      repo: process.env.DEPLOY_REPO || 'git@github.com:your-org/udaan-ai.git',
      path: process.env.STAGING_PATH || '/var/www/udaan-ai-staging',
      
      'post-deploy': [
        'npm install',
        'npm run migrate',
        'pm2 reload ecosystem.config.js --env staging',
        'pm2 save'
      ].join(' && '),
      
      env: {
        NODE_ENV: 'staging'
      }
    }
  }
};