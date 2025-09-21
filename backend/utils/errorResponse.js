/**
 * Validation Error Handling Utilities
 * 
 * This module provides structured error handling for API validation failures,
 * including custom ValidationError class and formatting functions for consistent
 * error responses across all endpoints.
 */

/**
 * Custom ValidationError class for handling validation failures
 * Provides structured error information including field, value, and allowed values
 */
export class ValidationError extends Error {
  constructor(field, receivedValue, allowedValues, customMessage = null) {
    const message = customMessage || 
      `Invalid ${field}: "${receivedValue}". Allowed values: ${allowedValues.join(", ")}`;
    
    super(message);
    this.name = "ValidationError";
    this.field = field;
    this.receivedValue = receivedValue;
    this.allowedValues = allowedValues;
  }
}

/**
 * Custom RequiredFieldError class for missing required fields
 */
export class RequiredFieldError extends Error {
  constructor(field, customMessage = null) {
    const message = customMessage || `Required field "${field}" is missing`;
    
    super(message);
    this.name = "RequiredFieldError";
    this.field = field;
  }
}

/**
 * Custom DataTypeError class for incorrect data types
 */
export class DataTypeError extends Error {
  constructor(field, expectedType, receivedType, receivedValue) {
    const message = `Field "${field}" must be of type ${expectedType}, received ${receivedType}: "${receivedValue}"`;
    
    super(message);
    this.name = "DataTypeError";
    this.field = field;
    this.expectedType = expectedType;
    this.receivedType = receivedType;
    this.receivedValue = receivedValue;
  }
}

/**
 * Formats validation errors into structured response format
 * Handles single field errors, multiple validation errors, and Mongoose validation errors
 * 
 * @param {Error} error - The error to format
 * @param {string} context - Optional context for the error
 * @returns {Object} Structured error response
 */
export const formatValidationError = (error, context = "") => {
  // Handle custom ValidationError
  if (error instanceof ValidationError) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      message: error.message,
      field: error.field,
      receivedValue: error.receivedValue,
      allowedValues: error.allowedValues,
      context: context || undefined
    };
  }

  // Handle custom RequiredFieldError
  if (error instanceof RequiredFieldError) {
    return {
      success: false,
      error: "REQUIRED_FIELD_ERROR",
      message: error.message,
      field: error.field,
      context: context || undefined
    };
  }

  // Handle custom DataTypeError
  if (error instanceof DataTypeError) {
    return {
      success: false,
      error: "DATA_TYPE_ERROR",
      message: error.message,
      field: error.field,
      expectedType: error.expectedType,
      receivedType: error.receivedType,
      receivedValue: error.receivedValue,
      context: context || undefined
    };
  }

  // Handle Mongoose ValidationError (multiple field errors)
  if (error.name === "ValidationError" && error.errors) {
    const errors = Object.keys(error.errors).map(key => {
      const fieldError = error.errors[key];
      
      return {
        field: key,
        message: fieldError.message,
        receivedValue: fieldError.value,
        kind: fieldError.kind,
        path: fieldError.path
      };
    });

    return {
      success: false,
      error: "MULTIPLE_VALIDATION_ERRORS",
      message: "Multiple validation errors occurred",
      errors,
      context: context || undefined
    };
  }

  // Handle Mongoose CastError
  if (error.name === "CastError") {
    return {
      success: false,
      error: "CAST_ERROR",
      message: `Invalid value for field "${error.path}": "${error.value}"`,
      field: error.path,
      receivedValue: error.value,
      expectedType: error.kind,
      context: context || undefined
    };
  }

  // Handle generic validation errors
  if (error.name === "ValidationError") {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      message: error.message,
      context: context || undefined
    };
  }

  // Handle unknown errors
  return {
    success: false,
    error: "UNKNOWN_ERROR",
    message: error.message || "An unknown error occurred",
    context: context || undefined
  };
};

/**
 * Formats multiple validation errors into a single response
 * 
 * @param {Array} errors - Array of validation errors
 * @param {string} context - Optional context for the errors
 * @returns {Object} Structured error response with multiple errors
 */
