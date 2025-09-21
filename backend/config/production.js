/**
 * Production Environment Configuration
 * Optimized settings for production deployment
 */

const path = require('path');

module.exports = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0',
    cors: {
      origin: process.env.FRONTEND_URL || 'https://udaan-ai.com',
      credentials: true,
      optionsSuccessStatus: 200
    },
    compression: true,
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", process.env.API_BASE_URL || 'https://api.udaan-ai.com']
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }
  },

  // Database Configuration
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/udaan-ai-prod',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        bufferCommands: false,
        retryWrites: true,
        w: 'majority'
      }
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB || 0,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null
    }
  },

  // Authentication & Security
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
    bcryptRounds: 12,
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    },
    sessionTimeout: 30 * 60 * 1000 // 30 minutes
  },

  // File Storage
  storage: {
    type: process.env.STORAGE_TYPE || 'aws-s3',
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.AWS_S3_BUCKET || 'udaan-ai-uploads',
      cloudFront: process.env.AWS_CLOUDFRONT_URL
    },
    local: {
      uploadPath: path.join(__dirname, '..', 'uploads'),
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    transports: {
      console: {
        enabled: true,
        colorize: false
      },
      file: {
        enabled: true,
        filename: path.join(__dirname, '..', 'logs', 'app.log'),
        maxsize: 10485760, // 10MB
        maxFiles: 5,
        tailable: true
      },
      elasticsearch: {
        enabled: process.env.ELASTICSEARCH_ENABLED === 'true',
        host: process.env.ELASTICSEARCH_HOST || 'localhost:9200',
        index: process.env.ELASTICSEARCH_INDEX || 'udaan-ai-logs'
      }
    }
  },

  // Monitoring & Metrics
  monitoring: {
    prometheus: {
      enabled: process.env.PROMETHEUS_ENABLED === 'true',
      port: process.env.PROMETHEUS_PORT || 9090,
      endpoint: '/metrics'
    },
    healthCheck: {
      endpoint: '/health',
      timeout: 5000
    },
    apm: {
      enabled: process.env.APM_ENABLED === 'true',
      serviceName: 'udaan-ai-backend',
      serverUrl: process.env.APM_SERVER_URL,
      secretToken: process.env.APM_SECRET_TOKEN
    }
  },

  // Cache Configuration
  cache: {
    redis: {
      enabled: true,
      ttl: {
        default: 3600, // 1 hour
        recommendations: 1800, // 30 minutes
        assessments: 7200, // 2 hours
        userProfile: 900 // 15 minutes
      }
    },
    memory: {
      enabled: false, // Disabled in production
      max: 100
    }
  },

  // Email Configuration
  email: {
    service: process.env.EMAIL_SERVICE || 'sendgrid',
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
      from: process.env.EMAIL_FROM || 'noreply@udaan-ai.com'
    },
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }
  },

  // External Services
  services: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      maxTokens: 1000,
      timeout: 30000
    },
    jobMarketApi: {
      baseUrl: process.env.JOB_MARKET_API_URL,
      apiKey: process.env.JOB_MARKET_API_KEY,
      timeout: 10000
    }
  },

  // Performance Settings
  performance: {
    compression: {
      enabled: true,
      level: 6,
      threshold: 1024
    },
    clustering: {
      enabled: process.env.CLUSTER_ENABLED === 'true',
      workers: process.env.CLUSTER_WORKERS || require('os').cpus().length
    },
    gracefulShutdown: {
      timeout: 30000 // 30 seconds
    }
  },

  // Feature Flags
  features: {
    careerRecommendations: {
      enabled: true,
      aiPowered: true,
      cacheEnabled: true
    },
    skillAssessments: {
      enabled: true,
      adaptiveQuestioning: true,
      timeLimit: 30 * 60 * 1000 // 30 minutes
    },
    resumeAnalysis: {
      enabled: true,
      aiParsing: true,
      virusScanning: true
    },
    mockInterviews: {
      enabled: true,
      recordingEnabled: process.env.INTERVIEW_RECORDING_ENABLED === 'true',
      aiAnalysis: true
    },
    activityTracking: {
      enabled: true,
      realTimeUpdates: true,
      analytics: true
    }
  },

  // Backup Configuration
  backup: {
    enabled: true,
    schedule: '0 2 * * *', // Daily at 2 AM
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
  }
};