import { render, screen, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Toast from '../../components/Toast';

// Mock console methods to capture warnings and errors
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

describe('Toast Component', () => {
  let mockRemoveToast;
  let consoleErrors = [];
  let consoleWarnings = [];

  beforeEach(() => {
    mockRemoveToast = vi.fn();
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
    it('should not cause infinite render loops', async () => {
      const { rerender } = render(
        <Toast
          id={1}
          message="Test message"
          type="success"
          removeToast={mockRemoveToast}
        />
      );

      // Re-render multiple times to test for infinite loops
      for (let i = 0; i < 10; i++) {
        rerender(
          <Toast
            id={1}
            message={`Test message ${i}`}
            type="success"
            removeToast={mockRemoveToast}
          />
        );
      }

      // Check that no "Maximum update depth exceeded" errors occurred
      const hasMaxUpdateError = consoleErrors.some(error => 
        error.includes('Maximum update depth exceeded')
      );
      expect(hasMaxUpdateError).toBe(false);
    });
  });

  describe('Requirement 2.1: No duplicate key warnings', () => {
    it('should handle unique keys properly when rendered multiple times', () => {
      const { unmount } = render(
        <Toast
          id={Date.now() + Math.random()}
          message="Test message"
          type="success"
          removeToast={mockRemoveToast}
        />
      );

      unmount();

      render(
        <Toast
          id={Date.now() + Math.random()}
          message="Test message 2"
          type="error"
          removeToast={mockRemoveToast}
        />
      );

      // Check that no duplicate key warnings occurred
      const hasDuplicateKeyWarning = consoleWarnings.some(warning => 
        warning.includes('Encountered two children with the same key')
      );
      expect(hasDuplicateKeyWarning).toBe(false);
    });
  });

  describe('Requirement 3.1: Toast display functionality', () => {
    it('should display toast with correct message and type', () => {
      render(
        <Toast
          id={1}
          message="Success message"
          type="success"
          removeToast={mockRemoveToast}
        />
      );

      expect(screen.getByText('Success message')).toBeInTheDocument();
      
      // Check for success icon (checkmark)
      const successIcon = screen.getByRole('button').parentElement.querySelector('svg path[d*="M5 13l4 4L19 7"]');
      expect(successIcon).toBeInTheDocument();
    });

    it('should display different toast types correctly', () => {
      const types = ['success', 'error', 'warning', 'info'];
      
      types.forEach((type, index) => {
        const { unmount } = render(
          <Toast
            id={index}
            message={`${type} message`}
            type={type}
            removeToast={mockRemoveToast}
          />
        );
        
        expect(screen.getByText(`${type} message`)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Requirement 3.2: Auto-dismiss functionality', () => {
    it('should auto-dismiss after timeout using setTimeout', async () => {
      render(
        <Toast
          id={1}
          message="Auto-dismiss test"
          type="info"
          removeToast={mockRemoveToast}
        />
      );

      expect(screen.getByText('Auto-dismiss test')).toBeInTheDocument();

      // Fast-forward time by 5 seconds (default duration)
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Verify removeToast was called
      await waitFor(() => {
        expect(mockRemoveToast).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Requirement 3.4: Timeout cleanup', () => {
    it('should clean up timeouts on unmount', () => {
      const { unmount } = render(
        <Toast
          id={1}
          message="Cleanup test"
          type="info"
          removeToast={mockRemoveToast}
        />
      );

      // Unmount before timeout
      unmount();

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // removeToast should not be called after unmount
      expect(mockRemoveToast).not.toHaveBeenCalled();
    });

    it('should handle manual close properly', async () => {
      render(
        <Toast
          id={1}
          message="Manual close test"
          type="info"
          removeToast={mockRemoveToast}
        />
      );

      const closeButton = screen.getByRole('button');
      
      act(() => {
        closeButton.click();
      });

      // Fast-forward animation time
      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(mockRemoveToast).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Props validation', () => {
    it('should handle missing required props gracefully', () => {
      // Test missing id
      const { unmount: unmount1 } = render(
        <Toast
          message="Test"
          type="info"
          removeToast={mockRemoveToast}
        />
      );
      
      expect(consoleErrors.some(error => error.includes('id prop is required'))).toBe(true);
      unmount1();

      // Reset console errors
      consoleErrors = [];

      // Test missing message (should use default)
      const { unmount: unmount2 } = render(
        <Toast
          id={1}
          type="info"
          removeToast={mockRemoveToast}
        />
      );
      
      // Should not log error for message since it has default props
      expect(consoleErrors.some(error => error.includes('message prop is required'))).toBe(false);
      unmount2();

      // Reset console errors
      consoleErrors = [];

      // Test missing removeToast
      const { unmount: unmount3 } = render(
        <Toast
          id={1}
          message="Test"
          type="info"
        />
      );
      
      expect(consoleErrors.some(error => error.includes('removeToast prop must be a function'))).toBe(true);
      unmount3();
    });
  });
});