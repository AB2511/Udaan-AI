import React from 'react';
import { extractValidationDetails } from '../../utils/apiErrorHandler';

/**
 * ValidationErrorDisplay Component
 * 
 * Displays validation errors in a user-friendly format with support for:
 * - Field-specific errors
 * - Allowed enum values
 * - Multiple validation errors
 * - Contextual error messages
 */
const ValidationErrorDisplay = ({ 
  error, 
  className = "",
  showAllowedValues = true,
  maxFieldErrors = 5 
}) => {
  if (!error) return null;

  const items = extractValidationDetails(error) || [];
  
  // Single field error with allowed values
  if (error.field && Array.isArray(error.allowedValues) && error.allowedValues.length > 0 && showAllowedValues) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Validation Error
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p className="mb-2">{error.message || 'Validation failed'}</p>
              <div className="bg-red-100 rounded-md p-3">
                <p className="font-medium mb-1">Valid options:</p>
                <div className="flex flex-wrap gap-1">
                  {error.allowedValues.map((value, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-200 text-red-800"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multiple field errors
  if (items.length > 0) {
    return (
      <>{items.map((it, idx) => <div key={idx}>{it.field}: {it.message}</div>)}</>
    );
  }

  // Legacy handling for backward compatibility
  if (error.hasFieldErrors) {
    const fieldErrors = Object.entries(error.fieldErrors || {}).slice(0, maxFieldErrors);
    const hasMoreErrors = Object.keys(error.fieldErrors || {}).length > maxFieldErrors;

    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Multiple Validation Errors
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <ul className="space-y-2">
                {fieldErrors.map(([field, fieldError], index) => (
                  <li key={index} className="flex flex-col">
                    <div className="flex items-start">
                      <span className="font-medium capitalize mr-2">
                        {field.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span>{fieldError.message}</span>
                    </div>
                    {Array.isArray(fieldError.allowedValues) && fieldError.allowedValues.length > 0 && showAllowedValues && (
                      <div className="mt-1 ml-4">
                        <span className="text-xs text-red-600">Valid options: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {fieldError.allowedValues.map((value, valueIndex) => (
                            <span 
                              key={valueIndex}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-200 text-red-800"
                            >
                              {value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {hasMoreErrors && (
                <p className="mt-2 text-xs text-red-600">
                  ... and {Object.keys(error.fieldErrors || {}).length - maxFieldErrors} more errors
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Single error message
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-800">{error.message}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Inline field error component for form fields
 */
export const FieldError = ({ error, field, showAllowedValues = true }) => {
  if (!error) return null;

  const validationDetails = extractValidationDetails(error);
  const fieldError = validationDetails?.fieldErrors?.[field];

  if (!fieldError) {
    // Show general error if no specific field error
    return (
      <p className="text-red-500 text-sm mt-1">
        {error.message}
      </p>
    );
  }

  return (
    <div className="mt-1">
      <p className="text-red-500 text-sm">
        {fieldError.message}
      </p>
      {Array.isArray(fieldError.allowedValues) && fieldError.allowedValues.length > 0 && showAllowedValues && (
        <div className="mt-1">
          <p className="text-xs text-red-600 mb-1">Valid options:</p>
          <div className="flex flex-wrap gap-1">
            {fieldError.allowedValues.map((value, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-200"
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Success message component for consistency
 */
export const SuccessMessage = ({ message, className = "" }) => {
  if (!message) return null;

  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-green-800">{message}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Warning message component
 */
export const WarningMessage = ({ message, className = "" }) => {
  if (!message) return null;

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-800">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ValidationErrorDisplay;