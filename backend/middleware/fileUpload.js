import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';
import virusScanner from '../utils/virusScanner.js';
import { encryptFileContent, generateSecureToken } from '../utils/encryption.js';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.memoryStorage(); // Store in memory for processing

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file extension
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    return cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'), false);
  }
  
  // Check MIME type
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid MIME type.'), false);
  }
  
  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only one file at a time
  }
});

// Middleware for multiple field names - accepts "resume", "file", or "resumeFile"
export const uploadResume = upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'file', maxCount: 1 },
  { name: 'resumeFile', maxCount: 1 }
]);

// Enhanced file validation middleware with comprehensive security scanning
export const validateFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded'
        }
      });
    }

    const fileExtension = path.extname(req.file.originalname).toLowerCase().slice(1);

    // Comprehensive virus scanning
    const scanResults = await virusScanner.scanFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Log scan results for security monitoring
    console.log('File scan results:', {
      filename: req.file.originalname,
      isClean: scanResults.isClean,
      threats: scanResults.threats.length,
      warnings: scanResults.warnings.length,
      userIP: req.ip,
      timestamp: new Date().toISOString()
    });

    // Reject files with threats
    if (!scanResults.isClean) {
      const criticalThreats = scanResults.threats.filter(t => 
        t.severity === 'CRITICAL' || t.severity === 'HIGH'
      );

      if (criticalThreats.length > 0) {
        // Log security incident
        console.error('Security threat detected:', {
          filename: req.file.originalname,
          threats: criticalThreats,
          userIP: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        });

        return res.status(400).json({
          success: false,
          error: {
            code: 'SECURITY_THREAT_DETECTED',
            message: 'File contains security threats and cannot be processed',
            details: process.env.NODE_ENV === 'development' ? criticalThreats : undefined
          }
        });
      }
    }

    // Additional file type validation using file-type
    const detectedType = await fileTypeFromBuffer(req.file.buffer);
    const allowedTypes = ['pdf', 'doc', 'docx'];
    
    if (detectedType && !allowedTypes.includes(detectedType.ext) && fileExtension !== 'txt') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: 'File type does not match extension'
        }
      });
    }

    // Generate secure file identifier
    const secureFileId = generateSecureToken(16);

    // Encrypt file content for storage
    let encryptedContent = null;
    try {
      encryptedContent = encryptFileContent(req.file.buffer);
    } catch (encryptionError) {
      console.error('File encryption error:', encryptionError);
      // Continue without encryption in development, fail in production
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({
          success: false,
          error: {
            code: 'ENCRYPTION_ERROR',
            message: 'Failed to secure file content'
          }
        });
      }
    }

    // Add comprehensive file metadata to request
    req.fileMetadata = {
      originalName: req.file.originalname,
      secureFileId,
      size: req.file.size,
      mimeType: req.file.mimetype,
      extension: fileExtension,
      uploadedAt: new Date(),
      scanResults: {
        isClean: scanResults.isClean,
        threatsCount: scanResults.threats.length,
        warningsCount: scanResults.warnings.length,
        entropy: scanResults.metadata.entropy,
        md5: scanResults.metadata.md5,
        sha256: scanResults.metadata.sha256
      },
      encryptedContent,
      detectedType: detectedType?.mime || null
    };

    // Add warnings to response headers for monitoring
    if (scanResults.warnings.length > 0) {
      res.setHeader('X-File-Warnings', scanResults.warnings.length.toString());
    }

    next();
  } catch (error) {
    console.error('File validation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Error validating file'
      }
    });
  }
};

// File cleanup utility
export const cleanupFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error cleaning up file ${filePath}:`, error);
  }
};

// Scheduled cleanup for old files (call this periodically)
export const cleanupOldFiles = (maxAgeHours = 24) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds

    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        cleanupFile(filePath);
      }
    });
  } catch (error) {
    console.error('Error during scheduled cleanup:', error);
  }
};

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'File size exceeds 10MB limit'
          }
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: {
            code: 'TOO_MANY_FILES',
            message: 'Only one file allowed'
          }
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: {
            code: 'UNEXPECTED_FIELD',
            message: 'Unexpected file field. Expected field name: "resumeFile"'
          }
        });
      default:
        return res.status(400).json({
          success: false,
          error: {
            code: 'UPLOAD_ERROR',
            message: error.message
          }
        });
    }
  }

  if (error.message.includes('Invalid file type') || error.message.includes('Invalid MIME type')) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: error.message
      }
    });
  }

  next(error);
};

export default {
  uploadResume,
  validateFile,
  cleanupFile,
  cleanupOldFiles,
  handleUploadError
};