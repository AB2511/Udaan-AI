import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_ROUNDS = 12;

/**
 * Generate encryption key from password
 */
const generateKey = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
};

/**
 * Get encryption key from environment or generate one
 */
const getEncryptionKey = () => {
  const envKey = process.env.ENCRYPTION_KEY;
  if (envKey) {
    return Buffer.from(envKey, 'hex');
  }
  
  // Generate a key for development (not recommended for production)
  console.warn('⚠️  No ENCRYPTION_KEY found in environment. Using generated key (not suitable for production)');
  return crypto.randomBytes(KEY_LENGTH);
};

/**
 * Encrypt sensitive data
 */
export const encryptData = (data) => {
  try {
    if (!data) return null;
    
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    cipher.setAAD(Buffer.from('udaan-ai-data'));
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt sensitive data
 */
export const decryptData = (encryptedData) => {
  try {
    if (!encryptedData || !encryptedData.encrypted) return null;
    
    const key = getEncryptionKey();
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAAD(Buffer.from('udaan-ai-data'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Hash sensitive text data (one-way)
 */
export const hashData = async (data) => {
  try {
    if (!data) return null;
    return await bcrypt.hash(data.toString(), SALT_ROUNDS);
  } catch (error) {
    console.error('Hashing error:', error);
    throw new Error('Failed to hash data');
  }
};

/**
 * Verify hashed data
 */
export const verifyHash = async (data, hash) => {
  try {
    if (!data || !hash) return false;
    return await bcrypt.compare(data.toString(), hash);
  } catch (error) {
    console.error('Hash verification error:', error);
    return false;
  }
};

/**
 * Generate secure random token
 */
export const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Encrypt file content
 */
export const encryptFileContent = (fileBuffer) => {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final()
    ]);
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv,
      tag
    };
  } catch (error) {
    console.error('File encryption error:', error);
    throw new Error('Failed to encrypt file');
  }
};

/**
 * Decrypt file content
 */
export const decryptFileContent = (encryptedFile) => {
  try {
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, encryptedFile.iv);
    decipher.setAuthTag(encryptedFile.tag);
    
    const decrypted = Buffer.concat([
      decipher.update(encryptedFile.encrypted),
      decipher.final()
    ]);
    
    return decrypted;
  } catch (error) {
    console.error('File decryption error:', error);
    throw new Error('Failed to decrypt file');
  }
};

/**
 * Sanitize and encrypt user PII
 */
export const encryptPII = (userData) => {
  const sensitiveFields = ['email', 'phone', 'address', 'ssn', 'resume_content'];
  const encrypted = { ...userData };
  
  for (const field of sensitiveFields) {
    if (encrypted[field]) {
      encrypted[field] = encryptData(encrypted[field]);
    }
  }
  
  return encrypted;
};

/**
 * Decrypt user PII
 */
export const decryptPII = (encryptedUserData) => {
  const sensitiveFields = ['email', 'phone', 'address', 'ssn', 'resume_content'];
  const decrypted = { ...encryptedUserData };
  
  for (const field of sensitiveFields) {
    if (decrypted[field] && typeof decrypted[field] === 'object') {
      decrypted[field] = decryptData(decrypted[field]);
    }
  }
  
  return decrypted;
};

/**
 * Generate encryption key for environment setup
 */
export const generateEncryptionKey = () => {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
};

/**
 * Secure data comparison (timing attack resistant)
 */
export const secureCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  
  if (a.length !== b.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

export default {
  encryptData,
  decryptData,
  hashData,
  verifyHash,
  generateSecureToken,
  encryptFileContent,
  decryptFileContent,
  encryptPII,
  decryptPII,
  generateEncryptionKey,
  secureCompare
};