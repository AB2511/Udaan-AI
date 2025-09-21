/**
 * Client-Side Validation Utilities
 * 
 * Provides pre-submission validation for forms using frontend enum constants
 * to prevent unnecessary API calls and provide immediate user feedback.
 * 
 * Requirements: 2.1, 3.1, 4.1, 6.2
 */

import { ENUMS, VALIDATION_ENUMS } from '../constants/enums.js';

/**
 * Form Validation Manager (Requirement 6.2)
 * Provides unified validation interface for all forms
 */
export class FormValidationManager {
  /**
   * Validate form data based on form type
   * @param {string} formType - Type of form ('assessment', 'interview', 'profile')
   * @param {Object} data - Form data to validate
   * @returns {ValidationResult} Validation result
   */
  static validate(formType, data) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      fieldErrors: {}
    };

    try {
      // Basic validation based on form type
      switch (formType) {
        case 'assessment':
          return this.validateAssessment(data, result);
        case 'interview':
          return this.validateInterview(data, result);
        case 'profile':
          return this.validateProfile(data, result);
        default:
          result.isValid = false;
          result.errors.push({ message: `Unknown form type: ${formType}` });
          return result;
      }
    } catch (error) {
      console.error('Validation error:', error);
      result.isValid = false;
      result.errors.push({ message: 'Validation failed. Please check your input.' });
      return result;
    }
  }

  /**
   * Validate assessment form data
   */
  static validateAssessment(data, result) {
    // Required fields
    const requiredFields = VALIDATION_ENUMS?.REQUIRED_FIELDS?.ASSESSMENT || ['domain', 'difficulty'];

    requiredFields.forEach(field => {
      if (!data[field]) {
        result.isValid = false;
        const message = `${field} is required`;
        result.errors.push({ field, message });
        result.fieldErrors[field] = { message, type: 'required' };
      }
    });

    // Enum validation
    if (data.domain && ENUMS?.ASSESSMENT?.DOMAINS && !ENUMS.ASSESSMENT.DOMAINS.includes(data.domain)) {
      result.isValid = false;
      const message = `Invalid domain: ${data.domain}`;
      result.errors.push({ field: 'domain', message });
      result.fieldErrors.domain = { message, type: 'enum' };
    }

    if (data.difficulty && ENUMS?.ASSESSMENT?.DIFFICULTIES && !ENUMS.ASSESSMENT.DIFFICULTIES.includes(data.difficulty)) {
      result.isValid = false;
      const message = `Invalid difficulty: ${data.difficulty}`;
      result.errors.push({ field: 'difficulty', message });
      result.fieldErrors.difficulty = { message, type: 'enum' };
    }

    return result;
  }

  /**
   * Validate interview form data
   */
  static validateInterview(data, result) {
    // Required fields
    const requiredFields = ['sessionType', 'difficulty'];

    requiredFields.forEach(field => {
      if (!data[field]) {
        result.isValid = false;
        const message = `${field} is required`;
        result.errors.push({ field, message });
        result.fieldErrors[field] = { message, type: 'required' };
      }
    });

    // Enum validation
    if (data.sessionType && ENUMS?.INTERVIEW?.SESSION_TYPES && !ENUMS.INTERVIEW.SESSION_TYPES.includes(data.sessionType)) {
      result.isValid = false;
      const message = `Invalid session type: ${data.sessionType}`;
      result.errors.push({ field: 'sessionType', message });
      result.fieldErrors.sessionType = { message, type: 'enum' };
    }

    if (data.difficulty && ENUMS?.INTERVIEW?.DIFFICULTIES && !ENUMS.INTERVIEW.DIFFICULTIES.includes(data.difficulty)) {
      result.isValid = false;
      const message = `Invalid difficulty: ${data.difficulty}`;
      result.errors.push({ field: 'difficulty', message });
      result.fieldErrors.difficulty = { message, type: 'enum' };
    }

    return result;
  }

  /**
   * Validate profile form data
   */
  static validateProfile(data, result) {
    // Required fields
    const requiredFields = VALIDATION_ENUMS?.REQUIRED_FIELDS?.PROFILE || ['name', 'email'];

    requiredFields.forEach(field => {
      if (!data[field]) {
        result.isValid = false;
        const message = `${field} is required`;
        result.errors.push({ field, message });
        result.fieldErrors[field] = { message, type: 'required' };
      }
    });

    // Email validation
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      result.isValid = false;
      const message = 'Please enter a valid email address';
      result.errors.push({ field: 'email', message });
      result.fieldErrors.email = { message, type: 'format' };
    }

    // Enum validation
    if (data.grade && ENUMS?.PROFILE?.GRADES && !ENUMS.PROFILE.GRADES.includes(data.grade)) {
      result.isValid = false;
      const message = `Invalid grade: ${data.grade}`;
      result.errors.push({ field: 'grade', message });
      result.fieldErrors.grade = { message, type: 'enum' };
    }

    return result;
  }

  /**
   * Get validation rules for a specific form type
   * @param {string} formType - Type of form
   * @returns {Object} Validation rules
   */
  static getValidationRules(formType) {
    try {
      const rules = {
        assessment: {
          requiredFields: VALIDATION_ENUMS?.REQUIRED_FIELDS?.ASSESSMENT || ['domain', 'difficulty'],
          enumFields: {
            domain: ENUMS?.ASSESSMENT?.DOMAINS || [],
            difficulty: ENUMS?.ASSESSMENT?.DIFFICULTIES || [],
            questionCount: ENUMS?.ASSESSMENT?.QUESTION_COUNTS || []
          }
        },
        interview: {
          requiredFields: ['sessionType', 'difficulty'],
          enumFields: {
            sessionType: ENUMS?.INTERVIEW?.SESSION_TYPES || [],
            difficulty: ENUMS?.INTERVIEW?.DIFFICULTIES || [],
            category: ENUMS?.INTERVIEW?.CATEGORIES || [],
            role: ENUMS?.INTERVIEW?.ROLES || [],
            experienceLevel: ENUMS?.INTERVIEW?.EXPERIENCE_LEVELS || []
          }
        },
        profile: {
          requiredFields: VALIDATION_ENUMS?.REQUIRED_FIELDS?.PROFILE || ['name', 'email'],
          enumFields: {
            grade: ENUMS?.PROFILE?.GRADES || [],
            experienceLevel: ENUMS?.PROFILE?.EXPERIENCE_LEVELS || []
          },
          arrayFields: {
            skills: ENUMS?.PROFILE?.SKILLS || [],
            interests: ENUMS?.PROFILE?.INTERESTS || [],
            careerGoals: ENUMS?.PROFILE?.CAREER_GOALS || [],
            preferredIndustries: ENUMS?.PROFILE?.INDUSTRIES || []
          }
        }
      };

      return rules[formType] || {};
    } catch (error) {
      console.error('Error getting validation rules:', error);
      return {};
    }
  }
}

export default FormValidationManager;