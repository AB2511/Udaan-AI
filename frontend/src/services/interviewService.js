
import api from './api';
import { INTERVIEW_ENUMS, EnumValidators } from '../constants/enums.js';
import { handleApiError } from '../utils/apiErrorHandler.js';

/**
 * Interview validation error class
 */
class InterviewValidationError extends Error {
  constructor(field, value, allowedValues, message = null) {
    const errorMessage = message || 
      `Invalid ${field}: "${value}". Allowed values: ${allowedValues.join(", ")}`;
    super(errorMessage);
    this.name = "InterviewValidationError";
    this.field = field;
    this.value = value;
    this.allowedValues = allowedValues;
  }
}

/**
 * Request builder class for interview API requests
 */
class InterviewRequestBuilder {
  constructor() {
    this.config = {};
  }

  /**
   * Set session type with validation
   * @param {string} sessionType - Interview session type
   */
  setSessionType(sessionType) {
    if (!sessionType) {
      throw new InterviewValidationError('sessionType', sessionType, INTERVIEW_ENUMS.SESSION_TYPES, 'Session type is required');
    }

    const normalizedType = this.normalizeSessionType(sessionType);
    if (!INTERVIEW_ENUMS.SESSION_TYPES.includes(normalizedType)) {
      throw new InterviewValidationError('sessionType', sessionType, INTERVIEW_ENUMS.SESSION_TYPES);
    }

    this.config.sessionType = normalizedType;
    return this;
  }

  /**
   * Set difficulty with validation and mapping
   * @param {string} difficulty - Interview difficulty
   */
  setDifficulty(difficulty) {
    if (!difficulty) {
      throw new InterviewValidationError('difficulty', difficulty, INTERVIEW_ENUMS.DIFFICULTIES, 'Difficulty is required');
    }

    const normalizedDifficulty = this.normalizeDifficulty(difficulty);
    if (!INTERVIEW_ENUMS.DIFFICULTIES.includes(normalizedDifficulty)) {
      throw new InterviewValidationError('difficulty', difficulty, INTERVIEW_ENUMS.DIFFICULTIES);
    }

    this.config.difficulty = normalizedDifficulty;
    return this;
  }

  /**
   * Set category with validation
   * @param {string} category - Interview category
   */
  setCategory(category) {
    if (category) {
      const normalizedCategory = this.normalizeCategory(category);
      if (!INTERVIEW_ENUMS.CATEGORIES.includes(normalizedCategory)) {
        throw new InterviewValidationError('category', category, INTERVIEW_ENUMS.CATEGORIES);
      }
      this.config.category = normalizedCategory;
    }
    return this;
  }

  /**
   * Set role with validation
   * @param {string} role - Interview role
   */
  setRole(role) {
    if (role) {
      const normalizedRole = this.normalizeRole(role);
      if (!INTERVIEW_ENUMS.ROLES.includes(normalizedRole)) {
        throw new InterviewValidationError('role', role, INTERVIEW_ENUMS.ROLES);
      }
      this.config.role = normalizedRole;
    }
    return this;
  }

  /**
   * Set experience level with validation
   * @param {string} experienceLevel - Experience level
   */
  setExperienceLevel(experienceLevel) {
    if (experienceLevel) {
      const normalizedLevel = this.normalizeExperienceLevel(experienceLevel);
      if (!INTERVIEW_ENUMS.EXPERIENCE_LEVELS.includes(normalizedLevel)) {
        throw new InterviewValidationError('experienceLevel', experienceLevel, INTERVIEW_ENUMS.EXPERIENCE_LEVELS);
      }
      this.config.experienceLevel = normalizedLevel;
    }
    return this;
  }

  /**
   * Normalize session type values
   * @param {string} sessionType - Raw session type
   */
  normalizeSessionType(sessionType) {
    if (!sessionType) return sessionType;
    
    const normalized = sessionType.toLowerCase().trim();
    const mappings = {
      'tech': 'technical',
      'technology': 'technical',
      'behaviour': 'behavioral',
      'hr-interview': 'hr',
      'human-resources': 'hr',
      'case': 'case-study',
      'casestudy': 'case-study',
      'code': 'coding',
      'programming': 'coding'
    };
    
    return mappings[normalized] || normalized;
  }

  /**
   * Normalize difficulty values - map "entry" to "easy" and other variations
   * @param {string} difficulty - Raw difficulty
   */
  normalizeDifficulty(difficulty) {
    if (!difficulty) return difficulty;
    
    const normalized = difficulty.toLowerCase().trim();
    const mappings = {
      'entry': 'easy',        // Key mapping: entry -> easy
      'beginner': 'easy',
      'basic': 'easy',
      'simple': 'easy',
      'intermediate': 'medium',
      'moderate': 'medium',
      'normal': 'medium',
      'advanced': 'hard',
      'expert': 'hard',
      'difficult': 'hard',
      'challenging': 'hard'
    };
    
    return mappings[normalized] || normalized;
  }

