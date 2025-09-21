// File upload configuration
export const fileUploadConfig = {
  // File size limits
  maxFileSize: 10 * 1024 * 1024, // 10MB
  
  // Allowed file types
  allowedExtensions: ['.pdf', '.doc', '.docx', '.txt'],
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  
  // Storage configuration
  storage: {
    baseDir: 'uploads',
    resumeDir: 'uploads/resumes',
    tempDir: 'uploads/temp',
    cleanupInterval: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    tempFileMaxAge: 2 * 60 * 60 * 1000, // 2 hours for temp files
    resumeFileMaxAge: 30 * 24 * 60 * 60 * 1000 // 30 days for resume files
  },
  
  // Security settings
  security: {
    enableVirusScanning: true,
    suspiciousPatterns: [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /eval\(/i,
      /document\./i,
      /window\./i
    ],
    maxScanLength: 2048 // Only scan first 2KB for suspicious content
  },
  
  // Processing settings
  processing: {
    timeout: 30000, // 30 seconds timeout for file processing
    retryAttempts: 3,
    retryDelay: 1000 // 1 second delay between retries
  },
  
  // Validation rules
  validation: {
    minFileSize: 100, // 100 bytes minimum
    maxFilenameLength: 255,
    allowedCharacters: /^[a-zA-Z0-9._\-\s()]+$/,
    requireExtension: true
  }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'production') {
  fileUploadConfig.maxFileSize = 5 * 1024 * 1024; // 5MB in production
  fileUploadConfig.security.enableVirusScanning = true;
  fileUploadConfig.storage.cleanupInterval = 12 * 60 * 60 * 1000; // 12 hours
}

if (process.env.NODE_ENV === 'development') {
  fileUploadConfig.maxFileSize = 20 * 1024 * 1024; // 20MB in development
  fileUploadConfig.security.enableVirusScanning = false;
}

if (process.env.NODE_ENV === 'test') {
  fileUploadConfig.maxFileSize = 1 * 1024 * 1024; // 1MB in test
  fileUploadConfig.security.enableVirusScanning = false;
  fileUploadConfig.storage.tempFileMaxAge = 5 * 60 * 1000; // 5 minutes for tests
}

export default fileUploadConfig;