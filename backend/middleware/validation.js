import { body } from 'express-validator';

/**
 * Validation rules for user registration
 */
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
];

/**
 * Validation rules for user login
 */
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1 })
    .withMessage('Password cannot be empty')
];

/**
 * Validation rules for profile update
 */
export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces')
];

/**
 * Validation rules for refresh token
 */
export const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isString()
    .withMessage('Refresh token must be a string')
];

/**
 * Validation rules for password change
 */
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6, max: 128 })
    .withMessage('New password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('confirmNewPassword')
    .notEmpty()
    .withMessage('New password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New password confirmation does not match new password');
      }
      return true;
    })
];

/**
 * Validation rules for career recommendations query parameters
 */
export const validateRecommendationsQuery = [
  // Optional limit parameter for pagination
  // Note: query parameters are validated differently than body parameters
];

/**
 * Validation rules for recommendation ID parameter
 */
export const validateRecommendationId = [
  // MongoDB ObjectId validation will be handled by the controller
  // since param validation requires different approach
];

/**
 * Enhanced validation for assessment submission
 */
export const validateAssessmentSubmission = [
  body('answers')
    .isArray({ max: 100 })
    .withMessage('Answers must be an array with maximum 100 items'),
  
  body('answers.*.questionId')
    .isMongoId()
    .withMessage('Invalid question ID format'),
  
  body('answers.*.answer')
    .isLength({ max: 5000 })
    .withMessage('Answer exceeds maximum length')
    .custom((value) => {
      // Prevent script injection in answers
      const dangerousPatterns = [
        /<script/i, /javascript:/i, /vbscript:/i, /onload=/i, /onerror=/i
      ];
      
      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          throw new Error('Answer contains potentially dangerous content');
        }
      }
      return true;
    }),
  
  body('timeSpent')
    .optional()
    .isInt({ min: 0, max: 7200000 }) // Max 2 hours
    .withMessage('Invalid time spent value')
];

/**
 * Enhanced validation for interview responses
 */
export const validateInterviewResponse = [
  body('answer')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Answer must be between 1 and 10000 characters')
    .custom((value) => {
      // Prevent script injection in interview answers
      const dangerousPatterns = [
        /<script/i, /javascript:/i, /vbscript:/i, /onload=/i, /onerror=/i
      ];
      
      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          throw new Error('Answer contains potentially dangerous content');
        }
      }
      return true;
    }),
  
  body('metadata')
    .optional()
    .custom((value) => {
      if (typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Metadata must be an object');
      }
      
      // Limit metadata size to prevent DoS
      if (JSON.stringify(value).length > 5000) {
        throw new Error('Metadata too large');
      }
      
      return true;
    })
];

/**
 * Enhanced validation for file upload metadata
 */
export const validateFileMetadata = [
  body('targetRole')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Target role must be between 1 and 200 characters')
    .matches(/^[a-zA-Z0-9\s\-.,()]+$/)
    .withMessage('Target role contains invalid characters'),
  
  body('skillGaps')
    .optional()
    .isArray({ max: 50 })
    .withMessage('Skill gaps must be an array with maximum 50 items'),
  
  body('skillGaps.*')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each skill gap must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-.,()]+$/)
    .withMessage('Skill gap contains invalid characters')
];