  /**
   * Normalize category values
   * @param {string} category - Raw category
   */
  normalizeCategory(category) {
    if (!category) return category;
    
    const normalized = category.toLowerCase().trim();
    const mappings = {
      'tech': 'technical',
      'technology': 'technical',
      'system': 'system-design',
      'systemdesign': 'system-design',
      'lead': 'leadership',
      'behaviour': 'behavioral',
      'situation': 'situational',
      'problem': 'problem-solving',
      'problemsolving': 'problem-solving',
      'comm': 'communication',
      'code': 'coding',
      'programming': 'coding',
      'algo': 'algorithms',
      'algorithm': 'algorithms'
    };
    
    return mappings[normalized] || normalized;
  }

  /**
   * Normalize role values
   * @param {string} role - Raw role
   */
  normalizeRole(role) {
    if (!role) return role;
    
    const normalized = role.toLowerCase().trim().replace(/\s+/g, '-');
    const mappings = {
      'software-engineer': 'software-developer',
      'developer': 'software-developer',
      'programmer': 'software-developer',
      'data-analyst': 'data-scientist',
      'ml-engineer': 'data-scientist',
      'pm': 'product-manager',
      'product-owner': 'product-manager',
      'marketing': 'marketing-specialist',
      'frontend': 'frontend-developer',
      'front-end': 'frontend-developer',
      'backend': 'backend-developer',
      'back-end': 'backend-developer',
      'fullstack': 'fullstack-developer',
      'full-stack': 'fullstack-developer',
      'devops': 'devops-engineer',
      'mobile': 'mobile-developer'
    };
    
    return mappings[normalized] || normalized;
  }

  /**
   * Normalize experience level values
   * @param {string} experienceLevel - Raw experience level
   */
  normalizeExperienceLevel(experienceLevel) {
    if (!experienceLevel) return experienceLevel;
    
    const normalized = experienceLevel.toLowerCase().trim();
    const mappings = {
      'junior': 'entry',
      'beginner': 'entry',
      'entry-level': 'entry',
      'middle': 'mid',
      'intermediate': 'mid',
      'mid-level': 'mid',
      'senior-level': 'senior',
      'team-lead': 'lead',
      'tech-lead': 'lead',
      'technical-lead': 'lead',
      'staff': 'principal',
      'principal-engineer': 'principal'
    };
    
    return mappings[normalized] || normalized;
  }

  /**
   * Build and validate the final request configuration
   */
  build() {
    // Validate required fields
    if (!this.config.sessionType) {
      throw new Error('Session type is required');
    }

    // Set defaults if not provided
    if (!this.config.difficulty) {
      this.config.difficulty = 'medium'; // Default to medium difficulty
    }

    return { ...this.config };
  }

  /**
   * Reset the builder
   */
  reset() {
    this.config = {};
    return this;
  }
}

export const getInterviewHistory = async () => {
  try {
    const { data } = await api.get('/interviews/history');
    return data;
  } catch (error) {
    console.error('❌ Get interview history failed:', error.message, error.response?.data);
    throw error;
  }
};

export const startInterview = async (interviewConfig) => {
  try {
    // Handle both old format (just sessionType) and new format (full config)
    let config;
    if (typeof interviewConfig === 'string') {
      // Legacy support: just sessionType
      config = new InterviewRequestBuilder()
        .setSessionType(interviewConfig)
        .build();
    } else if (typeof interviewConfig === 'object' && interviewConfig !== null) {
      // New format: full configuration object
      const builder = new InterviewRequestBuilder();
      
      if (interviewConfig.sessionType) {
        builder.setSessionType(interviewConfig.sessionType);
      }
      
      if (interviewConfig.difficulty) {
        builder.setDifficulty(interviewConfig.difficulty);
      }
      
      if (interviewConfig.category) {
        builder.setCategory(interviewConfig.category);
      }
      
      if (interviewConfig.role) {
        builder.setRole(interviewConfig.role);
      }
      
      if (interviewConfig.experienceLevel) {
        builder.setExperienceLevel(interviewConfig.experienceLevel);
      }
      
      config = builder.build();
      
      // Add careerGoal if provided (not part of builder validation)
      if (interviewConfig.careerGoal) {
        config.careerGoal = interviewConfig.careerGoal;
      }
    } else {
      throw new Error('Invalid interview configuration. Must be a string (sessionType) or configuration object.');
    }

    console.log('Starting interview with validated config:', config);
    const { data } = await api.post('/interviews/start', config);
    console.log('Interview start response:', data);
    return data;
  } catch (error) {
    if (error instanceof InterviewValidationError) {
      console.error('❌ Interview validation failed:', error.message);
      throw new Error(`Validation Error: ${error.message}`);
    }
    
    console.error('❌ Interview start failed:', error.message, error.response?.data);
    throw error;
  }
};

