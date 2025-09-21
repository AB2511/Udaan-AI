import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Wifi, WifiOff } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorType: 'UNKNOWN',
      retryCount: 0,
      isOnline: navigator.onlineState !== false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console or error reporting service
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Determine error type for better user messaging
    const errorType = this.categorizeError(error);
    
    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorType: errorType
    });

    // Report error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo, errorType);
    }
  }

  componentDidMount() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  handleOnline = () => {
    this.setState({ isOnline: true });
  };

  handleOffline = () => {
    this.setState({ isOnline: false });
  };

  categorizeError = (error) => {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorStack = error.stack?.toLowerCase() || '';
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'NETWORK';
    }
    if (errorMessage.includes('chunk') || errorMessage.includes('loading')) {
      return 'CHUNK_LOAD';
    }
    if (errorMessage.includes('ai') || errorMessage.includes('vertex')) {
      return 'AI_SERVICE';
    }
    if (errorStack.includes('resume') || errorStack.includes('upload')) {
      return 'RESUME_PROCESSING';
    }
    if (errorStack.includes('auth') || errorMessage.includes('unauthorized')) {
      return 'AUTHENTICATION';
    }
    
    return 'UNKNOWN';
  };

  reportError = (error, errorInfo, errorType) => {
    // In a real app, this would send to error monitoring service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorType: errorType,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userId: localStorage.getItem('userId') || 'anonymous'
    };
    
    console.log('Error Report:', errorReport);
    // Example: sendToErrorService(errorReport);
  };

  handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;
    
    // Clear error state and increment retry count
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: newRetryCount
    });

    // If this is a chunk loading error, force a page reload
    if (this.state.errorType === 'CHUNK_LOAD') {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    // Clear any stored state that might be causing issues
    if (this.state.errorType === 'AUTHENTICATION') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  getErrorMessage = () => {
    const { errorType, isOnline } = this.state;
    
    if (!isOnline) {
      return {
        title: "No Internet Connection",
        description: "Please check your internet connection and try again.",
        icon: WifiOff,
        color: "text-orange-600",
        bgColor: "bg-orange-100"
      };
    }

    switch (errorType) {
      case 'NETWORK':
        return {
          title: "Connection Problem",
          description: "Unable to connect to our servers. Please check your internet connection.",
          icon: Wifi,
          color: "text-orange-600",
          bgColor: "bg-orange-100"
        };
      case 'CHUNK_LOAD':
        return {
          title: "Loading Error",
          description: "Failed to load application resources. This usually resolves with a page refresh.",
          icon: RefreshCw,
          color: "text-blue-600",
          bgColor: "bg-blue-100"
        };
      case 'AI_SERVICE':
        return {
          title: "AI Service Error",
          description: "Our AI features are temporarily unavailable. Please try again in a moment.",
          icon: Bug,
          color: "text-purple-600",
          bgColor: "bg-purple-100"
        };
      case 'RESUME_PROCESSING':
        return {
          title: "Resume Processing Error",
          description: "There was an issue processing your resume. Please try uploading again.",
          icon: AlertTriangle,
          color: "text-yellow-600",
          bgColor: "bg-yellow-100"
        };
      case 'AUTHENTICATION':
        return {
          title: "Authentication Error",
          description: "Your session has expired. Please log in again to continue.",
          icon: AlertTriangle,
          color: "text-red-600",
          bgColor: "bg-red-100"
        };
      default:
        return {
          title: "Something went wrong",
          description: "We encountered an unexpected error. Our team has been notified.",
          icon: AlertTriangle,
          color: "text-red-600",
          bgColor: "bg-red-100"
        };
    }
  };

  render() {
    if (this.state.hasError) {
      const errorInfo = this.getErrorMessage();
      const IconComponent = errorInfo.icon;
      const showRetry = this.state.retryCount < 3; // Limit retry attempts

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${errorInfo.bgColor}`}>
                <IconComponent className={`h-6 w-6 ${errorInfo.color}`} />
              </div>
            </div>
            
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {errorInfo.title}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {errorInfo.description}
            </p>

            {!this.state.isOnline && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                <p className="text-sm text-orange-800">
                  You appear to be offline. Please check your internet connection.
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              {showRetry && (
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                  {this.state.retryCount > 0 && (
                    <span className="ml-1 text-xs">({this.state.retryCount}/3)</span>
                  )}
                </button>
              )}
              
              {this.state.errorType === 'CHUNK_LOAD' && (
                <button
                  onClick={this.handleReload}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200 flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </button>
              )}
              
              <button
                onClick={this.handleGoHome}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-200 flex items-center justify-center"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Home
              </button>
            </div>

            {this.state.retryCount >= 3 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  Multiple retry attempts failed. Please refresh the page or contact support if the issue persists.
                </p>
              </div>
            )}
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error Type:</strong> {this.state.errorType}
                  </div>
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

export default ErrorBoundary;