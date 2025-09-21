import { useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { handleApiError } from '../utils/apiErrorHandler';

/**
 * Custom hook for comprehensive error handling
 * Provides consistent error handling across components
 */
export const useErrorHandler = () => {
  const { showToast, showError, showSuccess } = useToast();

  const handleError = useCallback((error, context = '', options = {}) => {
    const {
      showToast: shouldShowToast = true,
      fallbackMessage = 'An unexpected error occurred',
      onError,
      logError = true
    } = options;

    // Log error for debugging
    if (logError) {
      console.error(`Error in ${context}:`, error);
    }

    // Process the error
    const errorInfo = handleApiError(error, context);

    // Show toast notification if enabled
    if (shouldShowToast) {
      const toastType = errorInfo.type === 'VALIDATION_ERROR' ? 'warning' : 'error';
      const message = errorInfo.message || fallbackMessage;
      showToast(message, toastType, 6000);
    }

    // Call custom error handler if provided
    if (onError) {
      onError(errorInfo);
    }

    return errorInfo;
  }, [showToast]);

  const handleAsyncOperation = useCallback(async (
    operation, 
    context = '', 
    options = {}
  ) => {
    const {
      loadingMessage,
      successMessage,
      onSuccess,
      onError,
      showSuccessToast = true,
      retries = 0,
      retryDelay = 1000
    } = options;

    // Show loading message if provided
    if (loadingMessage) {
      showToast(loadingMessage, 'info', 3000);
    }

    let lastError;
    const maxAttempts = retries + 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await operation();

        // Show success message
        if (successMessage && showSuccessToast) {
          showSuccess(successMessage);
        }

        // Call success handler
        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error) {
        lastError = error;

        // If this isn't the last attempt, wait before retrying
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          continue;
        }

        // Handle the error on final attempt
        const errorInfo = handleError(error, context, { onError });
        throw errorInfo;
      }
    }
  }, [handleError, showToast, showSuccess]);

  const handleFileUpload = useCallback(async (file, uploadFn, options = {}) => {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      onProgress,
      context = 'File upload'
    } = options;

    // Validate file
    if (!file) {
      const error = new Error('No file selected');
      handleError(error, context);
      throw error;
    }

    if (file.size > maxSize) {
      const error = new Error(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`);
      handleError(error, context);
      throw error;
    }

    if (!allowedTypes.includes(file.type)) {
      const error = new Error('Invalid file type. Please upload PDF, DOC, or DOCX files only.');
      handleError(error, context);
      throw error;
    }

    // Perform upload with progress tracking
    return handleAsyncOperation(
      () => uploadFn(file, onProgress),
      context,
      {
        loadingMessage: 'Uploading file...',
        successMessage: 'File uploaded successfully',
        ...options
      }
    );
  }, [handleError, handleAsyncOperation]);

  const handleAIOperation = useCallback(async (operation, context = 'AI operation', options = {}) => {
    const {
      fallbackData,
      timeout = 30000,
      showFallbackToast = true
    } = options;

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AI operation timed out')), timeout);
      });

      // Race between operation and timeout
      const result = await Promise.race([operation(), timeoutPromise]);
      return result;
    } catch (error) {
      // Check if we have fallback data
      if (fallbackData) {
        if (showFallbackToast) {
          showToast('AI service unavailable. Using backup data.', 'warning', 5000);
        }
        return fallbackData;
      }

      // Handle AI-specific errors
      const errorInfo = handleError(error, context, {
        fallbackMessage: 'AI service is temporarily unavailable. Please try again later.'
      });
      throw errorInfo;
    }
  }, [handleError, showToast]);

  const handleNetworkError = useCallback((error, context = '') => {
    if (!navigator.onLine) {
      showError('You appear to be offline. Please check your internet connection.');
      return { type: 'OFFLINE', message: 'No internet connection' };
    }

    return handleError(error, context, {
      fallbackMessage: 'Network error. Please check your connection and try again.'
    });
  }, [handleError, showError]);

  const handleValidationError = useCallback((error, context = '') => {
    const errorInfo = handleError(error, context, { showToast: false });
    
    // Return structured validation errors for form handling
    if (errorInfo.isValidationError) {
      return {
        type: 'VALIDATION',
        field: errorInfo.field,
        errors: errorInfo.errors,
        message: errorInfo.message
      };
    }

    return errorInfo;
  }, [handleError]);

  return {
    handleError,
    handleAsyncOperation,
    handleFileUpload,
    handleAIOperation,
    handleNetworkError,
    handleValidationError
  };
};

export default useErrorHandler;