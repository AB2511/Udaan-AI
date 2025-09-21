/**
 * Security configuration for the Udaan AI platform
 */

export const securityConfig = {
  // Rate limiting configuration
  rateLimiting: {
    // General API rate limiting
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // requests per window
      message: 'Too many requests from this IP'
    },
    
    // Assessment-specific rate limiting
    assessment: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // assessments per hour
      message: 'Too many assessment attempts'
    },
    
    // Interview-specific rate limiting
    interview: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5, // interviews per hour
      message: 'Too many interview attempts'
    },
    
    // File upload rate limiting
    upload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 20, // uploads per hour
      message: 'Too many file uploads'
    },
    
    // Authentication rate limiting
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // login attempts per window
      message: 'Too many login attempts'
    }
  },

  // File upload security
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['.pdf', '.doc', '.docx', '.txt'],
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
    virusScanning: {
      enabled: process.env.NODE_ENV === 'production',
      maxScanSize: 50 * 1024 * 1024, // 50MB
      quarantineThreats: true
    }
  },

  // Data encryption
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16,
    saltRounds: 12,
    
    // Fields that should be encrypted
    sensitiveFields: [
      'email',
      'phone',
      'address',
      'resume_content',
      'assessment_answers',
      'interview_responses'
    ]
  },

  // Input validation
  validation: {
    maxStringLength: 10000,
    maxArrayLength: 100,
    maxObjectDepth: 5,
    
    // Dangerous patterns to block
    dangerousPatterns: [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
      /eval\s*\(/gi,
      /document\./gi,
      /window\./gi
    ],
    
    // SQL injection patterns
    sqlInjectionPatterns: [
      /union\s+select/gi,
      /drop\s+table/gi,
      /insert\s+into/gi,
      /delete\s+from/gi,
      /update\s+set/gi
    ],
    
    // NoSQL injection patterns
    nosqlInjectionPatterns: [
      /\$where/gi,
      /\$ne/gi,
      /\$gt/gi,
      /\$lt/gi,
      /\$regex/gi
    ]
  },

  // Security headers
  headers: {
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"]
    },
    
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    
    additionalHeaders: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    }
  },

  // Session security
  session: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  },

  // CORS configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400 // 24 hours
  },

  // Logging and monitoring
  logging: {
    logLevel: process.env.LOG_LEVEL || 'info',
    logSecurityEvents: true,
    logFailedAttempts: true,
    
    // Events to log
    securityEvents: [
      'failed_login',
      'suspicious_request',
      'rate_limit_exceeded',
      'file_threat_detected',
      'injection_attempt',
      'unauthorized_access'
    ]
  },

  // Environment-specific overrides
  development: {
    rateLimiting: {
      general: { max: 1000 },
      assessment: { max: 100 },
      interview: { max: 100 },
      upload: { max: 100 }
    },
    fileUpload: {
      virusScanning: { enabled: false }
    },
    logging: {
      logLevel: 'debug'
    }
  },

  test: {
    rateLimiting: {
      general: { max: 10000 },
      assessment: { max: 1000 },
      interview: { max: 1000 },
      upload: { max: 1000 }
    },
    fileUpload: {
      maxSize: 1 * 1024 * 1024, // 1MB for tests
      virusScanning: { enabled: false }
    },
    encryption: {
      saltRounds: 4 // Faster for tests
    }
  }
};

// Apply environment-specific overrides
const env = process.env.NODE_ENV || 'development';
if (securityConfig[env]) {
  Object.assign(securityConfig, securityConfig[env]);
}

export default securityConfig;