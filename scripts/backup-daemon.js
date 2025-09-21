#!/usr/bin/env node

/**
 * Backup Daemon
 * Standalone backup service for automated data protection
 */

const LoggingService = require('../backend/services/LoggingService');
const BackupService = require('../backend/services/BackupService');
const productionConfig = require('../backend/config/production');

class BackupDaemon {
  constructor() {
    // Initialize services
    this.logger = new LoggingService(productionConfig.logging);
    this.backupService = new BackupService(productionConfig.backup, this.logger);
    
    // Setup graceful shutdown
    this.setupGracefulShutdown();
    
    this.logger.info('Backup daemon initialized');
  }

  setupGracefulShutdown() {
    const shutdown = (signal) => {
      this.logger.info(`Received ${signal}, shutting down backup daemon gracefully`);
      
      // Cleanup backup service
      this.backupService.shutdown();
      
      this.logger.info('Backup daemon shutdown complete');
      process.exit(0);
    };
    
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  start() {
    this.logger.info('Backup daemon started');
    this.logger.info('Scheduled backups are now active');
    
    // The BackupService handles its own scheduling
    // This daemon just keeps the process alive
    
    // Optional: Add a heartbeat to show the daemon is alive
    setInterval(() => {
      this.logger.debug('Backup daemon heartbeat');
    }, 300000); // Every 5 minutes
  }
}

// Start the backup daemon
if (require.main === module) {
  const daemon = new BackupDaemon();
  daemon.start();
}

module.exports = BackupDaemon;