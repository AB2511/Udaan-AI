/**
 * Centralized Enum Definitions for UdaanAI Backend
 * 
 * This file contains all enum constants used across the application
 * to ensure consistency between frontend and backend validation.
 * 
 * All enum values should match exactly between frontend and backend.
 */

export const ENUMS = {
  // Assessment-related enums
  ASSESSMENT: {
    DOMAINS: [
      'technical',
      'soft-skills',
      'aptitude',
      'personality',
      'hr',
      'behavioral',
      'cognitive',
      'domain-specific'
    ],
    DIFFICULTIES: [
      'easy',
      'medium',
      'hard'
    ],
    QUESTION_COUNTS: [5, 10, 15, 20, 25],
    STATUSES: [
      'active',
      'completed',
      'abandoned',
      'expired'
    ],
    TYPES: [
      'assessment',
      'interview'
    ],
    SOURCES: [
      'ai',
      'fallback',
      'manual'
    ]
  },

  // Interview-related enums
  INTERVIEW: {
    SESSION_TYPES: [
      'technical',
      'behavioral',
      'mixed',
      'hr',
      'case-study',
      'coding'
    ],
    DIFFICULTIES: [
      'easy',
      'medium',
      'hard'
    ],
    CATEGORIES: [
      'technical',
      'system-design',
      'leadership',
      'behavioral',
      'situational',
      'problem-solving',
      'communication',
      'coding',
      'algorithms'
    ],
    STATUSES: [
      'not-started',
      'in-progress',
      'completed',
      'abandoned'
    ],
    ROLES: [
      'software-developer',
      'data-scientist',
      'product-manager',
      'marketing-specialist',
      'frontend-developer',
      'backend-developer',
      'fullstack-developer',
      'devops-engineer',
      'mobile-developer'
    ],
    EXPERIENCE_LEVELS: [
      'entry',
      'mid',
      'senior',
      'lead',
      'principal'
    ],
    IMPROVEMENT_PRIORITIES: [
      'low',
      'medium',
      'high'
    ]
  },

  // Profile-related enums
  PROFILE: {
    GRADES: [
      '9th',
      '10th',
      '11th',
      '12th',
      'Undergraduate',
      'Graduate',
      'Other'
    ],
    EXPERIENCE_LEVELS: [
      'Beginner',
      'Intermediate',
      'Advanced',
      'Expert'
    ],
    CAREER_GOALS: [
      'Frontend Developer',
      'Backend Developer',
      'Fullstack Developer',
      'Mobile Developer',
      'DevOps Engineer',
      'Data Scientist',
      'Machine Learning Engineer',
      'Product Manager',
      'UI/UX Designer',
      'Software Architect',
      'Technical Lead',
      'Engineering Manager'
    ],
    SKILLS: [
      'JavaScript',
      'TypeScript',
      'React',
      'Vue.js',
      'Angular',
      'Node.js',
      'Express.js',
      'Python',
      'Django',
      'Flask',
      'Java',
      'Spring Boot',
      'C++',
      'C#',
      '.NET',
      'PHP',
      'Laravel',
      'Ruby',
      'Ruby on Rails',
      'Go',
      'Rust',
      'Swift',
      'Kotlin',
      'Flutter',
      'React Native',
      'MongoDB',
      'PostgreSQL',
      'MySQL',
      'Redis',
      'Docker',
      'Kubernetes',
      'AWS',
      'Azure',
      'Google Cloud',
      'Git',
      'CI/CD',
      'Machine Learning',
      'Deep Learning',
      'Data Analysis',
      'SQL',
      'NoSQL',
      'GraphQL',
      'REST APIs',
      'Microservices',
      'System Design',
      'Agile',
      'Scrum'
    ],
    INTERESTS: [
      'Programming',
      'AI',
      'Machine Learning',
      'Web Development',
      'Mobile Development',
      'Data Science',
      'Cloud Computing',
      'DevOps',
      'Cybersecurity',
      'Blockchain',
      'IoT',
      'Game Development',
      'UI/UX Design',
      'Product Management',
      'System Architecture',
      'Open Source',
      'Startups',
      'Technology Innovation',
      'Problem Solving',
      'Continuous Learning'
    ],
    INDUSTRIES: [
      'Technology',
      'Finance',
      'Healthcare',
      'E-commerce',
      'Education',
      'Entertainment',
      'Gaming',
      'Social Media',
      'Fintech',
      'Healthtech',
      'Edtech',
      'SaaS',
      'Enterprise Software',
      'Consulting',
      'Telecommunications',
      'Automotive',
      'Aerospace',
      'Energy',
      'Government',
      'Non-profit'
    ]
  },

  // Resume-related enums
  RESUME: {
    FILE_TYPES: [
      'pdf',
      'doc',
      'docx'
    ],
    ANALYSIS_TYPES: [
      'basic',
      'detailed',
      'comprehensive'
    ],
    STATUSES: [
      'pending',
      'processing',
      'completed',
      'failed'
    ]
  },

  // Session-related enums
  SESSION: {
    TYPES: [
      'assessment',
      'interview',
      'practice'
    ],
    STATUSES: [
      'active',
      'completed',
      'paused',
      'expired'
    ]
  },

  // General validation enums
  VALIDATION: {
    REQUIRED_FIELDS: {
      RESUME: ['resumeFile', 'userId'],
      ASSESSMENT: ['domain', 'difficulty', 'questionCount'],
      INTERVIEW: ['sessionType', 'difficulty'],
      PROFILE: ['name', 'email', 'grade']
    },
    FILE_SIZE_LIMITS: {
      RESUME: 5 * 1024 * 1024, // 5MB in bytes
      AUDIO: 10 * 1024 * 1024, // 10MB in bytes
      IMAGE: 2 * 1024 * 1024   // 2MB in bytes
    },
    ARRAY_LIMITS: {
      INTERESTS: 10,
      SKILLS: 20,
      CAREER_GOALS: 5,
      PREFERRED_INDUSTRIES: 10
    }
  }
};

