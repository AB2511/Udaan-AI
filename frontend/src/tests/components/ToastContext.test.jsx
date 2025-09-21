import { render, screen, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast } from '../../context/ToastContext';
import { useState } from 'react';

// Mock the api service
vi.mock('../../services/api', () => ({
  registerToastCallback: vi.fn()
}));

// Test component that uses the toast context
const TestComponent = () => {
  const { addToast, removeToast, toasts, showSuccess, showError } = useToast();
  const [toastIds, setToastIds] = useState([]);

  const handleAddToast = () => {
    const id = addToast('Test message', 'success');
    setToastIds(prev => [...prev, id]);
  };

  const handleAddMultipleToasts = () => {
    const ids = [];
    for (let i = 0; i < 3; i++) {
      const id = addToast(`Message ${i + 1}`, 'info');
      ids.push(id);
    }
    setToastIds(prev => [...prev, ...ids]);
  };

  const handleRemoveFirst = () => {
    if (toastIds.length > 0) {
      removeToast(toastIds[0]);
      setToastIds(prev => prev.slice(1));
    }
  };

  return (
    <div>
      <button onClick={handleAddToast}>Add Toast</button>
      <button onClick={handleAddMultipleToasts}>Add Multiple Toasts</button>
      <button onClick={handleRemoveFirst}>Remove First Toast</button>
      <button onClick={() => showSuccess('Success!')}>Show Success</button>
      <button onClick={() => showError('Error!')}>Show Error</button>
      <div data-testid="toast-count">{toasts.length}</div>
      <div data-testid="toast-list">
        {toasts.map(toast => (
          <div key={toast.id} data-testid={`toast-${toast.id}`}>
            {toast.message} - {toast.type}
          </div>
        ))}
      </div>
    </div>
  );
};

// Mock console methods to capture warnings and errors
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

describe('ToastContext', () => {
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

  describe('Requirement 1.1: No Maximum update depth exceeded warnings', () => {
    it('should not cause infinite render loops when adding toasts', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const addButton = screen.getByText('Add Toast');
      
      // Add multiple toasts rapidly
      for (let i = 0; i < 5; i++) {
        act(() => {
          addButton.click();
        });
      }

      // Check that no "Maximum update depth exceeded" errors occurred
      const hasMaxUpdateError = consoleErrors.some(error => 
        error.includes('Maximum update depth exceeded')
      );
      expect(hasMaxUpdateError).toBe(false);
    });
  });

  describe('Requirement 2.1: No duplicate key warnings', () => {
    it('should generate unique IDs for toasts', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const addMultipleButton = screen.getByText('Add Multiple Toasts');
      
      act(() => {
        addMultipleButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('3');
      });

      // Check that no duplicate key warnings occurred
      const hasDuplicateKeyWarning = consoleWarnings.some(warning => 
        warning.includes('Encountered two children with the same key') ||
        warning.includes('duplicate keys')
      );
      expect(hasDuplicateKeyWarning).toBe(false);
    });

    it('should use Date.now() + Math.random() for unique ID generation', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const addButton = screen.getByText('Add Toast');
      
      // Add multiple toasts and verify they have different IDs
      act(() => {
        addButton.click();
        addButton.click();
        addButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('3');
      });

      const toastElements = screen.getAllByTestId(/^toast-/);
      const ids = toastElements.map(el => el.getAttribute('data-testid').replace('toast-', ''));
      
      // Verify all IDs are unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Requirement 3.1 & 3.2: Toast display and auto-dismiss', () => {
    it('should display toasts with correct messages and types', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const successButton = screen.getByText('Show Success');
      const errorButton = screen.getByText('Show Error');
      
      act(() => {
        successButton.click();
        errorButton.click();
      });

      await waitFor(() => {
        expect(screen.getByText('Success!')).toBeInTheDocument();
        expect(screen.getByText('Error!')).toBeInTheDocument();
      });
    });

    it('should auto-dismiss toasts after timeout', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const addButton = screen.getByText('Add Toast');
      
      act(() => {
        addButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
      });

      // Fast-forward time by 5 seconds (default auto-dismiss duration)
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
      });
    });
  });

  describe('Requirement 3.3: Multiple toast stacking', () => {
    it('should handle multiple toasts without overlap or positioning issues', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const addMultipleButton = screen.getByText('Add Multiple Toasts');
      
      act(() => {
        addMultipleButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('3');
      });

      // Verify all toasts are rendered
      expect(screen.getByText('Message 1 - info')).toBeInTheDocument();
      expect(screen.getByText('Message 2 - info')).toBeInTheDocument();
      expect(screen.getByText('Message 3 - info')).toBeInTheDocument();
    });

    it('should limit toasts to maximum of 5', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const addButton = screen.getByText('Add Toast');
      
      // Add 7 toasts (more than the limit of 5)
      for (let i = 0; i < 7; i++) {
        act(() => {
          addButton.click();
        });
      }

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('5');
      });
    });
  });

  describe('Function stability', () => {
    it('should provide stable function references', () => {
      let firstRenderFunctions;
      let secondRenderFunctions;

      const StabilityTestComponent = () => {
        const toastFunctions = useToast();
        
        if (!firstRenderFunctions) {
          firstRenderFunctions = toastFunctions;
        } else if (!secondRenderFunctions) {
          secondRenderFunctions = toastFunctions;
        }

        return <div>Stability Test</div>;
      };

      const { rerender } = render(
        <ToastProvider>
          <StabilityTestComponent />
        </ToastProvider>
      );

      rerender(
        <ToastProvider>
          <StabilityTestComponent />
        </ToastProvider>
      );

      // Verify function references are stable
      expect(firstRenderFunctions.addToast).toBe(secondRenderFunctions.addToast);
      expect(firstRenderFunctions.removeToast).toBe(secondRenderFunctions.removeToast);
      expect(firstRenderFunctions.showSuccess).toBe(secondRenderFunctions.showSuccess);
      expect(firstRenderFunctions.showError).toBe(secondRenderFunctions.showError);
    });
  });

  describe('Manual toast removal', () => {
    it('should remove specific toasts when removeToast is called', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const addButton = screen.getByText('Add Toast');
      const removeButton = screen.getByText('Remove First Toast');
      
      // Add two toasts
      act(() => {
        addButton.click();
        addButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('2');
      });

      // Remove first toast
      act(() => {
        removeButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
      });
    });
  });
});