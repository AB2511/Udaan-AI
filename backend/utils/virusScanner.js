import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';

/**
 * Enhanced virus scanning and malware detection
 */
class VirusScanner {
  constructor() {
    // Known malicious patterns and signatures
    this.maliciousPatterns = [
      // Script injection patterns
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
      /onmouseover\s*=/gi,
      
      // Common malware signatures
      /eval\s*\(/gi,
      /document\.write/gi,
      /document\.cookie/gi,
      /window\.location/gi,
      /XMLHttpRequest/gi,
      
      // Suspicious executable patterns
      /MZ\x90\x00\x03/g, // PE executable header
      /\x7fELF/g, // ELF executable header
      /\xca\xfe\xba\xbe/g, // Mach-O executable header
      
      // Macro and embedded code patterns
      /ActiveXObject/gi,
      /WScript\.Shell/gi,
      /Shell\.Application/gi,
      /CreateObject/gi,
      
      // Suspicious URLs and domains
      /https?:\/\/[a-z0-9.-]+\.(tk|ml|ga|cf|bit\.ly|tinyurl)/gi,
      
      // Base64 encoded suspicious content
      /data:text\/html;base64,/gi,
      /data:application\/javascript;base64,/gi,
      
      // PowerShell and command injection
      /powershell/gi,
      /cmd\.exe/gi,
      /system\(/gi,
      /exec\(/gi,
      /shell_exec/gi,
      
      // SQL injection patterns
      /union\s+select/gi,
      /drop\s+table/gi,
      /insert\s+into/gi,
      /delete\s+from/gi,
      
      // File inclusion patterns
      /\.\.\/\.\.\//g,
      /\/etc\/passwd/gi,
      /\/proc\/self\/environ/gi,
      
      // Suspicious file extensions in content
      /\.(exe|bat|cmd|scr|pif|com|vbs|js|jar|app|deb|rpm)$/gi
    ];

    // Known malicious file hashes (MD5)
    this.maliciousHashes = new Set([
      // Add known malicious file hashes here
      '5d41402abc4b2a76b9719d911017c592', // Example hash
      '098f6bcd4621d373cade4e832627b4f6'  // Example hash
    ]);

    // Suspicious file size patterns
    this.suspiciousFileSizes = {
      minSize: 10, // Files smaller than 10 bytes are suspicious
      maxSize: 50 * 1024 * 1024, // Files larger than 50MB are suspicious for resumes
      commonMalwareSizes: [
        1024, 2048, 4096, 8192, // Common payload sizes
        73802, 147456, 294912 // Known malware sizes
      ]
    };
  }

  /**
   * Comprehensive file scanning
   */
  async scanFile(fileBuffer, filename, mimeType) {
    const results = {
      isClean: true,
      threats: [],
      warnings: [],
      metadata: {
        size: fileBuffer.length,
        filename,
        mimeType,
        scanTime: new Date().toISOString()
      }
    };

    try {
      // 1. File size validation
      this.validateFileSize(fileBuffer, results);

      // 2. File type validation
      await this.validateFileType(fileBuffer, filename, mimeType, results);

      // 3. Content pattern scanning
      this.scanContentPatterns(fileBuffer, results);

      // 4. Hash-based detection
      this.scanFileHash(fileBuffer, results);

      // 5. Entropy analysis
      this.analyzeEntropy(fileBuffer, results);

      // 6. Metadata analysis
      this.analyzeMetadata(filename, results);

      // 7. Embedded content detection
      this.detectEmbeddedContent(fileBuffer, results);

      // Determine overall result
      results.isClean = results.threats.length === 0;

    } catch (error) {
      console.error('Virus scanning error:', error);
      results.isClean = false;
      results.threats.push({
        type: 'SCAN_ERROR',
        description: 'Error occurred during scanning',
        severity: 'HIGH'
      });
    }

    return results;
  }

  /**
   * Validate file size
   */
  validateFileSize(fileBuffer, results) {
    const size = fileBuffer.length;

    if (size < this.suspiciousFileSizes.minSize) {
      results.threats.push({
        type: 'SUSPICIOUS_SIZE',
        description: 'File size too small',
        severity: 'MEDIUM'
      });
    }

    if (size > this.suspiciousFileSizes.maxSize) {
      results.threats.push({
        type: 'FILE_TOO_LARGE',
        description: 'File size exceeds maximum allowed',
        severity: 'HIGH'
      });
    }

    if (this.suspiciousFileSizes.commonMalwareSizes.includes(size)) {
      results.warnings.push({
        type: 'SUSPICIOUS_SIZE_PATTERN',
        description: 'File size matches known malware patterns'
      });
    }
  }

  /**
   * Validate file type consistency
   */
  async validateFileType(fileBuffer, filename, mimeType, results) {
    try {
      const detectedType = await fileTypeFromBuffer(fileBuffer);
      const fileExtension = filename.split('.').pop().toLowerCase();

      // Check for file type spoofing
      if (detectedType) {
        const expectedMimeTypes = {
          'pdf': 'application/pdf',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        };

        if (expectedMimeTypes[fileExtension] && 
            detectedType.mime !== expectedMimeTypes[fileExtension]) {
          results.threats.push({
            type: 'FILE_TYPE_MISMATCH',
            description: `File extension ${fileExtension} doesn't match detected type ${detectedType.mime}`,
            severity: 'HIGH'
          });
        }
      }

      // Check for executable files disguised as documents
      if (detectedType && ['exe', 'dll', 'bat', 'cmd', 'scr'].includes(detectedType.ext)) {
        results.threats.push({
          type: 'EXECUTABLE_FILE',
          description: 'Executable file detected',
          severity: 'CRITICAL'
        });
      }

    } catch (error) {
      results.warnings.push({
        type: 'FILE_TYPE_DETECTION_ERROR',
        description: 'Could not detect file type'
      });
    }
  }

  /**
   * Scan for malicious content patterns
   */
  scanContentPatterns(fileBuffer, results) {
    const content = fileBuffer.toString('utf8', 0, Math.min(fileBuffer.length, 10240)); // First 10KB
    const binaryContent = fileBuffer.toString('binary', 0, Math.min(fileBuffer.length, 10240));

    for (const pattern of this.maliciousPatterns) {
      if (pattern.test(content) || pattern.test(binaryContent)) {
        results.threats.push({
          type: 'MALICIOUS_PATTERN',
          description: `Suspicious pattern detected: ${pattern.source}`,
          severity: 'HIGH'
        });
      }
    }

    // Check for suspicious string concentrations
    const suspiciousStrings = [
      'eval', 'exec', 'system', 'shell', 'cmd', 'powershell',
      'base64', 'decode', 'unescape', 'fromCharCode'
    ];

    let suspiciousCount = 0;
    for (const str of suspiciousStrings) {
      const matches = (content.match(new RegExp(str, 'gi')) || []).length;
      suspiciousCount += matches;
    }

    if (suspiciousCount > 5) {
      results.warnings.push({
        type: 'HIGH_SUSPICIOUS_STRING_DENSITY',
        description: `High concentration of suspicious strings (${suspiciousCount})`
      });
    }
  }

  /**
   * Hash-based malware detection
   */
  scanFileHash(fileBuffer, results) {
    const md5Hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    const sha256Hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    results.metadata.md5 = md5Hash;
    results.metadata.sha256 = sha256Hash;

    if (this.maliciousHashes.has(md5Hash)) {
      results.threats.push({
        type: 'KNOWN_MALWARE',
        description: 'File matches known malware signature',
        severity: 'CRITICAL'
      });
    }
  }

  /**
   * Entropy analysis for packed/encrypted content
   */
  analyzeEntropy(fileBuffer, results) {
    const entropy = this.calculateEntropy(fileBuffer);
    results.metadata.entropy = entropy;

    // High entropy might indicate packed/encrypted malware
    if (entropy > 7.5) {
      results.warnings.push({
        type: 'HIGH_ENTROPY',
        description: `High entropy detected (${entropy.toFixed(2)}), possible packed content`
      });
    }

    // Very low entropy might indicate suspicious padding
    if (entropy < 1.0) {
      results.warnings.push({
        type: 'LOW_ENTROPY',
        description: `Very low entropy detected (${entropy.toFixed(2)}), possible padding`
      });
    }
  }

  /**
   * Calculate Shannon entropy
   */
  calculateEntropy(buffer) {
    const frequencies = new Array(256).fill(0);
    
    for (let i = 0; i < buffer.length; i++) {
      frequencies[buffer[i]]++;
    }

    let entropy = 0;
    const length = buffer.length;

    for (let i = 0; i < 256; i++) {
      if (frequencies[i] > 0) {
        const probability = frequencies[i] / length;
        entropy -= probability * Math.log2(probability);
      }
    }

    return entropy;
  }

  /**
   * Analyze file metadata for suspicious patterns
   */
  analyzeMetadata(filename, results) {
    // Check for suspicious filename patterns
    const suspiciousFilenamePatterns = [
      /^[a-f0-9]{32}\./i, // MD5-like filenames
      /^[a-f0-9]{64}\./i, // SHA256-like filenames
      /\.(exe|bat|cmd|scr|pif|com|vbs|js)\.pdf$/i, // Double extensions
      /[^\x20-\x7E]/g, // Non-printable characters
      /\s{10,}/g, // Excessive whitespace
    ];

    for (const pattern of suspiciousFilenamePatterns) {
      if (pattern.test(filename)) {
        results.warnings.push({
          type: 'SUSPICIOUS_FILENAME',
          description: `Suspicious filename pattern: ${pattern.source}`
        });
      }
    }

    // Check filename length
    if (filename.length > 255) {
      results.warnings.push({
        type: 'LONG_FILENAME',
        description: 'Filename exceeds normal length limits'
      });
    }
  }

  /**
   * Detect embedded content and polyglot files
   */
  detectEmbeddedContent(fileBuffer, results) {
    const content = fileBuffer.toString('binary');

    // Look for embedded executables
    const executableSignatures = [
      'MZ', // PE executable
      '\x7fELF', // ELF executable
      '\xca\xfe\xba\xbe', // Mach-O
      'PK\x03\x04', // ZIP/JAR (could contain executables)
    ];

    for (const signature of executableSignatures) {
      if (content.includes(signature)) {
        results.warnings.push({
          type: 'EMBEDDED_EXECUTABLE',
          description: `Possible embedded executable detected (${signature})`
        });
      }
    }

    // Look for embedded scripts
    const scriptPatterns = [
      /%PDF.*\/JavaScript/s,
      /%PDF.*\/JS/s,
      /PK.*\.js/s,
      /PK.*\.vbs/s,
    ];

    for (const pattern of scriptPatterns) {
      if (pattern.test(content)) {
        results.threats.push({
          type: 'EMBEDDED_SCRIPT',
          description: 'Embedded script detected in document',
          severity: 'HIGH'
        });
      }
    }
  }

  /**
   * Quick scan for basic threats
   */
  quickScan(fileBuffer, filename) {
    const threats = [];

    // Basic size check
    if (fileBuffer.length > 50 * 1024 * 1024) {
      threats.push('FILE_TOO_LARGE');
    }

    // Basic pattern check (first 1KB)
    const sample = fileBuffer.toString('utf8', 0, Math.min(1024, fileBuffer.length));
    const dangerousPatterns = [
      /<script/i, /javascript:/i, /eval\(/i, /exec\(/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(sample)) {
        threats.push('MALICIOUS_PATTERN');
        break;
      }
    }

    return {
      isClean: threats.length === 0,
      threats
    };
  }
}

// Create singleton instance
const virusScanner = new VirusScanner();

export default virusScanner;
export { VirusScanner };