import React from 'react';
import { useToast } from '../context/ToastContext';

class FeatureErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now().toString()
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console or error reporting service
    console.error('Feature Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Report error to analytics or error tracking service
    this.reportError(error, errorInfo);
  }

  reportError = (error, errorInfo) => {
    // In a real application, you would send this to an error tracking service
    // like Sentry, LogRocket, or Bugsnag
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      feature: this.props.feature || 'unknown',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // For now, just log to console
    console.error('Error Report:', errorReport);
    
    // You could also send to your backend
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport)
    // }).catch(console.error);
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
  };

  handleReportIssue = () => {
    const subject = encodeURIComponent(`Bug Report: ${this.props.feature || 'Feature'} Error`);
    const body = encodeURIComponent(`
Error ID: ${this.state.errorId}
Feature: ${this.props.feature || 'Unknown'}
Error: ${this.state.error?.message || 'Unknown error'}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:
[Your description here]
    `);
    
    window.open(`mailto:support@udaan.ai?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI based on feature type
      const { feature, fallback, compact = false } = this.props;

      if (fallback) {
        return fallback;
      }

      if (compact) {
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
                  {feature ? `${feature} Error` : 'Feature Error'}
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  This feature is temporarily unavailable.
                </p>
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={this.handleRetry}
                    className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded transition duration-200"
                  >
                    Retry
                  </button>
                  <button
                    onClick={this.handleReportIssue}
                    className="text-xs text-red-600 hover:text-red-800 underline"
                  >
                    Report Issue
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Full error UI
      return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-red-200">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature ? `${feature} Unavailable` : 'Feature Unavailable'}
            </h3>
            
            <p className="text-gray-600 mb-6">
              We're experiencing technical difficulties with this feature. 
              Our team has been notified and is working on a fix.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleReportIssue}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Report Issue
              </button>
            </div>

            {this.state.errorId && (
              <p className="text-xs text-gray-500 mt-4">
                Error ID: {this.state.errorId}
              </p>
            )}
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC to wrap components with feature error boundary
export const withFeatureErrorBoundary = (WrappedComponent, options = {}) => {
  return function FeatureErrorBoundaryWrapper(props) {
    return (
      <FeatureErrorBoundary {...options}>
        <WrappedComponent {...props} />
      </FeatureErrorBoundary>
    );
  };
};

// Hook to manually trigger error boundary
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);
  
  const handleError = React.useCallback((error) => {
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  if (error) {
    throw error;
  }

  return { handleError, clearError };
};

export default FeatureErrorBoundary;