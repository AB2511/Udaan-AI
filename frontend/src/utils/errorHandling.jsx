/**
 * Utility functions for error handling across the application
 */

/**
 * Extract user-friendly error message from API error
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    
    // Use server message if available
    const serverMessage = data?.message || data?.error;
    
    switch (status) {
      case 400:
        return serverMessage || 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return serverMessage || 'This action conflicts with existing data.';
      case 422:
        return serverMessage || 'Please check your input and try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return serverMessage || 'An unexpected error occurred. Please try again.';
    }
  } else if (error.request) {
    return 'Network error. Please check your internet connection and try again.';
  } else {
    return error.message || 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Check if an error is retryable
 * @param {Error} error - The error object
 * @returns {boolean} Whether the error is retryable
 */
export const isRetryableError = (error) => {
  if (!error.response) {
    // Network errors are retryable
    return true;
  }
  
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  return retryableStatuses.includes(error.response.status);
};

/**
 * Get retry delay based on attempt number (exponential backoff)
 * @param {number} attempt - Current attempt number (0-based)
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {number} Delay in milliseconds
 */
export const getRetryDelay = (attempt, baseDelay = 1000) => {
  return Math.min(baseDelay * Math.pow(2, attempt), 10000); // Max 10 seconds
};

/**
 * Create a standardized error object
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {Object} details - Additional error details
 * @returns {Object} Standardized error object
 */
export const createError = (message, code = 'UNKNOWN_ERROR', details = {}) => {
  return {
    message,
    code,
    details,
    timestamp: new Date().toISOString()
  };
};

/**
 * Log error for debugging and analytics
 * @param {Error} error - The error object
 * @param {Object} context - Additional context information
 */
export const logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...context
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorInfo);
  }

  // In production, you would send this to your error tracking service
  // Example: Sentry, LogRocket, Bugsnag, etc.
  // errorTrackingService.captureException(error, errorInfo);
};

/**
 * Validate response data structure
 * @param {Object} data - Response data
 * @param {Object} schema - Expected schema
 * @returns {boolean} Whether data matches schema
 */
export const validateResponseData = (data, schema) => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  for (const [key, type] of Object.entries(schema)) {
    if (!(key in data)) {
      return false;
    }

    const value = data[key];
    
    if (type === 'array' && !Array.isArray(value)) {
      return false;
    }
    
    if (type !== 'array' && typeof value !== type) {
      return false;
    }
  }

  return true;
};

/**
 * Create error boundary fallback component
 * @param {string} featureName - Name of the feature that failed
 * @param {Function} onRetry - Retry function
 * @returns {JSX.Element} Fallback component
 */
export const createErrorFallback = (featureName, onRetry) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {featureName} Error
          </h3>
          <p className="text-sm text-red-700 mt-1">
            This feature is temporarily unavailable.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded transition duration-200"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Debounce function for API calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Throttle function for API calls
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func.apply(null, args);
    }
  };
};

export default {
  getErrorMessage,
  isRetryableError,
  getRetryDelay,
  createError,
  logError,
  validateResponseData,
  createErrorFallback,
  debounce,
  throttle
};