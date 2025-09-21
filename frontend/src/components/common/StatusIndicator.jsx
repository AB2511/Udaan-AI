import React from 'react';

const StatusIndicator = ({ 
  status = 'info', // 'success', 'warning', 'error', 'info', 'loading'
  title,
  message,
  icon,
  action,
  onAction,
  className = '',
  variant = 'default', // 'default', 'minimal', 'card'
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const getStatusConfig = () => {
    const configs = {
      success: {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        iconColor: 'text-green-600',
        defaultIcon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      warning: {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-600',
        defaultIcon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      },
      error: {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
        defaultIcon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      info: {
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600',
        defaultIcon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      loading: {
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-800',
        iconColor: 'text-gray-600',
        defaultIcon: (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        )
      }
    };
    return configs[status] || configs.info;
  };

  const getSizeConfig = () => {
    const configs = {
      small: {
        padding: 'p-3',
        iconSize: 'w-4 h-4',
        titleSize: 'text-sm',
        messageSize: 'text-xs',
        spacing: 'space-x-2'
      },
      medium: {
        padding: 'p-4',
        iconSize: 'w-5 h-5',
        titleSize: 'text-base',
        messageSize: 'text-sm',
        spacing: 'space-x-3'
      },
      large: {
        padding: 'p-6',
        iconSize: 'w-6 h-6',
        titleSize: 'text-lg',
        messageSize: 'text-base',
        spacing: 'space-x-4'
      }
    };
    return configs[size] || configs.medium;
  };

  const statusConfig = getStatusConfig();
  const sizeConfig = getSizeConfig();

  const renderContent = () => {
    const iconElement = icon || statusConfig.defaultIcon;
    
    return (
      <div className={`flex items-start ${sizeConfig.spacing}`}>
        {/* Icon */}
        <div className={`flex-shrink-0 ${statusConfig.iconColor}`}>
          {React.cloneElement(iconElement, { 
            className: `${sizeConfig.iconSize} ${iconElement.props?.className || ''}` 
          })}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-semibold ${statusConfig.textColor} ${sizeConfig.titleSize} mb-1`}>
              {title}
            </h4>
          )}
          {message && (
            <p className={`${statusConfig.textColor} ${sizeConfig.messageSize} leading-relaxed`}>
              {message}
            </p>
          )}
        </div>

        {/* Action Button */}
        {action && onAction && (
          <div className="flex-shrink-0 ml-4">
            <button
              onClick={onAction}
              className={`text-sm font-medium ${statusConfig.iconColor} hover:opacity-75 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${status === 'success' ? 'green' : status === 'warning' ? 'yellow' : status === 'error' ? 'red' : 'blue'}-500 rounded px-2 py-1`}
            >
              {action}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Variant styles
  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return `${sizeConfig.padding}`;
      case 'card':
        return `${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-xl shadow-sm ${sizeConfig.padding}`;
      default:
        return `${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-lg ${sizeConfig.padding}`;
    }
  };

  return (
    <div className={`${getVariantClasses()} ${className} animate-fade-in-up`}>
      {renderContent()}
    </div>
  );
};

// Preset components for common use cases
export const SuccessAlert = ({ title = "Success!", message, ...props }) => (
  <StatusIndicator status="success" title={title} message={message} {...props} />
);

export const ErrorAlert = ({ title = "Error", message, ...props }) => (
  <StatusIndicator status="error" title={title} message={message} {...props} />
);

export const WarningAlert = ({ title = "Warning", message, ...props }) => (
  <StatusIndicator status="warning" title={title} message={message} {...props} />
);

export const InfoAlert = ({ title = "Information", message, ...props }) => (
  <StatusIndicator status="info" title={title} message={message} {...props} />
);

export const LoadingAlert = ({ title = "Loading...", message, ...props }) => (
  <StatusIndicator status="loading" title={title} message={message} {...props} />
);

export default StatusIndicator;