// Helper functions for enum validation
export const EnumValidators = {
  /**
   * Check if a value is valid for a specific enum
   * @param {string} enumPath - Path to enum (e.g., 'ASSESSMENT.DOMAINS')
   * @param {any} value - Value to validate
   * @returns {boolean} - True if valid
   */
  isValid(enumPath, value) {
    const pathParts = enumPath.split('.');
    let enumArray = ENUMS;
    
    for (const part of pathParts) {
      enumArray = enumArray[part];
      if (!enumArray) return false;
    }
    
    return Array.isArray(enumArray) && enumArray.includes(value);
  },

  /**
   * Get allowed values for a specific enum
   * @param {string} enumPath - Path to enum (e.g., 'ASSESSMENT.DOMAINS')
   * @returns {Array} - Array of allowed values
   */
  getAllowedValues(enumPath) {
    const pathParts = enumPath.split('.');
    let enumArray = ENUMS;
    
    for (const part of pathParts) {
      enumArray = enumArray[part];
      if (!enumArray) return [];
    }
    
    return Array.isArray(enumArray) ? [...enumArray] : [];
  },

  /**
   * Validate multiple enum values
   * @param {Object} validations - Object with field: enumPath pairs
   * @param {Object} values - Object with field: value pairs
   * @returns {Object} - Validation result with errors array
   */
  validateMultiple(validations, values) {
    const errors = [];
    
    Object.entries(validations).forEach(([field, enumPath]) => {
      const value = values[field];
      if (value !== undefined && value !== null && !this.isValid(enumPath, value)) {
        errors.push({
          field,
          value,
          allowedValues: this.getAllowedValues(enumPath),
          message: `${field} must be one of: ${this.getAllowedValues(enumPath).join(', ')}`
        });
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Export individual enum categories for convenience
export const ASSESSMENT_ENUMS = ENUMS.ASSESSMENT;
export const INTERVIEW_ENUMS = ENUMS.INTERVIEW;
export const PROFILE_ENUMS = ENUMS.PROFILE;
export const RESUME_ENUMS = ENUMS.RESUME;
export const SESSION_ENUMS = ENUMS.SESSION;
export const VALIDATION_ENUMS = ENUMS.VALIDATION;

// Default export for backward compatibility
export default ENUMS;