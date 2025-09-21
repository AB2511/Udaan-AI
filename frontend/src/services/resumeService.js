import axios from 'axios';
import api from './api';
import { RESUME_ENUMS } from '../constants/enums.js';
import { handleApiError } from '../utils/apiErrorHandler.js';
import { getToken, getUserId } from './authHelpers.js';

/**
 * Resume validation error class
 */
class ResumeValidationError extends Error {
  constructor(field, value, message = null) {
    const errorMessage = message || `Invalid ${field}: "${value}"`;
    super(errorMessage);
    this.name = "ResumeValidationError";
    this.field = field;
    this.value = value;
  }
}

class ResumeService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000;
  }

  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Validate resume file before upload
   * @param {File} file - Resume file to validate
   * @throws {ResumeValidationError} If validation fails
   */
  validateResumeFile(file) {
    if (!file) {
      throw new ResumeValidationError('resumeFile', null, 'Resume file is required');
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      throw new ResumeValidationError('resumeFile.type', file.type, `Invalid file type. Allowed types: ${RESUME_ENUMS.FILE_TYPES.join(', ')}`);
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new ResumeValidationError('resumeFile.size', file.size, `File size too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
    }

    // Check if file is empty
    if (file.size === 0) {
      throw new ResumeValidationError('resumeFile.size', file.size, 'File cannot be empty');
    }

    // Check file extension
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      throw new ResumeValidationError('resumeFile.extension', fileExtension, `Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`);
    }
  }

  /**
   * Get backend base URL
   * @returns {string} Backend URL
   */
  getBackendUrl() {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }

  /**
   * Post FormData with proper headers
   * @param {string} url - Full URL
   * @param {FormData} formData - Form data to send
   * @param {Object} headers - Additional headers
   * @returns {Promise} Axios response
   */
  async postFormData(url, formData, headers = {}) {
    const config = {
      headers: {
        // axios + FormData will set multipart Content-Type boundary automatically
        ...headers,
      },
      timeout: 30000,
    };
    return axios.post(url, formData, config);
  }

  // Using centralized error handler from apiErrorHandler.js

  async uploadResume(file) {
    if (!file) throw new Error('No file provided to uploadResume');

    const token = getToken();
    const userId = getUserId();

    // Fixed: Check authentication properly - backend uses JWT token to get user ID
    if (!token) {
      throw new Error('Authentication required: Please log in to upload your resume.');
    }

    const url = `${this.getBackendUrl()}/resume/upload`;
    const formData = new FormData();
    
    // Fixed: Backend extracts userId from JWT token, but we still include it for validation
    if (userId) {
      formData.append('userId', userId);
    }
    
    // Use 'resumeFile' as primary field name (matches backend expectation)
    formData.append('resumeFile', file);

    const headers = {
      // Fixed: Ensure JWT token is included in Authorization header
      Authorization: `Bearer ${token}`,
      // Remove x-user-id header as backend uses JWT token
    };

    // Debug: log form keys
    for (const [k, v] of formData.entries()) {
      console.log('[resumeService] formData:', k, v?.name || v);
    }

    try {
      const resp = await this.postFormData(url, formData, headers);
      return resp.data;
    } catch (err) {
      console.error('[resumeService] upload error response:', err?.response?.data || err.message);
      throw err;
    }
  }

  async analyzeResume(file) {
    const token = getToken();
    const userId = getUserId();

    // Fixed: Check authentication properly - backend uses JWT token to get user ID
    if (!token) {
      throw new Error('Authentication required: Please log in to analyze your resume.');
    }

    const url = `${this.getBackendUrl()}/resume/analyze`;
    const formData = new FormData();
    
    // Fixed: Backend extracts userId from JWT token, but we still include it for validation
    if (userId) {
      formData.append('userId', userId);
    }
    formData.append('resumeFile', file);

    const headers = {
      // Fixed: Ensure JWT token is included in Authorization header
      Authorization: `Bearer ${token}`,
      // Remove x-user-id header as backend uses JWT token
    };

    try {
      const resp = await this.postFormData(url, formData, headers);
      return resp.data;
    } catch (err) {
      console.error('[resumeService] analyze error response:', err?.response?.data || err.message);
      throw err;
    }
  }

  async saveLearningPath(learningPath) {
    try {
      const response = await api.post('/resume/save-learning-path', { learningPath });
      return response.data;
    } catch (error) {
      console.error('❌ Save learning path failed:', error.message);
      throw error;
    }
  }

  async saveResumeText(resumeText) {
    try {
      const response = await api.put('/auth/resume', { resumeText });
      return response.data;
    } catch (error) {
      console.error('❌ Save resume text failed:', error.message);
      throw error;
    }
  }

  async getAnalysis(id) {
    const url = id ? `/resume/analysis/${id}` : '/resume/analysis';
    const response = await api.get(url);
    let data = response.data?.data || null;

    // Mock fallback
    if (!data) {
      data = {
        _id: id || 'mock-analysis',
        score: 85,
        strengths: ['Clarity', 'Good formatting'],
        improvements: ['Add more keywords', 'Quantify achievements']
      };
    }

    return data;
  }

  async getAnalysisHistory() {
    const cacheKey = 'resume-history';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const response = await api.get('/resume/history');
    let data = response.data?.data || [];

    // Mock fallback
    if (data.length === 0) {
      data = [
        { _id: 'mock1', filename: 'resume_john.pdf', score: 80, createdAt: new Date() },
        { _id: 'mock2', filename: 'resume_jane.pdf', score: 92, createdAt: new Date() }
      ];
    }

    this.setCachedData(cacheKey, data);
    return data;
  }

  async getLearningPath(id) {
    const url = id ? `/resume/learning-path/${id}` : '/resume/learning-path';
    const response = await api.get(url);
    let data = response.data?.data || [];

    // Mock fallback
    if (data.length === 0) {
      data = [
        { skill: 'JavaScript', status: 'in-progress' },
        { skill: 'React', status: 'not-started' },
        { skill: 'Node.js', status: 'completed' }
      ];
    }

    return data;
  }

  async updateLearningProgress(id, skill, status) {
    if (!id) throw new Error('Resume analysis ID is required');
    const response = await api.put(`/resume/learning-path/${id}`, { skill, status });
    return response.data?.data || response.data;
  }

  /**
   * Validate resume upload configuration
   * @param {Object} config - Upload configuration
   * @returns {Object} Validation result
   */
  validateUploadConfig(config) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      if (!config || typeof config !== 'object') {
        result.isValid = false;
        result.errors.push('Configuration must be a valid object');
        return result;
      }

      // Validate file
      if (!config.file) {
        result.isValid = false;
        result.errors.push('Resume file is required');
      } else {
        try {
          this.validateResumeFile(config.file);
        } catch (error) {
          result.isValid = false;
          result.errors.push(error.message);
        }
      }

      // Validate userId
      const { userId } = config.userId ? { userId: config.userId } : { userId: getUserId() };
      if (!userId) {
        result.isValid = false;
        result.errors.push('User ID is required');
      }

      // Validate analysis type if provided
      if (config.analysisType && !RESUME_ENUMS.ANALYSIS_TYPES.includes(config.analysisType)) {
        result.isValid = false;
        result.errors.push(`Invalid analysis type: "${config.analysisType}". Valid options: ${RESUME_ENUMS.ANALYSIS_TYPES.join(', ')}`);
      }

    } catch (error) {
      result.isValid = false;
      result.errors.push(`Validation error: ${error.message}`);
    }

    return result;
  }

  /**
   * Get valid file types for frontend components
   * @returns {Array} Array of valid file types
   */
  getValidFileTypes() {
    return [...RESUME_ENUMS.FILE_TYPES];
  }

  /**
   * Get valid analysis types for frontend components
   * @returns {Array} Array of valid analysis types
   */
  getValidAnalysisTypes() {
    return [...RESUME_ENUMS.ANALYSIS_TYPES];
  }

  /**
   * Check if file type is valid
   * @param {string} fileType - File MIME type
   * @returns {boolean} True if valid
   */
  isValidFileType(fileType) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return allowedTypes.includes(fileType);
  }

  /**
   * Get user-friendly file type name
   * @param {string} fileType - File MIME type or extension
   * @returns {string} Display name
   */
  getFileTypeDisplayName(fileType) {
    const displayNames = {
      'application/pdf': 'PDF Document',
      'application/msword': 'Word Document (DOC)',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document (DOCX)',
      'pdf': 'PDF Document',
      'doc': 'Word Document (DOC)',
      'docx': 'Word Document (DOCX)'
    };
    
    return displayNames[fileType] || fileType;
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  clearCache() {
    this.cache.clear();
  }
}

export const resumeService = new ResumeService();

// Named exports for direct function access
export const uploadResume = (file, userId = null) => resumeService.uploadResume(file, userId);
export const analyzeResume = (file, userId = null, analysisType = 'basic') => resumeService.analyzeResume(file, userId, analysisType);
export const saveResumeText = (resumeText) => resumeService.saveResumeText(resumeText);

// Validation exports
export const validateResumeFile = (file) => resumeService.validateResumeFile(file);
export const validateUploadConfig = (config) => resumeService.validateUploadConfig(config);

// Helper exports
export const getValidFileTypes = () => resumeService.getValidFileTypes();
export const getValidAnalysisTypes = () => resumeService.getValidAnalysisTypes();
export const isValidFileType = (fileType) => resumeService.isValidFileType(fileType);
export const getFileTypeDisplayName = (fileType) => resumeService.getFileTypeDisplayName(fileType);
export const formatFileSize = (bytes) => resumeService.formatFileSize(bytes);

export default {
  // Core API methods
  uploadResume: resumeService.uploadResume.bind(resumeService),
  analyzeResume: resumeService.analyzeResume.bind(resumeService),
  saveLearningPath: resumeService.saveLearningPath.bind(resumeService),
  saveResumeText: resumeService.saveResumeText.bind(resumeService),
  getAnalysis: resumeService.getAnalysis.bind(resumeService),
  getAnalysisHistory: resumeService.getAnalysisHistory.bind(resumeService),
  getLearningPath: resumeService.getLearningPath.bind(resumeService),
  updateLearningProgress: resumeService.updateLearningProgress.bind(resumeService),
  
  // Validation methods
  validateResumeFile: resumeService.validateResumeFile.bind(resumeService),
  validateUploadConfig: resumeService.validateUploadConfig.bind(resumeService),
  
  // Helper methods
  getValidFileTypes: resumeService.getValidFileTypes.bind(resumeService),
  getValidAnalysisTypes: resumeService.getValidAnalysisTypes.bind(resumeService),
  isValidFileType: resumeService.isValidFileType.bind(resumeService),
  getFileTypeDisplayName: resumeService.getFileTypeDisplayName.bind(resumeService),
  formatFileSize: resumeService.formatFileSize.bind(resumeService),
  getAuthFromStorage: () => ({ token: getToken(), userId: getUserId() }),
  handleApiError: (error, context) => handleApiError(error, context).message,
  
  // Cache management
  clearCache: resumeService.clearCache.bind(resumeService),
  
  // Classes and constants
  ResumeValidationError,
  ENUMS: RESUME_ENUMS
};