/**
 * Validate interview configuration
 * @param {Object} config - Interview configuration
 * @returns {Object} Validation result
 */
export const validateInterviewConfig = (config) => {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    normalizedConfig: null
  };

  try {
    if (!config || typeof config !== 'object') {
      result.isValid = false;
      result.errors.push('Configuration must be a valid object');
      return result;
    }

    const builder = new InterviewRequestBuilder();
    
    // Validate and normalize each field
    if (config.sessionType) {
      try {
        builder.setSessionType(config.sessionType);
        const normalized = builder.normalizeSessionType(config.sessionType);
        if (normalized !== config.sessionType) {
          result.warnings.push(`Session type normalized from "${config.sessionType}" to "${normalized}"`);
        }
      } catch (error) {
        result.isValid = false;
        result.errors.push(error.message);
      }
    } else {
      result.isValid = false;
      result.errors.push('Session type is required');
    }

    if (config.difficulty) {
      try {
        builder.setDifficulty(config.difficulty);
        const normalized = builder.normalizeDifficulty(config.difficulty);
        if (normalized !== config.difficulty) {
          result.warnings.push(`Difficulty normalized from "${config.difficulty}" to "${normalized}"`);
        }
      } catch (error) {
        result.isValid = false;
        result.errors.push(error.message);
      }
    }

    if (config.category) {
      try {
        builder.setCategory(config.category);
        const normalized = builder.normalizeCategory(config.category);
        if (normalized !== config.category) {
          result.warnings.push(`Category normalized from "${config.category}" to "${normalized}"`);
        }
      } catch (error) {
        result.isValid = false;
        result.errors.push(error.message);
      }
    }

    if (config.role) {
      try {
        builder.setRole(config.role);
        const normalized = builder.normalizeRole(config.role);
        if (normalized !== config.role) {
          result.warnings.push(`Role normalized from "${config.role}" to "${normalized}"`);
        }
      } catch (error) {
        result.isValid = false;
        result.errors.push(error.message);
      }
    }

    if (config.experienceLevel) {
      try {
        builder.setExperienceLevel(config.experienceLevel);
        const normalized = builder.normalizeExperienceLevel(config.experienceLevel);
        if (normalized !== config.experienceLevel) {
          result.warnings.push(`Experience level normalized from "${config.experienceLevel}" to "${normalized}"`);
        }
      } catch (error) {
        result.isValid = false;
        result.errors.push(error.message);
      }
    }

    if (result.isValid) {
      result.normalizedConfig = builder.build();
    }

  } catch (error) {
    result.isValid = false;
    result.errors.push(`Validation error: ${error.message}`);
  }

  return result;
};

/**
 * Get valid enum values for frontend components
 */
export const getValidEnumValues = () => {
  return {
    sessionTypes: [...INTERVIEW_ENUMS.SESSION_TYPES],
    difficulties: [...INTERVIEW_ENUMS.DIFFICULTIES],
    categories: [...INTERVIEW_ENUMS.CATEGORIES],
    roles: [...INTERVIEW_ENUMS.ROLES],
    experienceLevels: [...INTERVIEW_ENUMS.EXPERIENCE_LEVELS],
    statuses: [...INTERVIEW_ENUMS.STATUSES]
  };
};

/**
 * Check if a value is valid for a specific enum field
 * @param {string} field - Field name
 * @param {string} value - Value to check
 */
export const isValidEnumValue = (field, value) => {
  switch (field) {
    case 'sessionType':
      return INTERVIEW_ENUMS.SESSION_TYPES.includes(value);
    case 'difficulty':
      return INTERVIEW_ENUMS.DIFFICULTIES.includes(value);
    case 'category':
      return INTERVIEW_ENUMS.CATEGORIES.includes(value);
    case 'role':
      return INTERVIEW_ENUMS.ROLES.includes(value);
    case 'experienceLevel':
      return INTERVIEW_ENUMS.EXPERIENCE_LEVELS.includes(value);
    case 'status':
      return INTERVIEW_ENUMS.STATUSES.includes(value);
    default:
      return false;
  }
};

// Helper functions for the widget
const getInterviewTypeIcon = (sessionType) => {
  switch (sessionType) {
    case 'technical': return '💻';
    case 'hr': return '👥';
    case 'behavioral': return '🧠';
    case 'mixed': return '🔄';
    case 'case-study': return '📋';
    case 'coding': return '⌨️';
    default: return '🎤';
  }
};

const formatInterviewType = (sessionType) => {
  switch (sessionType) {
    case 'technical': return 'Technical Interview';
    case 'hr': return 'HR Interview';
    case 'behavioral': return 'Behavioral Interview';
    case 'mixed': return 'Mixed Interview';
    case 'case-study': return 'Case Study';
    case 'coding': return 'Coding Interview';
    default: return 'Interview';
  }
};

