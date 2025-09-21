import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'blue', 
  text = '', 
  className = '',
  variant = 'spinner' // 'spinner', 'dots', 'pulse'
}) => {
  // Size configurations
  const sizeClasses = {
    xs: 'h-3 w-3',
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xl: 'h-16 w-16',
    '2xl': 'h-20 w-20'
  };

  // Color configurations
  const colorClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600'
  };

  // Text size based on spinner size
  const textSizeClasses = {
    xs: 'text-xs',
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xl: 'text-lg',
    '2xl': 'text-xl'
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.medium;
  const spinnerColor = colorClasses[color] || colorClasses.blue;
  const textSize = textSizeClasses[size] || textSizeClasses.medium;

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className={`${spinnerColor} w-2 h-2 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
            <div className={`${spinnerColor} w-2 h-2 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
            <div className={`${spinnerColor} w-2 h-2 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`${spinnerSize} ${spinnerColor} rounded-full animate-pulse bg-current opacity-75`}></div>
        );
      
      default:
        return (
          <div className="relative">
            <div
              className={`${spinnerSize} ${spinnerColor} animate-spin`}
              role="status"
              aria-label="Loading"
            >
              <svg
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center animate-fade-in-up ${className}`}>
      {/* Spinner */}
      {renderSpinner()}

      {/* Loading text */}
      {text && (
        <div className={`mt-3 ${textSize} ${spinnerColor} font-medium text-center max-w-xs`}>
          {text}
        </div>
      )}
    </div>
  );
};

// Preset spinner components for common use cases
export const ButtonSpinner = ({ className = '' }) => (
  <LoadingSpinner 
    size="small" 
    color="white" 
    className={`inline-flex ${className}`}
  />
);

export const PageSpinner = ({ text = 'Loading...', className = '' }) => (
  <LoadingSpinner 
    size="large" 
    color="blue" 
    text={text}
    className={`py-8 ${className}`}
  />
);

export const CardSpinner = ({ text = '', className = '' }) => (
  <LoadingSpinner 
    size="medium" 
    color="gray" 
    text={text}
    className={`py-4 ${className}`}
  />
);

export default LoadingSpinner;