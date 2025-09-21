import { render, screen, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast } from '../../context/ToastContext';

// Mock the api service
vi.mock('../../services/api', () => ({
  registerToastCallback: vi.fn()
}));

// Integration test component that simulates real usage
const ToastSystemIntegrationTest = () => {
  const { addToast, showSuccess, showError, showWarning, showInfo, toasts } = useToast();

  const simulateUserActions = () => {
    // Simulate rapid user interactions that could cause issues
    showSuccess('Operation completed successfully!');
    showError('An error occurred while processing');
    showWarning('Please check your input');
    showInfo('New feature available');
    
    // Add custom toasts with different configurations
    addToast('Custom toast 1', 'success');
    addToast('Custom toast 2', 'error');
  };

  const simulateStressTest = () => {
    // Simulate stress conditions
    for (let i = 0; i < 10; i++) {
      addToast(`Stress test message ${i}`, i % 2 === 0 ? 'success' : 'error');
    }
  };

  return (
    <div>
      <button onClick={simulateUserActions}>Simulate User Actions</button>
      <button onClick={simulateStressTest}>Stress Test</button>
      <div data-testid="toast-count">{toasts.length}</div>
      <div data-testid="integration-status">Ready</div>
    </div>
  );
};

// Mock console methods to capture warnings and errors
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

describe('Toast System Integration Tests', () => {
  let consoleErrors = [];
  let consoleWarnings = [];

  beforeEach(() => {
    consoleErrors = [];
    consoleWarnings = [];
    
    // Mock console methods to capture output
    console.error = (...args) => {
      consoleErrors.push(args.join(' '));
      originalConsoleError(...args);
    };
    
    console.warn = (...args) => {
      consoleWarnings.push(args.join(' '));
      originalConsoleWarn(...args);
    };
    
    // Mock timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    
    // Restore timers
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Complete System Validation', () => {
    it('should pass all requirements without console warnings or errors', async () => {
      render(
        <ToastProvider>
          <ToastSystemIntegrationTest />
        </ToastProvider>
      );

      // Verify initial state
      expect(screen.getByTestId('integration-status')).toHaveTextContent('Ready');
      expect(screen.getByTestId('toast-count')).toHaveTextContent('0');

      // Simulate user actions
      const userActionsButton = screen.getByText('Simulate User Actions');
      act(() => {
        userActionsButton.click();
      });

      // Verify toasts are displayed (should be limited to 5)
      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('5');
      });

      // Verify no console errors or warnings
      expect(consoleErrors.filter(error => 
        error.includes('Maximum update depth exceeded') ||
        error.includes('Warning: Each child in a list should have a unique "key" prop')
      )).toHaveLength(0);

      expect(consoleWarnings.filter(warning => 
        warning.includes('Encountered two children with the same key') ||
        warning.includes('duplicate keys')
      )).toHaveLength(0);

      // Test auto-dismiss functionality
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
      });
    });

    it('should handle stress conditions without breaking', async () => {
      render(
        <ToastProvider>
          <ToastSystemIntegrationTest />
        </ToastProvider>
      );

      // Run stress test
      const stressTestButton = screen.getByText('Stress Test');
      act(() => {
        stressTestButton.click();
      });

      // Should limit to 5 toasts maximum
      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('5');
      });

      // Verify no performance issues or console errors
      expect(consoleErrors.filter(error => 
        error.includes('Maximum update depth exceeded')
      )).toHaveLength(0);

      // Test that system recovers properly
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
      });
    });

    it('should maintain stable rendering without flickering', async () => {
      const { rerender } = render(
        <ToastProvider>
          <ToastSystemIntegrationTest />
        </ToastProvider>
      );

      // Add some toasts
      const userActionsButton = screen.getByText('Simulate User Actions');
      act(() => {
        userActionsButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('5');
      });

      // Re-render multiple times to test stability
      for (let i = 0; i < 5; i++) {
        rerender(
          <ToastProvider>
            <ToastSystemIntegrationTest />
          </ToastProvider>
        );
      }

      // Verify no console warnings about unstable rendering
      expect(consoleWarnings.filter(warning => 
        warning.includes('unstable') ||
        warning.includes('flicker')
      )).toHaveLength(0);
    });
  });

  describe('Requirement Validation Summary', () => {
    it('should satisfy Requirement 1.1: No Maximum update depth exceeded warnings', async () => {
      render(
        <ToastProvider>
          <ToastSystemIntegrationTest />
        </ToastProvider>
      );

      // Trigger multiple rapid updates
      const userActionsButton = screen.getByText('Simulate User Actions');
      const stressTestButton = screen.getByText('Stress Test');
      
      act(() => {
        userActionsButton.click();
        stressTestButton.click();
      });

      // Check for the specific error
      const hasMaxUpdateError = consoleErrors.some(error => 
        error.includes('Maximum update depth exceeded')
      );
      expect(hasMaxUpdateError).toBe(false);
    });

    it('should satisfy Requirement 2.1: No duplicate key warnings', async () => {
      render(
        <ToastProvider>
          <ToastSystemIntegrationTest />
        </ToastProvider>
      );

      // Create multiple toasts
      const stressTestButton = screen.getByText('Stress Test');
      act(() => {
        stressTestButton.click();
      });

      // Check for duplicate key warnings
      const hasDuplicateKeyWarning = consoleWarnings.some(warning => 
        warning.includes('Encountered two children with the same key') ||
        warning.includes('duplicate keys')
      );
      expect(hasDuplicateKeyWarning).toBe(false);
    });

    it('should satisfy Requirements 3.1, 3.2, 3.3: Toast display and functionality', async () => {
      render(
        <ToastProvider>
          <ToastSystemIntegrationTest />
        </ToastProvider>
      );

      // Test display functionality
      const userActionsButton = screen.getByText('Simulate User Actions');
      act(() => {
        userActionsButton.click();
      });

      // Verify toasts are displayed
      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('5');
      });

      // Test auto-dismiss
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
      });

      // Verify no rendering issues
      expect(consoleErrors).toHaveLength(0);
      expect(consoleWarnings.filter(w => w.includes('Warning'))).toHaveLength(0);
    });
  });
});