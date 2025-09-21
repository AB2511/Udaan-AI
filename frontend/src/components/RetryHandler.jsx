import React, { useState, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';

const RetryHandler = ({ 
  onRetry, 
  error, 
  loading = false,
  maxRetries = 3,
  retryDelay = 1000,
  children,
  fallback = null,
  showRetryCount = true,
  className = ''
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    if (retryCount >= maxRetries) {
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      // Add delay before retry
      if (retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
      }
      
      await onRetry();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry, retryCount, maxRetries, retryDelay]);

  const resetRetries = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  // If loading, show loading state
  if (loading || isRetrying) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
        <LoadingSpinner size="medium" color="blue" />
        <p className="mt-2 text-sm text-gray-600">
          {isRetrying ? `Retrying... (${retryCount}/${maxRetries})` : 'Loading...'}
        </p>
      </div>
    );
  }

  // If error, show retry interface
  if (error) {
    const canRetry = retryCount < maxRetries;
    
    return (
      <div className={`flex flex-col items-center justify-center p-6 text-center ${className}`}>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Something went wrong
        </h3>
        
        <p className="text-gray-600 mb-4 max-w-md">
          {typeof error === 'string' ? error : error?.message || 'An unexpected error occurred'}
        </p>

        {showRetryCount && retryCount > 0 && (
          <p className="text-sm text-gray-500 mb-4">
            Retry attempts: {retryCount}/{maxRetries}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {canRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </button>
          )}
          
          <button
            onClick={resetRetries}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Reset
          </button>
        </div>

        {!canRetry && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Maximum retry attempts reached. Please refresh the page or contact support.
            </p>
          </div>
        )}

        {fallback && (
          <div className="mt-4">
            {fallback}
          </div>
        )}
      </div>
    );
  }

  // If no error and not loading, render children
  return children;
};

// Hook for using retry logic in components
export const useRetry = (asyncFunction, dependencies = []) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction(...args);
      setData(result);
      setRetryCount(0); // Reset retry count on success
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, ...dependencies]);

  const retry = useCallback(async (...args) => {
    setRetryCount(prev => prev + 1);
    return execute(...args);
  }, [execute]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
    setRetryCount(0);
  }, []);

  return {
    loading,
    error,
    data,
    retryCount,
    execute,
    retry,
    reset
  };
};

// Higher-order component for adding retry functionality
export const withRetry = (WrappedComponent, retryOptions = {}) => {
  return function RetryWrappedComponent(props) {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleError = useCallback((err) => {
      setError(err);
    }, []);

    const handleRetry = useCallback(async () => {
      setError(null);
      setLoading(true);
      
      try {
        // If the wrapped component has a retry method, call it
        if (props.onRetry) {
          await props.onRetry();
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }, [props.onRetry]);

    if (error) {
      return (
        <RetryHandler
          error={error}
          loading={loading}
          onRetry={handleRetry}
          {...retryOptions}
        />
      );
    }

    return (
      <WrappedComponent
        {...props}
        onError={handleError}
        loading={loading}
      />
    );
  };
};

export default RetryHandler;