const getScoreColorClass = (score) => {
  if (score >= 80) return 'bg-green-100 text-green-800';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

/**
 * Get user-friendly display name for enum values
 * @param {string} value - Enum value
 */
const getDisplayName = (value) => {
  const displayNames = {
    // Session types
    'technical': 'Technical',
    'behavioral': 'Behavioral',
    'mixed': 'Mixed',
    'hr': 'HR',
    'case-study': 'Case Study',
    'coding': 'Coding',
    
    // Difficulties
    'easy': 'Easy',
    'medium': 'Medium',
    'hard': 'Hard',
    
    // Categories
    'system-design': 'System Design',
    'problem-solving': 'Problem Solving',
    
    // Experience levels
    'entry': 'Entry Level',
    'mid': 'Mid Level',
    'senior': 'Senior',
    'lead': 'Lead',
    'principal': 'Principal',
    
    // Roles
    'software-developer': 'Software Developer',
    'data-scientist': 'Data Scientist',
    'product-manager': 'Product Manager',
    'marketing-specialist': 'Marketing Specialist',
    'frontend-developer': 'Frontend Developer',
    'backend-developer': 'Backend Developer',
    'fullstack-developer': 'Fullstack Developer',
    'devops-engineer': 'DevOps Engineer',
    'mobile-developer': 'Mobile Developer'
  };
  
  return displayNames[value] || value.charAt(0).toUpperCase() + value.slice(1);
};

export const submitAnswer = async (interviewId, answerData) => {
  try {
    const { data } = await api.post(`/interviews/${interviewId}/answer`, answerData);
    return data;
  } catch (error) {
    console.error('❌ Submit answer failed:', error.message, error.response?.data);
    throw error;
  }
};

export const completeInterview = async (interviewId) => {
  try {
    console.log('Completing interview session:', interviewId);
    const { data } = await api.post(`/interviews/${interviewId}/complete`);
    console.log('Complete interview response:', data);
    return data;
  } catch (error) {
    console.error('❌ Complete interview failed:', error.message, error.response?.data);
    throw error;
  }
};

export const getSessions = async () => {
  try {
    const { data } = await api.get('/interviews/sessions');
    return data;
  } catch (error) {
    console.error('❌ Get sessions failed:', error.message, error.response?.data);
    // Return mock data for now
    return {
      sessions: [
        {
          _id: 'mock1',
          sessionType: 'technical',
          completedAt: new Date().toISOString(),
          overallScore: 85,
          status: 'completed'
        },
        {
          _id: 'mock2', 
          sessionType: 'behavioral',
          completedAt: new Date(Date.now() - 86400000).toISOString(),
          overallScore: 72,
          status: 'completed'
        }
      ]
    };
  }
};

// Get interview feedback
export const getInterviewFeedback = async (sessionId) => {
  try {
    console.log('Getting interview feedback for session:', sessionId);
    const { data } = await api.get(`/interviews/feedback/${sessionId}`);
    console.log('Interview feedback response:', data);
    return data;
  } catch (error) {
    console.error('❌ Get interview feedback failed:', error.message, error.response?.data);
    throw error;
  }
};

/**
 * Create a new interview request builder instance
 */
export const createInterviewRequestBuilder = () => {
  return new InterviewRequestBuilder();
};

// Using centralized error handler from apiErrorHandler.js

export const interviewService = {
  // Core API methods
  getInterviewHistory,
  startInterview,
  submitAnswer,
  completeInterview,
  getSessions,
  getInterviewFeedback,
  
  // Validation methods
  validateInterviewConfig,
  getValidEnumValues,
  isValidEnumValue,
  createInterviewRequestBuilder,
  
  // Helper methods
  getInterviewTypeIcon,
  formatInterviewType,
  getScoreColorClass,
  getDisplayName,
  
  // Error handling (using centralized handler)
  handleApiError: (error, context) => handleApiError(error, context).message,
  
  // Enum constants for easy access
  ENUMS: INTERVIEW_ENUMS
};

export default { 
  // Core API methods
  startInterview, 
  getInterviewHistory,
  submitAnswer,
  completeInterview,
  getSessions,
  getInterviewFeedback,
  
  // Validation methods
  validateInterviewConfig,
  getValidEnumValues,
  isValidEnumValue,
  createInterviewRequestBuilder,
  
  // Helper methods
  getInterviewTypeIcon,
  formatInterviewType,
  getScoreColorClass,
  getDisplayName,
  
  // Error handling (using centralized handler)
  handleApiError: (error, context) => handleApiError(error, context).message,
  
  // Classes
  InterviewRequestBuilder,
  InterviewValidationError,
  
  // Enum constants
  ENUMS: INTERVIEW_ENUMS
};
