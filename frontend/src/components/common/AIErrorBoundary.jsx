/**
 * AI Error Boundary Component
 * Catches AI-related errors and provides fallback UI with recovery options
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Settings, Zap, Info, CheckCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import aiStatusService from '../../services/aiStatusService';
import fallbackDataService from '../../services/fallbackDataService';

class AIErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false,
      recoveryAttempts: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error for debugging
    console.error('AI Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = async () => {
    this.setState({ isRecovering: true });

    try {
      // Attempt to recover the AI service
      const recoveryResult = await aiStatusService.attemptRecovery();
      
      if (recoveryResult.success) {
        // Reset error state and retry
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          isRecovering: false,
          recoveryAttempts: this.state.recoveryAttempts + 1
        });
        
        if (this.props.onRecovery) {
          this.props.onRecovery();
        }
      } else {
        this.setState({ isRecovering: false });
        
        if (this.props.onRecoveryFailed) {
          this.props.onRecoveryFailed(recoveryResult.error);
        }
      }
    } catch (error) {
      this.setState({ isRecovering: false });
      console.error('Recovery attempt failed:', error);
    }
  };

  handleUseFallback = () => {
    const { fallbackType } = this.props;
    
    // Get fallback data based on type
    let fallbackData = null;
    if (fallbackType && fallbackDataService.isFallbackAvailable(fallbackType)) {
      switch (fallbackType) {
        case 'resume_analysis':
          fallbackData = fallbackDataService.getResumeAnalysis();
          break;
        case 'assessment_generation':
          fallbackData = fallbackDataService.getAssessmentQuestions();
          break;
        case 'interview_generation':
          fallbackData = fallbackDataService.getInterviewQuestions();
          break;
        case 'interview_evaluation':
          fallbackData = fallbackDataService.getInterviewEvaluation([]);
          break;
      }
    }
    
    if (this.props.onUseFallback) {
      this.props.onUseFallback(fallbackData);
    }
    
    // Reset error state to show fallback content
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { fallbackComponent: FallbackComponent, showRecoveryOptions = true } = this.props;

      // If a custom fallback component is provided, use it
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            onUseFallback={this.handleUseFallback}
            isRecovering={this.state.isRecovering}
          />
        );
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-red-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    AI Service Error
                  </h3>
                  <p className="text-sm text-gray-500">
                    Something went wrong with the AI-powered features
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  The AI service encountered an issue. You can try to recover the service,
                  use backup functionality, or refresh the page.
                </p>
              </div>

              {showRecoveryOptions && (
                <div className="space-y-3">
                  <button
                    onClick={this.handleRetry}
                    disabled={this.state.isRecovering}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {this.state.isRecovering ? (
                      <>
                        <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Recovering...
                      </>
                    ) : (
                      <>
                        <Zap className="-ml-1 mr-2 h-4 w-4" />
                        Attempt Recovery
                      </>
                    )}
                  </button>

                  {this.props.onUseFallback && (
                    <button
                      onClick={this.handleUseFallback}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Settings className="-ml-1 mr-2 h-4 w-4" />
                      Use Backup System
                    </button>
                  )}

                  <button
                    onClick={this.handleRefresh}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
                    Refresh Page
                  </button>
                </div>
              )}

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="text-sm text-gray-500 cursor-pointer">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-auto max-h-32">
                    {this.state.error && this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook version of AI Error Boundary for functional components
 */
export const useAIErrorHandler = () => {
  const { showToast } = useToast();

  const handleAIError = React.useCallback(async (error, context = {}) => {
    const errorInfo = aiStatusService.handleAIError(error, context);
    
    // Show appropriate toast message
    if (errorInfo.fallbackAvailable) {
      showToast(
        `${errorInfo.message} Using backup system.`,
        'warning'
      );
    } else {
      showToast(errorInfo.message, 'error');
    }

    return errorInfo;
  }, [showToast]);

  const executeWithErrorHandling = React.useCallback(async (operation, context = {}) => {
    try {
      return await aiStatusService.executeWithFallback(operation, context);
    } catch (error) {
      return handleAIError(error, context);
    }
  }, [handleAIError]);

  return {
    handleAIError,
    executeWithErrorHandling
  };
};

export default AIErrorBoundary;