import React from 'react';

const ProgressIndicator = ({ 
  progress = 0, 
  size = 'medium', 
  color = 'blue', 
  showPercentage = true,
  label = '',
  className = '',
  animated = true,
  striped = false
}) => {
  // Size configurations
  const sizeClasses = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-3',
    xlarge: 'h-4'
  };

  // Color configurations
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600',
    indigo: 'bg-indigo-600'
  };

  const height = sizeClasses[size] || sizeClasses.medium;
  const progressColor = colorClasses[color] || colorClasses.blue;
  
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  const progressBarClasses = [
    progressColor,
    height,
    'transition-all duration-500 ease-out',
    animated ? 'animate-pulse' : '',
    striped ? 'bg-gradient-to-r from-transparent via-white to-transparent bg-size-200 animate-shimmer' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={`w-full ${className}`}>
      {/* Label and percentage */}
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-600">{Math.round(normalizedProgress)}%</span>
          )}
        </div>
      )}
      
      {/* Progress bar container */}
      <div className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden`}>
        <div
          className={progressBarClasses}
          style={{ width: `${normalizedProgress}%` }}
          role="progressbar"
          aria-valuenow={normalizedProgress}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={label || `Progress: ${Math.round(normalizedProgress)}%`}
        />
      </div>
    </div>
  );
};

// Circular progress indicator
export const CircularProgress = ({ 
  progress = 0, 
  size = 60, 
  strokeWidth = 4, 
  color = 'blue',
  showPercentage = true,
  className = ''
}) => {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  const colorClasses = {
    blue: 'stroke-blue-600',
    green: 'stroke-green-600',
    yellow: 'stroke-yellow-600',
    red: 'stroke-red-600',
    purple: 'stroke-purple-600'
  };

  const strokeColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${strokeColor} transition-all duration-500 ease-out`}
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-700">
            {Math.round(normalizedProgress)}%
          </span>
        </div>
      )}
    </div>
  );
};

// Step progress indicator
export const StepProgress = ({ 
  steps = [], 
  currentStep = 0, 
  className = '',
  orientation = 'horizontal' 
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={`${className}`}>
      <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} ${isHorizontal ? 'items-center' : 'items-start'}`}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={index} className={`flex ${isHorizontal ? 'flex-col items-center' : 'flex-row items-start'} ${isHorizontal && index < steps.length - 1 ? 'flex-1' : ''}`}>
              {/* Step indicator */}
              <div className="relative">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isCompleted ? 'bg-green-600 text-white' : ''}
                    ${isCurrent ? 'bg-blue-600 text-white' : ''}
                    ${isUpcoming ? 'bg-gray-200 text-gray-600' : ''}
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
              </div>

              {/* Step label */}
              <div className={`${isHorizontal ? 'mt-2 text-center' : 'ml-3'}`}>
                <div className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                  {step.title || `Step ${index + 1}`}
                </div>
                {step.description && (
                  <div className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </div>
                )}
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    ${isHorizontal ? 'w-full h-0.5 mx-4' : 'w-0.5 h-8 ml-4 mt-2'}
                    ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;