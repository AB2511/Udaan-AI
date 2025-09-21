import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

class FileStorage {
  constructor() {
    this.baseDir = path.join(process.cwd(), 'uploads');
    this.resumeDir = path.join(this.baseDir, 'resumes');
    this.tempDir = path.join(this.baseDir, 'temp');
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = [this.baseDir, this.resumeDir, this.tempDir];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Generate unique filename
  generateFileName(originalName, userId) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    return `${userId}_${timestamp}_${random}${extension}`;
  }

  // Save file to disk
  async saveFile(buffer, originalName, userId, temporary = false) {
    try {
      const fileName = this.generateFileName(originalName, userId);
      const targetDir = temporary ? this.tempDir : this.resumeDir;
      const filePath = path.join(targetDir, fileName);

      await fs.promises.writeFile(filePath, buffer);

      return {
        fileName,
        filePath,
        relativePath: path.relative(this.baseDir, filePath),
        size: buffer.length
      };
    } catch (error) {
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }

  // Read file from disk
  async readFile(filePath) {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this.baseDir, filePath);
      return await fs.promises.readFile(fullPath);
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  // Delete file
  async deleteFile(filePath) {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this.baseDir, filePath);
      
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to delete file ${filePath}:`, error);
      return false;
    }
  }

  // Move file from temp to permanent storage
  async moveFromTemp(tempFileName, userId) {
    try {
      const tempPath = path.join(this.tempDir, tempFileName);
      const permanentFileName = this.generateFileName(tempFileName, userId);
      const permanentPath = path.join(this.resumeDir, permanentFileName);

      await fs.promises.rename(tempPath, permanentPath);

      return {
        fileName: permanentFileName,
        filePath: permanentPath,
        relativePath: path.relative(this.baseDir, permanentPath)
      };
    } catch (error) {
      throw new Error(`Failed to move file from temp: ${error.message}`);
    }
  }

  // Get file info
  async getFileInfo(filePath) {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this.baseDir, filePath);
      const stats = await fs.promises.stat(fullPath);
      
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        exists: true
      };
    } catch (error) {
      return {
        exists: false,
        error: error.message
      };
    }
  }

  // Clean up old files
  async cleanupOldFiles(maxAgeHours = 24, directory = 'temp') {
    try {
      const targetDir = directory === 'temp' ? this.tempDir : this.resumeDir;
      const files = await fs.promises.readdir(targetDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      let cleanedCount = 0;

      for (const file of files) {
        const filePath = path.join(targetDir, file);
        const stats = await fs.promises.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await this.deleteFile(filePath);
          cleanedCount++;
        }
      }

      return {
        success: true,
        cleanedCount,
        directory: directory
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        directory: directory
      };
    }
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      const resumeFiles = await fs.promises.readdir(this.resumeDir);
      const tempFiles = await fs.promises.readdir(this.tempDir);

      let resumeSize = 0;
      let tempSize = 0;

      // Calculate resume directory size
      for (const file of resumeFiles) {
        const stats = await fs.promises.stat(path.join(this.resumeDir, file));
        resumeSize += stats.size;
      }

      // Calculate temp directory size
      for (const file of tempFiles) {
        const stats = await fs.promises.stat(path.join(this.tempDir, file));
        tempSize += stats.size;
      }

      return {
        resume: {
          count: resumeFiles.length,
          size: resumeSize,
          sizeFormatted: this.formatBytes(resumeSize)
        },
        temp: {
          count: tempFiles.length,
          size: tempSize,
          sizeFormatted: this.formatBytes(tempSize)
        },
        total: {
          count: resumeFiles.length + tempFiles.length,
          size: resumeSize + tempSize,
          sizeFormatted: this.formatBytes(resumeSize + tempSize)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get storage stats: ${error.message}`);
    }
  }

  // Format bytes to human readable format
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Validate file path security
  validatePath(filePath) {
    const normalizedPath = path.normalize(filePath);
    const basePath = path.normalize(this.baseDir);
    
    // Ensure the path is within the base directory
    return normalizedPath.startsWith(basePath);
  }
}

// Create singleton instance
const fileStorage = new FileStorage();

export default fileStorage;