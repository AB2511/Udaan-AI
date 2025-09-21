import crypto from 'crypto';

/**
 * Basic input sanitization middleware for hackathon prototype
 */
export const sanitizeInput = (req, res, next) => {
  try {
    // Basic sanitization - remove null bytes and excessive whitespace
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    console.error('Input sanitization error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'SANITIZATION_ERROR',
        message: 'Invalid input data'
      }
    });
  }
};

/**
 * Basic object sanitization for hackathon prototype
 */
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // Basic sanitization - remove null bytes and trim
    return obj.replace(/\0/g, '').trim();
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
};



/**
 * Basic security headers for hackathon prototype
 */
export const securityHeaders = (req, res, next) => {
  // Essential security headers only
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
};

/**
 * Request ID middleware for tracking
 */
export const requestId = (req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
};

/**
 * Simple request logging for hackathon prototype
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Simple logging for hackathon demo
    if (res.statusCode >= 400) {
      console.warn(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    } else if (process.env.NODE_ENV === 'development') {
      console.log(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    }
  });
  
  next();
};

export default {
  sanitizeInput,
  securityHeaders,
  requestId,
  requestLogger
};