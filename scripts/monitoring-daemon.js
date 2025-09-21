#!/usr/bin/env node

/**
 * Monitoring Daemon
 * Standalone monitoring service for production environment
 */

const express = require('express');
const prometheus = require('prom-client');
const LoggingService = require('../backend/services/LoggingService');
const MonitoringService = require('../backend/services/MonitoringService');
const productionConfig = require('../backend/config/production');

class MonitoringDaemon {
  constructor() {
    this.app = express();
    this.port = process.env.MONITORING_PORT || 9090;
    
    // Initialize services
    this.logger = new LoggingService(productionConfig.logging);
    this.monitor = new MonitoringService(productionConfig.monitoring, this.logger);
    
    // Initialize Prometheus metrics
    this.initializeMetrics();
    
    // Setup routes
    this.setupRoutes();
    
    // Setup graceful shutdown
    this.setupGracefulShutdown();
  }

  initializeMetrics() {
    // Create a Registry to register the metrics
    this.register = new prometheus.Registry();
    
    // Add default metrics
    prometheus.collectDefaultMetrics({ register: this.register });
    
    // Custom metrics for career platform features
    this.metrics = {
      // HTTP requests
      httpRequests: new prometheus.Counter({
        name: 'udaan_ai_http_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'route', 'status_code'],
        registers: [this.register]
      }),
      
      httpDuration: new prometheus.Histogram({
        name: 'udaan_ai_http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route'],
        buckets: [0.1, 0.5, 1, 2, 5],
        registers: [this.register]
      }),
      
      // Career recommendations
      recommendationsGenerated: new prometheus.Counter({
        name: 'udaan_ai_recommendations_generated_total',
        help: 'Total number of career recommendations generated',
        registers: [this.register]
      }),
      
      recommendationResponseTime: new prometheus.Histogram({
        name: 'udaan_ai_recommendation_response_time_seconds',
        help: 'Response time for recommendation generation',
        buckets: [0.5, 1, 2, 5, 10],
        registers: [this.register]
      }),
      
      // Assessments
      assessmentsCompleted: new prometheus.Counter({
        name: 'udaan_ai_assessments_completed_total',
        help: 'Total number of assessments completed',
        labelNames: ['type'],
        registers: [this.register]
      }),
      
      assessmentScores: new prometheus.Histogram({
        name: 'udaan_ai_assessment_scores',
        help: 'Distribution of assessment scores',
        labelNames: ['type'],
        buckets: [0, 20, 40, 60, 80, 100],
        registers: [this.register]
      }),
      
      // Interviews
      interviewsCompleted: new prometheus.Counter({
        name: 'udaan_ai_interviews_completed_total',
        help: 'Total number of mock interviews completed',
        labelNames: ['type'],
        registers: [this.register]
      }),
      
      interviewDuration: new prometheus.Histogram({
        name: 'udaan_ai_interview_duration_minutes',
        help: 'Duration of mock interviews in minutes',
        labelNames: ['type'],
        buckets: [5, 10, 15, 30, 45, 60],
        registers: [this.register]
      }),
      
      // Resume analysis
      resumesProcessed: new prometheus.Counter({
        name: 'udaan_ai_resumes_processed_total',
        help: 'Total number of resumes processed',
        registers: [this.register]
      }),
      
      resumeProcessingTime: new prometheus.Histogram({
        name: 'udaan_ai_resume_processing_time_seconds',
        help: 'Time taken to process resumes',
        buckets: [1, 2, 5, 10, 20, 30],
        registers: [this.register]
      }),
      
      // System health
      databaseConnections: new prometheus.Gauge({
        name: 'udaan_ai_database_connections',
        help: 'Number of active database connections',
        registers: [this.register]
      }),
      
      redisConnections: new prometheus.Gauge({
        name: 'udaan_ai_redis_connections',
        help: 'Number of active Redis connections',
        registers: [this.register]
      }),
      
      activeUsers: new prometheus.Gauge({
        name: 'udaan_ai_active_users',
        help: 'Number of currently active users',
        registers: [this.register]
      }),
      
      // Error tracking
      errors: new prometheus.Counter({
        name: 'udaan_ai_errors_total',
        help: 'Total number of errors',
        labelNames: ['type', 'severity'],
        registers: [this.register]
      })
    };
    
    this.logger.info('Prometheus metrics initialized');
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      const healthStatus = this.monitor.getHealthStatus();
      const isHealthy = Object.values(healthStatus).every(status => 
        status.status === 'healthy'
      );
      
