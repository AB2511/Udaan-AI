/**
 * AI Loading Indicator Component
 * Enhanced loading indicator specifically for AI operations
 */

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Zap, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';

const AILoadingIndicator = ({ 
  operation = 'processing',
  message = 'AI is processing your request...',
  showProgress = false,
  progress = 0,
  estimatedTime = null,
  onCancel = null,
  size = 'medium',
  variant = 'default'
}) => {
  const [dots, setDots] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Track elapsed time
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'p-3',
          icon: 'h-5 w-5',
          text: 'text-sm',
          progress: 'h-1'
        };
      case 'large':
        return {
          container: 'p-8',
          icon: 'h-12 w-12',
          text: 'text-lg',
          progress: 'h-3'
        };
      default:
        return {
          container: 'p-6',
          icon: 'h-8 w-8',
          text: 'text-base',
          progress: 'h-2'
        };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return {
          container: 'bg-transparent border-0 shadow-none',
          icon: 'text-blue-500',
          text: 'text-gray-600'
        };
      case 'card':
        return {
          container: 'bg-white border border-gray-200 rounded-lg shadow-sm',
          icon: 'text-blue-500',
          text: 'text-gray-700'
        };
      default:
        return {
          container: 'bg-blue-50 border border-blue-200 rounded-lg',
          icon: 'text-blue-600',
          text: 'text-blue-800'
        };
    }
  };

  const getOperationIcon = () => {
    switch (operation) {
      case 'analyzing':
        return <Brain className={`${sizeClasses.icon} ${variantClasses.icon} animate-pulse`} />;
      case 'generating':
        return <Sparkles className={`${sizeClasses.icon} ${variantClasses.icon} animate-spin`} />;
      case 'connecting':
        return <Zap className={`${sizeClasses.icon} ${variantClasses.icon} animate-bounce`} />;
      case 'processing':
      default:
        return <RefreshCw className={`${sizeClasses.icon} ${variantClasses.icon} animate-spin`} />;
    }
  };

  const getOperationMessage = () => {
    const messages = {
      analyzing: 'Analyzing your content with AI',
      generating: 'Generating personalized recommendations',
      connecting: 'Connecting to AI service',
      processing: 'Processing your request'
    };
    
    return messages[operation] || message;
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClasses.container} ${variantClasses.container}`}>
      {/* Main loading animation */}
      <div className="flex items-center space-x-3 mb-4">
        {getOperationIcon()}
        <div className="flex flex-col">
          <div className={`font-medium ${variantClasses.text} ${sizeClasses.text}`}>
            {getOperationMessage()}{dots}
          </div>
          {elapsedTime > 0 && (
            <div className="flex items-center space-x-2 mt-1">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {elapsedTime}s elapsed
                {estimatedTime && ` / ~${estimatedTime}s`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="w-full max-w-xs mb-4">
          <div className={`w-full bg-gray-200 rounded-full ${sizeClasses.progress}`}>
            <div 
              className={`bg-blue-500 ${sizeClasses.progress} rounded-full transition-all duration-300 ease-out`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-center mt-1">
            {Math.round(progress)}% complete
          </div>
        </div>
      )}

      {/* Status messages */}
      <div className="text-center space-y-2">
        {elapsedTime > 10 && (
          <div className="flex items-center justify-center space-x-2 text-yellow-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">
              Taking longer than usual...
            </span>
          </div>
        )}
        
        {elapsedTime > 20 && (
          <div className="text-sm text-gray-600">
            AI service may be experiencing high demand. Please wait.
          </div>
        )}
      </div>

      {/* Cancel button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      )}

      {/* Helpful tips */}
      {size !== 'small' && elapsedTime > 15 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md max-w-md">
          <div className="text-xs text-gray-600 text-center">
            <div className="font-medium mb-1">💡 While you wait:</div>
            <div>Our AI is carefully analyzing your content to provide the best recommendations.</div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Specialized loading indicators for different operations
 */
export const ResumeAnalysisLoader = ({ onCancel }) => (
  <AILoadingIndicator
    operation="analyzing"
    message="Analyzing your resume with AI"
    estimatedTime={15}
    onCancel={onCancel}
    size="large"
    variant="card"
  />
);

export const JobRecommendationsLoader = ({ progress = 0 }) => (
  <AILoadingIndicator
    operation="generating"
    message="Generating personalized job recommendations"
    showProgress={true}
    progress={progress}
    estimatedTime={10}
    size="medium"
    variant="default"
  />
);

export const InterviewQuestionsLoader = () => (
  <AILoadingIndicator
    operation="generating"
    message="Creating interview questions for you"
    estimatedTime={8}
    size="medium"
    variant="card"
  />
);

export const AIConnectionLoader = ({ onCancel }) => (
  <AILoadingIndicator
    operation="connecting"
    message="Connecting to AI service"
    estimatedTime={5}
    onCancel={onCancel}
    size="small"
    variant="minimal"
  />
);

export default AILoadingIndicator;