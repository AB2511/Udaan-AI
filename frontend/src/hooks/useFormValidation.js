/**
 * Form Validation Hook
 * 
 * Provides real-time form validation with immediate user feedback
 * Requirements: 2.1, 3.1, 4.1, 6.2
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { FormValidationManager } from '../utils/clientValidation.js';

/**
 * Custom hook for form validation with real-time feedback
 * @param {string} formType - Type of form ('assessment', 'interview', 'profile')
 * @param {Object} initialData - Initial form data
 * @param {Object} options - Validation options
 * @returns {Object} Validation state and methods
 */
export const useFormValidation = (formType, initialData = {}, options = {}) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
    showWarnings = true
  } = options;

  // Validation state
  const [validationResult, setValidationResult] = useState({
    isValid: true,
    errors: [],
    warnings: [],
    fieldErrors: {}
  });

  const [isValidating, setIsValidating] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);

  // Debounce timer
  const [debounceTimer, setDebounceTimer] = useState(null);

  const prevErrorsRef = useRef({});

  const validate = useCallback((v) => {
    if (typeof FormValidationManager?.validate === 'function') return FormValidationManager.validate(formType, v) || {};
    return {};
  }, [formType]);

  useEffect(() => {
    const next = validate(initialData) || {};
    // only update if different
    const prev = prevErrorsRef.current || {};
    const prevStr = JSON.stringify(prev);
    const nextStr = JSON.stringify(next);
    if (prevStr !== nextStr) {
      prevErrorsRef.current = next;
      setValidationResult(next);
    }
  }, [initialData, validate]);

  /**
   * Validate on form data change - stable function to prevent infinite loops
   */
  const validateOnDataChange = useCallback((data) => {
    if (validateOnChange) {
      const result = validate(data);
      setValidationResult(result);
    }
  }, [validateOnChange, validate]);

  /**
   * Validate on field blur
   */
  const validateOnFieldBlur = useCallback((data) => {
    if (validateOnBlur) {
      const result = validate(data);
      setValidationResult(result);
    }
  }, [validateOnBlur, validate]);

  /**
   * Force immediate validation
   */
  const validateNow = useCallback((data) => {
    const result = validate(data);
    setValidationResult(result);
    return result;
  }, [validate]);

  /**
   * Clear validation state
   */
  const clearValidation = useCallback(() => {
    setValidationResult({
      isValid: true,
      errors: [],
      warnings: [],
      fieldErrors: {}
    });
    setHasValidated(false);
    
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
  }, [debounceTimer]);

  /**
   * Get field-specific error
   */
  const getFieldError = useCallback((fieldName) => {
    return validationResult.fieldErrors[fieldName] || null;
  }, [validationResult.fieldErrors]);

  /**
   * Check if field has error
   */
  const hasFieldError = useCallback((fieldName) => {
    return !!validationResult.fieldErrors[fieldName];
  }, [validationResult.fieldErrors]);

  /**
   * Get validation rules for current form type
   */
  const getValidationRules = useCallback(() => {
    return FormValidationManager.getValidationRules(formType);
  }, [formType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Initial validation if data provided
  useEffect(() => {
    if (Object.keys(initialData).length > 0 && validateOnChange) {
      const result = validate(initialData);
      setValidationResult(result);
    }
  }, [initialData, validateOnChange, validate]);

  return {
    // Validation state
    validationResult,
    isValidating,
    hasValidated,
    isValid: validationResult.isValid,
    errors: validationResult.errors,
    warnings: validationResult.warnings,
    fieldErrors: validationResult.fieldErrors,
    
    // Validation methods
    validateOnDataChange,
    validateOnFieldBlur,
    validateNow,
    clearValidation,
    
    // Field-specific methods
    getFieldError,
    hasFieldError,
    
    // Utility methods
    getValidationRules
  };
};

/**
 * Hook for real-time field validation
 * @param {string} formType - Type of form
 * @param {string} fieldName - Name of field to validate
 * @param {any} fieldValue - Current field value
 * @param {Object} formData - Complete form data for context
 * @returns {Object} Field validation state
 */
export const useFieldValidation = (formType, fieldName, fieldValue, formData = {}) => {
  const [fieldError, setFieldError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback(() => {
    setIsValidating(true);
    
    try {
      const fullData = { ...formData, [fieldName]: fieldValue };
      const result = FormValidationManager.validate(formType, fullData);
      
      setFieldError(result.fieldErrors[fieldName] || null);
    } catch (error) {
      console.error('Field validation error:', error);
      setFieldError({
        message: 'Validation failed',
        type: 'error'
      });
    } finally {
      setIsValidating(false);
    }
  }, [formType, fieldName, fieldValue, formData]);

  // Validate when field value changes
  useEffect(() => {
    if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
      const timer = setTimeout(validateField, 300);
      return () => clearTimeout(timer);
    } else {
      setFieldError(null);
    }
  }, [fieldValue, validateField]);

  return {
    fieldError,
    isValidating,
    hasError: !!fieldError,
    isValid: !fieldError
  };
};

/**
 * Hook for pre-submission validation
 * @param {string} formType - Type of form
 * @returns {Object} Pre-submission validation methods
 */
export const usePreSubmissionValidation = (formType) => {
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Validate before form submission
   * @param {Object} formData - Complete form data
   * @returns {Promise<boolean>} True if validation passes
   */
  const validateBeforeSubmit = useCallback(async (formData) => {
    setIsValidating(true);
    
    try {
      const result = FormValidationManager.validate(formType, formData);
      setValidationResult(result);
      
      if (!result.isValid) {
        // Focus on first error field if possible
        const firstErrorField = result.errors[0]?.field;
        if (firstErrorField) {
          const element = document.querySelector(`[name="${firstErrorField}"]`);
          if (element) {
            element.focus();
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
      
      return result.isValid;
    } catch (error) {
      console.error('Pre-submission validation error:', error);
      setValidationResult({
        isValid: false,
        errors: [{ message: 'Validation failed. Please check your input and try again.' }],
        warnings: [],
        fieldErrors: {}
      });
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [formType]);

  /**
   * Clear validation result
   */
  const clearValidationResult = useCallback(() => {
    setValidationResult(null);
  }, []);

  return {
    validationResult,
    isValidating,
    validateBeforeSubmit,
    clearValidationResult,
    canSubmit: validationResult?.isValid ?? true
  };
};

export default useFormValidation;