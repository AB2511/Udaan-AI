import React, { useState, useEffect } from 'react';

const ProfessionalLoader = ({ 
  title = "Processing...", 
  subtitle = "", 
  steps = [],
  currentStep = 0,
  progress = 0,
  showProgress = false,
  variant = 'default', // 'default', 'ai', 'upload'
  className = ""
}) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const getVariantStyles = () => {
    switch (variant) {
      case 'ai':
        return {
          bg: 'bg-gradient-to-br from-blue-50 to-indigo-100',
          accent: 'text-blue-600',
          icon: (
            <div className="relative">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              </div>
            </div>
          )
        };
      case 'upload':
        return {
          bg: 'bg-gradient-to-br from-green-50 to-emerald-100',
          accent: 'text-green-600',
          icon: (
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          )
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-50 to-slate-100',
          accent: 'text-gray-600',
          icon: (
            <div className="w-16 h-16 bg-gray-600 rounded-2xl flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`${styles.bg} rounded-2xl p-8 text-center ${className}`}>
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="flex justify-center">
          {styles.icon}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}{dots}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            {subtitle}
          </p>
        )}

        {/* Progress Bar */}
        {showProgress && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 ${styles.accent.replace('text-', 'bg-')} rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${progress}%` }}
              >
                <div className="h-full bg-white bg-opacity-30 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center text-left">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                  index < currentStep 
                    ? 'bg-green-500 text-white' 
                    : index === currentStep 
                    ? `${styles.accent.replace('text-', 'bg-')} text-white animate-pulse`
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {index < currentStep ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <span className={`text-sm ${
                  index <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Animated dots for simple loading */}
        {steps.length === 0 && !showProgress && (
          <div className="flex justify-center space-x-1 mt-4">
            <div className={`w-2 h-2 ${styles.accent.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
            <div className={`w-2 h-2 ${styles.accent.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
            <div className={`w-2 h-2 ${styles.accent.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

// Preset components for common use cases
export const AIProcessingLoader = ({ title = "AI is analyzing your resume", subtitle = "Our advanced AI is carefully reviewing your resume to identify skills, gaps, and opportunities...", ...props }) => (
  <ProfessionalLoader 
    variant="ai" 
    title={title}
    subtitle={subtitle}
    steps={[
      "Extracting text content",
      "Identifying skills and experience", 
      "Analyzing skill gaps",
      "Generating recommendations"
    ]}
    {...props}
  />
);

export const UploadProcessingLoader = ({ title = "Uploading your resume", subtitle = "Please wait while we securely upload and process your file...", ...props }) => (
  <ProfessionalLoader 
    variant="upload" 
    title={title}
    subtitle={subtitle}
    showProgress={true}
    {...props}
  />
);

export const GeneralProcessingLoader = ({ title = "Processing", subtitle = "Please wait while we complete your request...", ...props }) => (
  <ProfessionalLoader 
    variant="default" 
    title={title}
    subtitle={subtitle}
    {...props}
  />
);

export default ProfessionalLoader;