import React from 'react';
import { AlertTriangle, RefreshCw, Database, Zap, Clock, Wifi } from 'lucide-react';

/**
 * Fallback UI component for AI service failures
 * Provides graceful degradation when AI services are unavailable
 */
const AIFallbackUI = ({ 
  type = 'general',
  onRetry,
  onUseFallback,
  fallbackData,
  error,
  isRetrying = false,
  retryCount = 0,
  maxRetries = 3
}) => {
  const getFallbackContent = () => {
    switch (type) {
      case 'resume_analysis':
        return {
          title: 'Resume Analysis Unavailable',
          description: 'Our AI resume analysis service is temporarily unavailable. You can still upload your resume and we\'ll analyze it as soon as the service is restored.',
          icon: Database,
          fallbackAction: 'Use Basic Analysis',
          fallbackDescription: 'Get basic resume feedback without AI enhancement'
        };
      case 'job_recommendations':
        return {
          title: 'Job Recommendations Unavailable',
          description: 'AI-powered job recommendations are currently unavailable. We can show you general career guidance instead.',
          icon: Zap,
          fallbackAction: 'View Career Tips',
          fallbackDescription: 'Get general career advice and job search tips'
        };
      case 'interview_questions':
        return {
          title: 'Interview Questions Unavailable',
          description: 'AI interview question generation is temporarily unavailable. You can practice with our standard question set.',
          icon: Clock,
          fallbackAction: 'Use Standard Questions',
          fallbackDescription: 'Practice with common interview questions'
        };
      case 'interview_evaluation':
        return {
          title: 'Interview Evaluation Unavailable',
          description: 'AI-powered interview evaluation is currently unavailable. Your responses have been saved for later analysis.',
          icon: AlertTriangle,
          fallbackAction: 'Save Responses',
          fallbackDescription: 'Save your answers for evaluation when service is restored'
        };
      default:
        return {
          title: 'AI Service Unavailable',
          description: 'Our AI-powered features are temporarily unavailable. Please try again in a few moments.',
          icon: Wifi,
          fallbackAction: 'Continue Without AI',
          fallbackDescription: 'Use basic features while AI service is restored'
        };
    }
  };

  const content = getFallbackContent();
  const IconComponent = content.icon;
  const canRetry = retryCount < maxRetries;
  const hasFallback = fallbackData || onUseFallback;

  return (
    <div className="bg-white border border-yellow-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-yellow-100">
            <IconComponent className="h-5 w-5 text-yellow-600" />
          </div>
        </div>
        
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {content.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            {content.description}
          </p>

          {error && process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded text-xs">
              <strong>Error:</strong> {error.message}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {canRetry && onRetry && (
              <button
                onClick={onRetry}
                disabled={isRetrying}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
                    Try Again
                    {retryCount > 0 && (
                      <span className="ml-1 text-xs">({retryCount}/{maxRetries})</span>
                    )}
                  </>
                )}
              </button>
            )}

            {hasFallback && (
              <button
                onClick={onUseFallback}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Database className="-ml-1 mr-2 h-4 w-4" />
                {content.fallbackAction}
              </button>
            )}
          </div>

          {hasFallback && (
            <p className="mt-2 text-xs text-gray-500">
              {content.fallbackDescription}
            </p>
          )}

          {!canRetry && retryCount >= maxRetries && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                Multiple retry attempts failed. Please refresh the page or contact support if the issue persists.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Higher-order component to wrap components with AI fallback handling
 */
export const withAIFallback = (WrappedComponent, fallbackType) => {
  return function AIFallbackWrapper(props) {
    const [hasAIError, setHasAIError] = React.useState(false);
    const [aiError, setAIError] = React.useState(null);
    const [retryCount, setRetryCount] = React.useState(0);
    const [isRetrying, setIsRetrying] = React.useState(false);

    const handleAIError = (error) => {
      setHasAIError(true);
      setAIError(error);
    };

    const handleRetry = async () => {
      setIsRetrying(true);
      setRetryCount(prev => prev + 1);
      
      try {
        // Reset error state
        setHasAIError(false);
        setAIError(null);
        
        // Call retry function if provided
        if (props.onRetry) {
          await props.onRetry();
        }
      } catch (error) {
        setHasAIError(true);
        setAIError(error);
      } finally {
        setIsRetrying(false);
      }
    };

    const handleUseFallback = () => {
      setHasAIError(false);
      if (props.onUseFallback) {
        props.onUseFallback();
      }
    };

    if (hasAIError) {
      return (
        <AIFallbackUI
          type={fallbackType}
          error={aiError}
          onRetry={handleRetry}
          onUseFallback={props.onUseFallback ? handleUseFallback : null}
          fallbackData={props.fallbackData}
          isRetrying={isRetrying}
          retryCount={retryCount}
        />
      );
    }

    return (
      <WrappedComponent
        {...props}
        onAIError={handleAIError}
      />
    );
  };
};

export default AIFallbackUI;