export const formatMultipleValidationErrors = (errors, context = "") => {
  const formattedErrors = errors.map(error => {
    if (error instanceof ValidationError) {
      return {
        field: error.field,
        message: error.message,
        receivedValue: error.receivedValue,
        allowedValues: error.allowedValues
      };
    }
    
    if (error instanceof RequiredFieldError) {
      return {
        field: error.field,
        message: error.message,
        type: "required"
      };
    }
    
    if (error instanceof DataTypeError) {
      return {
        field: error.field,
        message: error.message,
        expectedType: error.expectedType,
        receivedType: error.receivedType,
        receivedValue: error.receivedValue
      };
    }
    
    return {
      message: error.message || "Unknown validation error",
      type: "unknown"
    };
  });

  return {
    success: false,
    error: "MULTIPLE_VALIDATION_ERRORS",
    message: `${errors.length} validation error${errors.length > 1 ? 's' : ''} occurred`,
    errors: formattedErrors,
    context: context || undefined
  };
};

/**
 * Helper function to create enum validation error
 * 
 * @param {string} field - Field name
 * @param {*} value - Received value
 * @param {Array} allowedValues - Array of allowed values
 * @param {string} customMessage - Optional custom message
 * @returns {ValidationError} ValidationError instance
 */
export const createEnumValidationError = (field, value, allowedValues, customMessage = null) => {
  return new ValidationError(field, value, allowedValues, customMessage);
};

/**
 * Helper function to create required field error
 * 
 * @param {string} field - Field name
 * @param {string} customMessage - Optional custom message
 * @returns {RequiredFieldError} RequiredFieldError instance
 */
export const createRequiredFieldError = (field, customMessage = null) => {
  return new RequiredFieldError(field, customMessage);
};

/**
 * Helper function to create data type error
 * 
 * @param {string} field - Field name
 * @param {string} expectedType - Expected data type
 * @param {*} receivedValue - Received value
 * @returns {DataTypeError} DataTypeError instance
 */
export const createDataTypeError = (field, expectedType, receivedValue) => {
  const receivedType = Array.isArray(receivedValue) ? 'array' : typeof receivedValue;
  return new DataTypeError(field, expectedType, receivedType, receivedValue);
};

/**
 * Helper function to validate required fields
 * 
 * @param {Object} data - Data object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Array} Array of RequiredFieldError instances for missing fields
 */
export const validateRequiredFields = (data, requiredFields) => {
  const errors = [];
  
  requiredFields.forEach(field => {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(createRequiredFieldError(field));
    }
  });
  
  return errors;
};

/**
 * Helper function to validate enum values
 * 
 * @param {Object} data - Data object to validate
 * @param {Object} enumMappings - Object mapping field names to allowed values
 * @returns {Array} Array of ValidationError instances for invalid enum values
 */
export const validateEnumValues = (data, enumMappings) => {
  const errors = [];
  
  Object.entries(enumMappings).forEach(([field, allowedValues]) => {
    const value = data[field];
    if (value !== undefined && value !== null && !allowedValues.includes(value)) {
      errors.push(createEnumValidationError(field, value, allowedValues));
    }
  });
  
  return errors;
};

/**
 * Helper function to validate data types
 * 
 * @param {Object} data - Data object to validate
 * @param {Object} typeMapping - Object mapping field names to expected types
 * @returns {Array} Array of DataTypeError instances for incorrect types
 */
export const validateDataTypes = (data, typeMapping) => {
  const errors = [];
  
  Object.entries(typeMapping).forEach(([field, expectedType]) => {
    const value = data[field];
    if (value !== undefined && value !== null) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      
      if (expectedType === 'array' && !Array.isArray(value)) {
        errors.push(createDataTypeError(field, expectedType, value));
      } else if (expectedType !== 'array' && actualType !== expectedType) {
        errors.push(createDataTypeError(field, expectedType, value));
      }
    }
  });
  
  return errors;
};

/**
 * Comprehensive validation function that checks required fields, enums, and data types
 * 
 * @param {Object} data - Data object to validate
 * @param {Object} validationRules - Validation rules object
 * @param {Array} validationRules.required - Required field names
 * @param {Object} validationRules.enums - Enum mappings
 * @param {Object} validationRules.types - Type mappings
 * @returns {Array} Array of validation errors
 */
export const validateRequest = (data, validationRules) => {
  const errors = [];
  
  // Validate required fields
  if (validationRules.required) {
    errors.push(...validateRequiredFields(data, validationRules.required));
  }
  
  // Validate enum values
  if (validationRules.enums) {
    errors.push(...validateEnumValues(data, validationRules.enums));
  }
  
  // Validate data types
  if (validationRules.types) {
    errors.push(...validateDataTypes(data, validationRules.types));
  }
  
  return errors;
};