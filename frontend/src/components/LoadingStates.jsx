import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import ProgressIndicator from './ProgressIndicator';

/**
 * Skeleton loader for text content
 */
export const TextSkeleton = ({ lines = 3, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 rounded h-4 mb-2 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

/**
 * Skeleton loader for cards
 */
export const CardSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 animate-pulse ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  );
};

/**
 * Skeleton loader for tables
 */
export const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {/* Header */}
      <div className="flex space-x-4 mb-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="flex-1 h-4 bg-gray-200 rounded" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 mb-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1 h-3 bg-gray-200 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton loader for lists
 */
export const ListSkeleton = ({ items = 5, className = '' }) => {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
            <div className="h-2 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Loading overlay for entire sections
 */
export const LoadingOverlay = ({ 
  loading = false, 
  text = 'Loading...', 
  children,
  className = '' 
}) => {
  if (!loading) {
    return children;
  }

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <div className="text-center">
          <LoadingSpinner size="large" color="blue" />
          <p className="mt-2 text-gray-600 font-medium">{text}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Progress loading for multi-step processes
 */
export const ProgressLoading = ({ 
  steps = [], 
  currentStep = 0, 
  progress = 0,
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="text-center mb-6">
        <LoadingSpinner size="large" color="blue" />
        <h3 className="text-lg font-semibold text-gray-900 mt-4">
          {steps[currentStep]?.title || 'Processing...'}
        </h3>
        <p className="text-gray-600 mt-2">
          {steps[currentStep]?.description || 'Please wait while we process your request.'}
        </p>
      </div>

      <ProgressIndicator 
        progress={progress} 
        label={`Step ${currentStep + 1} of ${steps.length}`}
        color="blue"
        className="mb-4"
      />

      <div className="flex justify-center space-x-4 text-sm text-gray-500">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`flex items-center ${
              index === currentStep ? 'text-blue-600 font-medium' : ''
            }`}
          >
            <div 
              className={`w-2 h-2 rounded-full mr-2 ${
                index < currentStep ? 'bg-green-500' :
                index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
            {step.shortTitle || step.title}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Empty state component
 */
export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action,
  actionLabel = 'Get Started',
  className = '' 
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon || (
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5" />
          </svg>
        )}
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title || 'No data available'}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description || 'There is no data to display at the moment.'}
      </p>
      
      {action && (
        <button
          onClick={action}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

/**
 * Inline loading for buttons
 */
export const ButtonLoading = ({ 
  loading = false, 
  children, 
  loadingText = 'Loading...',
  className = '',
  ...props 
}) => {
  return (
    <button 
      className={`flex items-center justify-center ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="small" color="white" className="mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
};

/**
 * Data loading wrapper with different states
 */
export const DataLoader = ({ 
  loading = false,
  error = null,
  data = null,
  onRetry = null,
  loadingComponent = null,
  errorComponent = null,
  emptyComponent = null,
  children,
  className = ''
}) => {
  if (loading) {
    return loadingComponent || (
      <div className={`flex justify-center py-8 ${className}`}>
        <LoadingSpinner size="large" color="blue" text="Loading..." />
      </div>
    );
  }

  if (error) {
    return errorComponent || (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-600 mb-4">{error}</div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return emptyComponent || (
      <EmptyState 
        title="No data available"
        description="There is no data to display at the moment."
        className={className}
      />
    );
  }

  return children;
};

export default {
  TextSkeleton,
  CardSkeleton,
  TableSkeleton,
  ListSkeleton,
  LoadingOverlay,
  ProgressLoading,
  EmptyState,
  ButtonLoading,
  DataLoader
};