/**
 * API Error Handler Utility
 * 
 * Provides comprehensive error handling for API validation responses,
 * including structured validation errors, user-friendly messages,
 * and support for field-specific errors with allowed values.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

/**
 * Handles API errors and converts them to user-friendly messages
 * @param {Error} error - The error object from API call
 * @param {string} context - Optional context for the error (e.g., "Resume upload")
 * @returns {Object} Processed error information
 */
export const handleApiError = (error, context = "") => {
  // Default error structure
  const errorInfo = {
    message: "An unexpected error occurred",
    type: "UNKNOWN_ERROR",
    field: null,
    allowedValues: null,
    errors: [],
    isValidationError: false
  };

  // Handle network errors
  if (!error.response) {
    errorInfo.message = context 
      ? `${context} failed: Network error. Please check your connection.`
      : "Network error. Please check your connection.";
    errorInfo.type = "NETWORK_ERROR";
    return errorInfo;
  }

  const { status, data } = error.response;

  // Handle 400 Bad Request - Validation Errors
  if (status === 400 && data) {
    return handleValidationError(data, context);
  }

  // Handle 401 Unauthorized
  if (status === 401) {
    errorInfo.message = "Authentication required. Please log in again.";
    errorInfo.type = "AUTH_ERROR";
    return errorInfo;
  }

  // Handle 403 Forbidden
  if (status === 403) {
    errorInfo.message = "Access denied. You don't have permission for this action.";
    errorInfo.type = "PERMISSION_ERROR";
    return errorInfo;
  }

  // Handle 404 Not Found
  if (status === 404) {
    errorInfo.message = context 
      ? `${context} failed: Resource not found.`
      : "Resource not found.";
    errorInfo.type = "NOT_FOUND_ERROR";
    return errorInfo;
  }

  // Handle 500 Internal Server Error
  if (status >= 500) {
    errorInfo.message = context 
      ? `${context} failed: Server error. Please try again later.`
      : "Server error. Please try again later.";
    errorInfo.type = "SERVER_ERROR";
    return errorInfo;
  }

  // Handle other status codes
  errorInfo.message = data?.message || error.message || "An error occurred";
  if (context) {
    errorInfo.message = `${context} failed: ${errorInfo.message}`;
  }

  return errorInfo;
};

/**
 * Handles structured validation error responses from backend
 * @param {Object} data - Error response data from backend
 * @param {string} context - Optional context for the error
 * @returns {Object} Processed validation error information
 */
const handleValidationError = (data, context) => {
  const errorInfo = {
    message: "",
    type: "VALIDATION_ERROR",
    field: null,
    allowedValues: null,
    errors: [],
    isValidationError: true
  };

  // Handle structured validation error format
  if (data.error === "VALIDATION_ERROR") {
    // Single field validation error
    if (data.field && data.receivedValue !== undefined) {
      errorInfo.field = data.field;
      errorInfo.allowedValues = data.allowedValues;
      
      if (data.allowedValues && Array.isArray(data.allowedValues)) {
        errorInfo.message = generateFieldErrorMessage(
          data.field, 
          data.receivedValue, 
          data.allowedValues
        );
      } else {
        errorInfo.message = data.message || `Invalid value for ${data.field}`;
      }
    }
    // Multiple field validation errors
    else if (data.errors && Array.isArray(data.errors)) {
      errorInfo.errors = data.errors.map(err => ({
        field: err.field,
        message: err.message,
        receivedValue: err.receivedValue,
        allowedValues: err.allowedValues
      }));
      
      errorInfo.message = generateMultipleErrorsMessage(data.errors, context);
    }
    // General validation error
    else {
      errorInfo.message = data.message || "Validation failed";
    }
  }
  // Handle Mongoose validation errors
  else if (data.name === "ValidationError" && data.errors) {
    const mongooseErrors = Object.values(data.errors).map(err => ({
      field: err.path,
      message: err.message,
      receivedValue: err.value
    }));
    
    errorInfo.errors = mongooseErrors;
    errorInfo.message = generateMultipleErrorsMessage(mongooseErrors, context);
  }
  // Handle enum validation errors
  else if (data.message && data.message.includes("enum")) {
    errorInfo.message = parseEnumErrorMessage(data.message);
  }
  // Handle required field errors
  else if (data.message && data.message.includes("required")) {
    errorInfo.message = parseRequiredFieldError(data.message);
  }
  // Fallback for other validation errors
  else {
    errorInfo.message = data.message || "Invalid data provided";
  }

  // Add context if provided
  if (context && !errorInfo.message.toLowerCase().includes(context.toLowerCase())) {
    errorInfo.message = `${context}: ${errorInfo.message}`;
  }

  return errorInfo;
};

/**
 * Generates user-friendly error message for single field validation
 * @param {string} field - Field name that failed validation
 * @param {*} receivedValue - Value that was received
 * @param {Array} allowedValues - Array of allowed values
 * @returns {string} User-friendly error message
 */
const generateFieldErrorMessage = (field, receivedValue, allowedValues) => {
  const fieldName = formatFieldName(field);
  const valuesList = allowedValues.map(val => `"${val}"`).join(", ");
  
  return `${fieldName} "${receivedValue}" is not valid. Please use one of: ${valuesList}`;
};

