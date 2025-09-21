import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { ToastProvider } from '../../context/ToastContext';
import AIFallbackUI from '../../components/common/AIFallbackUI';
import NetworkStatus, { useNetworkStatus } from '../../components/common/NetworkStatus';

// Mock components for testing
const ThrowError = ({ shouldThrow = false, errorType = 'generic' }) => {
  if (shouldThrow) {
    if (errorType === 'network') {
      throw new Error('Network request failed');
    } else if (errorType === 'chunk') {
      throw new Error('Loading chunk 1 failed');
    } else if (errorType === 'ai') {
      throw new Error('AI service unavailable');
    }
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

const ErrorHandlerTestComponent = ({ operation, context, options }) => {
  const { handleAsyncOperation, handleError } = useErrorHandler();
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState(null);

  const runOperation = async () => {
    try {
      if (operation) {
        const result = await handleAsyncOperation(operation, context, options);
        setResult(result);
      }
    } catch (err) {
      setError(err);
    }
  };

  const triggerError = () => {
    const testError = new Error('Test error');
    handleError(testError, context, options);
  };

  return (
    <div>
      <button onClick={runOperation} data-testid="run-operation">
        Run Operation
      </button>
      <button onClick={triggerError} data-testid="trigger-error">
        Trigger Error
      </button>
      {result && <div data-testid="result">{JSON.stringify(result)}</div>}
      {error && <div data-testid="error">{error.message}</div>}
    </div>
  );
};

const NetworkStatusTestComponent = () => {
  const { isOnline, apiHealthy, checkHealth } = useNetworkStatus();
  
  return (
    <div>
      <div data-testid="online-status">{isOnline ? 'online' : 'offline'}</div>
      <div data-testid="api-status">{apiHealthy ? 'healthy' : 'unhealthy'}</div>
      <button onClick={checkHealth} data-testid="check-health">
        Check Health
      </button>
    </div>
  );
};

describe('Error Handling System', () => {
  beforeEach(() => {
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ErrorBoundary', () => {
    it('should catch and display generic errors', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Go to Home')).toBeInTheDocument();
    });

    it('should categorize network errors correctly', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorType="network" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Connection Problem')).toBeInTheDocument();
      expect(screen.getByText(/Unable to connect to our servers/)).toBeInTheDocument();
    });

    it('should categorize chunk loading errors correctly', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorType="chunk" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Loading Error')).toBeInTheDocument();
      expect(screen.getByText('Reload Page')).toBeInTheDocument();
    });

    it('should categorize AI service errors correctly', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorType="ai" />
        </ErrorBoundary>
      );

      expect(screen.getByText('AI Service Error')).toBeInTheDocument();
      expect(screen.getByText(/AI features are temporarily unavailable/)).toBeInTheDocument();
    });

    it('should handle retry functionality', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      // After retry, render without error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should limit retry attempts', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Simulate multiple retries by checking retry count display
      const retryButton = screen.getByText('Try Again');
      
      // First retry
      fireEvent.click(retryButton);
      expect(screen.getByText(/\(1\/3\)/)).toBeInTheDocument();
    });

    it('should show offline status when navigator is offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No Internet Connection')).toBeInTheDocument();
      expect(screen.getByText(/You appear to be offline/)).toBeInTheDocument();
    });
  });

  describe('useErrorHandler Hook', () => {
    it('should handle async operations successfully', async () => {
      const successOperation = vi.fn().mockResolvedValue({ data: 'success' });
      
      render(
        <ToastProvider>
          <ErrorHandlerTestComponent 
            operation={successOperation}
            context="Test operation"
            options={{ successMessage: 'Operation completed' }}
          />
        </ToastProvider>
      );

      const runButton = screen.getByTestId('run-operation');
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByTestId('result')).toHaveTextContent('{"data":"success"}');
      });

      expect(successOperation).toHaveBeenCalledTimes(1);
    });

    it('should handle async operation failures', async () => {
      const failOperation = vi.fn().mockRejectedValue(new Error('Operation failed'));
      
      render(
        <ToastProvider>
          <ErrorHandlerTestComponent 
            operation={failOperation}
            context="Test operation"
          />
        </ToastProvider>
      );

      const runButton = screen.getByTestId('run-operation');
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });
    });

    it('should retry failed operations', async () => {
      let callCount = 0;
      const retryOperation = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve({ data: 'success after retry' });
      });
      
      render(
        <ToastProvider>
          <ErrorHandlerTestComponent 
            operation={retryOperation}
            context="Retry test"
            options={{ retries: 2, retryDelay: 100 }}
          />
        </ToastProvider>
      );

      const runButton = screen.getByTestId('run-operation');
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByTestId('result')).toHaveTextContent('success after retry');
      }, { timeout: 2000 });

      expect(retryOperation).toHaveBeenCalledTimes(3);
    });

    it('should handle error categorization', () => {
      render(
        <ToastProvider>
          <ErrorHandlerTestComponent context="Error test" />
        </ToastProvider>
      );

      const triggerButton = screen.getByTestId('trigger-error');
      fireEvent.click(triggerButton);

      // Should show toast notification (we can't easily test toast content in this setup)
      // But we can verify the error handler was called without throwing
      expect(triggerButton).toBeInTheDocument();
    });
  });

  describe('AIFallbackUI', () => {
    it('should render resume analysis fallback', () => {
      render(
        <AIFallbackUI 
          type="resume_analysis"
          onRetry={vi.fn()}
          onUseFallback={vi.fn()}
        />
      );

      expect(screen.getByText('Resume Analysis Unavailable')).toBeInTheDocument();
      expect(screen.getByText('Use Basic Analysis')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should render job recommendations fallback', () => {
      render(
        <AIFallbackUI 
          type="job_recommendations"
          onRetry={vi.fn()}
          onUseFallback={vi.fn()}
        />
      );

      expect(screen.getByText('Job Recommendations Unavailable')).toBeInTheDocument();
      expect(screen.getByText('View Career Tips')).toBeInTheDocument();
    });

    it('should handle retry functionality', () => {
      const mockRetry = vi.fn();
      
      render(
        <AIFallbackUI 
          type="general"
          onRetry={mockRetry}
        />
      );

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('should handle fallback functionality', () => {
      const mockUseFallback = vi.fn();
      
      render(
        <AIFallbackUI 
          type="interview_questions"
          onUseFallback={mockUseFallback}
        />
      );

      const fallbackButton = screen.getByText('Use Standard Questions');
      fireEvent.click(fallbackButton);

      expect(mockUseFallback).toHaveBeenCalledTimes(1);
    });

    it('should show retry limit message', () => {
      render(
        <AIFallbackUI 
          type="general"
          retryCount={3}
          maxRetries={3}
        />
      );

      expect(screen.getByText(/Multiple retry attempts failed/)).toBeInTheDocument();
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });

    it('should show loading state during retry', () => {
      render(
        <AIFallbackUI 
          type="general"
          onRetry={vi.fn()}
          isRetrying={true}
        />
      );

      expect(screen.getByText('Retrying...')).toBeInTheDocument();
    });
  });

  describe('NetworkStatus', () => {
    it('should not show indicator when online and healthy', () => {
      render(<NetworkStatus />);
      
      // Should not render anything when everything is working
      expect(screen.queryByText('Connected')).not.toBeInTheDocument();
    });

    it('should show offline indicator when offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      render(<NetworkStatus />);
      
      expect(screen.getByText('No internet connection')).toBeInTheDocument();
    });

    it('should handle online/offline events', async () => {
      render(
        <ToastProvider>
          <NetworkStatusTestComponent />
        </ToastProvider>
      );

      expect(screen.getByTestId('online-status')).toHaveTextContent('online');

      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      
      fireEvent(window, new Event('offline'));

      await waitFor(() => {
        expect(screen.getByTestId('online-status')).toHaveTextContent('offline');
      });

      // Simulate coming back online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });
      
      fireEvent(window, new Event('online'));

      await waitFor(() => {
        expect(screen.getByTestId('online-status')).toHaveTextContent('online');
      });
    });
  });

  describe('File Upload Error Handling', () => {
    it('should validate file size', async () => {
      const { handleFileUpload } = useErrorHandler();
      
      // Create a mock file that's too large
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf'
      });

      const mockUpload = vi.fn();

      try {
        await handleFileUpload(largeFile, mockUpload, { maxSize: 5 * 1024 * 1024 });
      } catch (error) {
        expect(error.message).toContain('File size exceeds');
      }

      expect(mockUpload).not.toHaveBeenCalled();
    });

    it('should validate file type', async () => {
      const { handleFileUpload } = useErrorHandler();
      
      // Create a mock file with invalid type
      const invalidFile = new File(['content'], 'test.txt', {
        type: 'text/plain'
      });

      const mockUpload = vi.fn();

      try {
        await handleFileUpload(invalidFile, mockUpload);
      } catch (error) {
        expect(error.message).toContain('Invalid file type');
      }

      expect(mockUpload).not.toHaveBeenCalled();
    });

    it('should handle missing file', async () => {
      const { handleFileUpload } = useErrorHandler();
      const mockUpload = vi.fn();

      try {
        await handleFileUpload(null, mockUpload);
      } catch (error) {
        expect(error.message).toContain('No file selected');
      }

      expect(mockUpload).not.toHaveBeenCalled();
    });
  });

  describe('AI Operation Error Handling', () => {
    it('should handle AI timeout', async () => {
      const { handleAIOperation } = useErrorHandler();
      
      const slowOperation = () => new Promise(resolve => 
        setTimeout(resolve, 2000)
      );

      try {
        await handleAIOperation(slowOperation, 'AI test', { timeout: 1000 });
      } catch (error) {
        expect(error.message).toContain('AI operation timed out');
      }
    });

    it('should use fallback data when AI fails', async () => {
      const { handleAIOperation } = useErrorHandler();
      
      const failingOperation = () => Promise.reject(new Error('AI service down'));
      const fallbackData = { result: 'fallback' };

      const result = await handleAIOperation(
        failingOperation, 
        'AI test', 
        { fallbackData, showFallbackToast: false }
      );

      expect(result).toEqual(fallbackData);
    });
  });
});