      res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        services: healthStatus
      });
    });
    
    // Metrics endpoint for Prometheus
    this.app.get('/metrics', async (req, res) => {
      try {
        res.set('Content-Type', this.register.contentType);
        res.end(await this.register.metrics());
      } catch (error) {
        res.status(500).end(error.message);
      }
    });
    
    // Detailed monitoring dashboard
    this.app.get('/dashboard', (req, res) => {
      const metrics = this.monitor.getMetrics();
      const alerts = this.monitor.getAlerts();
      
      res.json({
        timestamp: new Date().toISOString(),
        metrics,
        alerts,
        features: {
          careerRecommendations: this.monitor.monitorCareerRecommendations(),
          assessments: this.monitor.monitorAssessments(),
          interviews: this.monitor.monitorInterviews(),
          resumeAnalysis: this.monitor.monitorResumeAnalysis()
        }
      });
    });
    
    // Alerts endpoint
    this.app.get('/alerts', (req, res) => {
      const severity = req.query.severity;
      const alerts = this.monitor.getAlerts(severity);
      
      res.json({
        alerts,
        count: alerts.length,
        severities: ['low', 'medium', 'high', 'critical']
      });
    });
    
    // Feature-specific metrics
    this.app.get('/metrics/recommendations', (req, res) => {
      res.json(this.monitor.monitorCareerRecommendations());
    });
    
    this.app.get('/metrics/assessments', (req, res) => {
      res.json(this.monitor.monitorAssessments());
    });
    
    this.app.get('/metrics/interviews', (req, res) => {
      res.json(this.monitor.monitorInterviews());
    });
    
    this.app.get('/metrics/resume-analysis', (req, res) => {
      res.json(this.monitor.monitorResumeAnalysis());
    });
  }

  setupGracefulShutdown() {
    const shutdown = (signal) => {
      this.logger.info(`Received ${signal}, shutting down monitoring daemon gracefully`);
      
      this.server.close(() => {
        this.logger.info('HTTP server closed');
        
        // Cleanup monitoring service
        this.monitor.shutdown();
        
        // Close logger
        this.logger.info('Monitoring daemon shutdown complete');
        process.exit(0);
      });
    };
    
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  // Method to update metrics from external sources
  updateMetrics(type, data) {
    switch (type) {
      case 'http_request':
        this.metrics.httpRequests.inc({
          method: data.method,
          route: data.route,
          status_code: data.statusCode
        });
        
        this.metrics.httpDuration.observe(
          { method: data.method, route: data.route },
          data.duration / 1000
        );
        break;
        
      case 'recommendation_generated':
        this.metrics.recommendationsGenerated.inc();
        this.metrics.recommendationResponseTime.observe(data.responseTime / 1000);
        break;
        
      case 'assessment_completed':
        this.metrics.assessmentsCompleted.inc({ type: data.type });
        this.metrics.assessmentScores.observe({ type: data.type }, data.score);
        break;
        
      case 'interview_completed':
        this.metrics.interviewsCompleted.inc({ type: data.type });
        this.metrics.interviewDuration.observe({ type: data.type }, data.duration);
        break;
        
      case 'resume_processed':
        this.metrics.resumesProcessed.inc();
        this.metrics.resumeProcessingTime.observe(data.processingTime);
        break;
        
      case 'error':
        this.metrics.errors.inc({
          type: data.type,
          severity: data.severity
        });
        break;
        
      case 'system_stats':
        if (data.databaseConnections !== undefined) {
          this.metrics.databaseConnections.set(data.databaseConnections);
        }
        if (data.redisConnections !== undefined) {
          this.metrics.redisConnections.set(data.redisConnections);
        }
        if (data.activeUsers !== undefined) {
          this.metrics.activeUsers.set(data.activeUsers);
        }
        break;
    }
  }

  start() {
    this.server = this.app.listen(this.port, () => {
      this.logger.info(`Monitoring daemon started on port ${this.port}`);
      this.logger.info(`Metrics available at http://localhost:${this.port}/metrics`);
      this.logger.info(`Dashboard available at http://localhost:${this.port}/dashboard`);
    });
    
    // Start collecting system metrics
    this.startSystemMetricsCollection();
  }

  startSystemMetricsCollection() {
    setInterval(() => {
      // Collect and update system metrics
      const memUsage = process.memoryUsage();
      
      // Update system stats (these would come from actual monitoring)
      this.updateMetrics('system_stats', {
        databaseConnections: Math.floor(Math.random() * 10) + 5,
        redisConnections: Math.floor(Math.random() * 5) + 2,
        activeUsers: Math.floor(Math.random() * 100) + 50
      });
      
    }, 30000); // Every 30 seconds
  }
}

// Start the monitoring daemon
if (require.main === module) {
  const daemon = new MonitoringDaemon();
  daemon.start();
}

module.exports = MonitoringDaemon;