/**
 * Generates user-friendly error message for multiple validation errors
 * @param {Array} errors - Array of error objects
 * @param {string} context - Optional context
 * @returns {string} Combined error message
 */
const generateMultipleErrorsMessage = (errors, context) => {
  if (errors.length === 1) {
    const error = errors[0];
    if (error.allowedValues) {
      return generateFieldErrorMessage(error.field, error.receivedValue, error.allowedValues);
    }
    return error.message;
  }

  const errorMessages = errors.map(error => {
    if (error.allowedValues) {
      return generateFieldErrorMessage(error.field, error.receivedValue, error.allowedValues);
    }
    return `${formatFieldName(error.field)}: ${error.message}`;
  });

  const prefix = context ? `${context} validation failed` : "Validation failed";
  return `${prefix}:\n• ${errorMessages.join("\n• ")}`;
};

/**
 * Parses enum validation error messages to extract useful information
 * @param {string} message - Raw error message
 * @returns {string} Parsed user-friendly message
 */
const parseEnumErrorMessage = (message) => {
  // Extract field name and allowed values from enum error
  const enumMatch = message.match(/`(.+?)` is not a valid enum value for path `(.+?)`/);
  if (enumMatch) {
    const [, receivedValue, field] = enumMatch;
    return `${formatFieldName(field)} "${receivedValue}" is not valid. Please check the allowed values.`;
  }

  // Extract allowed values if present
  const allowedMatch = message.match(/Allowed values: (.+)/);
  if (allowedMatch) {
    return message.replace(/Allowed values: /, "Please use one of: ");
  }

  return message;
};

/**
 * Parses required field error messages
 * @param {string} message - Raw error message
 * @returns {string} Parsed user-friendly message
 */
const parseRequiredFieldError = (message) => {
  const requiredMatch = message.match(/Path `(.+?)` is required/);
  if (requiredMatch) {
    const [, field] = requiredMatch;
    return `${formatFieldName(field)} is required and cannot be empty.`;
  }

  return message;
};

/**
 * Formats field names to be more user-friendly
 * @param {string} field - Raw field name
 * @returns {string} Formatted field name
 */
const formatFieldName = (field) => {
  if (!field) return "Field";
  
  // Convert camelCase to Title Case
  const formatted = field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, str => str.toUpperCase())
    .trim();
  
  // Handle common field name mappings
  const fieldMappings = {
    "userId": "User ID",
    "resumeFile": "Resume File",
    "questionCount": "Question Count",
    "fieldOfStudy": "Field of Study",
    "graduationYear": "Graduation Year",
    "linkedinUrl": "LinkedIn URL",
    "githubUrl": "GitHub URL",
    "portfolioUrl": "Portfolio URL"
  };

  return fieldMappings[field] || formatted;
};

/**
 * Extracts validation errors for specific use cases
 * @param {Object} err - Error object from API call
 * @returns {Array} Array of validation details
 */
export function extractValidationDetails(err) {
  const details = err?.response?.data?.errors || err?.response?.data?.message || err?.message;

  if (!details) return [];

  if (Array.isArray(details)) {
    return details.map(d => ({ field: (d.path && d.path.join?.('.')) || d.field || '', message: d.message || String(d) }));
  }
  if (typeof details === 'object') {
    return Object.entries(details).map(([k, v]) => {
      if (typeof v === 'string') return { field: k, message: v };
      if (Array.isArray(v)) return { field: k, message: v.join(', ') };
      if (v && v.message) return { field: k, message: v.message };
      return { field: k, message: JSON.stringify(v) };
    });
  }
  return [{ field: '', message: String(details) }];
}

/**
 * Generates user-friendly error messages for common scenarios
 */
export const ERROR_MESSAGES = {
  RESUME_UPLOAD: {
    FILE_REQUIRED: "Please select a resume file to upload.",
    FILE_TOO_LARGE: "Resume file is too large. Maximum size is 5MB.",
    INVALID_FORMAT: "Invalid file format. Please upload PDF, DOC, or DOCX files only.",
    USER_ID_MISSING: "User authentication required. Please log in again."
  },
  ASSESSMENT: {
    DOMAIN_REQUIRED: "Please select an assessment domain.",
    DIFFICULTY_REQUIRED: "Please select a difficulty level.",
    INVALID_QUESTION_COUNT: "Question count must be between 5 and 50."
  },
  INTERVIEW: {
    SESSION_TYPE_REQUIRED: "Please select an interview session type.",
    DIFFICULTY_REQUIRED: "Please select a difficulty level.",
    INVALID_CATEGORY: "Invalid interview category selected."
  },
  PROFILE: {
    REQUIRED_FIELDS: "Please fill in all required profile fields.",
    INVALID_URL: "Please enter a valid URL format.",
    GRADUATION_YEAR_INVALID: "Please enter a valid graduation year."
  }
};

/**
 * Gets appropriate error message for specific contexts
 * @param {string} context - Error context (e.g., 'RESUME_UPLOAD')
 * @param {string} type - Specific error type
 * @returns {string} Contextual error message
 */
export const getContextualErrorMessage = (context, type) => {
  const contextMessages = ERROR_MESSAGES[context];
  if (contextMessages && contextMessages[type]) {
    return contextMessages[type];
  }
  return "An error occurred. Please try again.";
};

export default handleApiError;