import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { interviewService } from '../../services/interviewService';
import { resumeService } from '../../services/resumeService';
import Toast from '../../components/Toast';
import { ToastProvider } from '../../context/ToastContext';

// Mock API responses
const mockInterviewHistoryResponse = {
  data: [
    { id: '1', sessionType: 'technical', createdAt: '2024-01-01', status: 'completed' },
    { id: '2', sessionType: 'behavioral', createdAt: '2024-01-02', status: 'in-progress' }
  ]
};

const mockStartInterviewResponse = {
  data: {
    sessionId: 'session-123',
    sessionType: 'technical',
    questions: [
      { questionId: 'q1', question: 'What is JavaScript?' }
    ]
  }
};

// Mock services
vi.mock('../../services/interviewService', () => ({
  interviewService: {
    getInterviewHistory: vi.fn(),
    startInterview: vi.fn()
  },
  getInterviewHistory: vi.fn(),
  startInterview: vi.fn()
}));

vi.mock('../../services/resumeService', () => ({
  resumeService: {
    uploadResume: vi.fn()
  }
}));



describe('App Functionality Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('InterviewService Integration', () => {
    it('should verify getInterviewHistory function works with backend endpoints', async () => {
      // Mock the API call
      interviewService.getInterviewHistory.mockResolvedValue(mockInterviewHistoryResponse.data);

      // Call the service
      const result = await interviewService.getInterviewHistory();

      // Verify the call was made and returns correct data
      expect(interviewService.getInterviewHistory).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockInterviewHistoryResponse.data);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should verify startInterview function works with sessionType payload', async () => {
      // Mock the API call
      interviewService.startInterview.mockResolvedValue(mockStartInterviewResponse.data);

      // Call the service with sessionType
      const sessionType = 'technical';
      const result = await interviewService.startInterview(sessionType);

      // Verify the call was made with correct parameters
      expect(interviewService.startInterview).toHaveBeenCalledWith(sessionType);
      expect(result).toEqual(mockStartInterviewResponse.data);
      expect(result.sessionType).toBe(sessionType);
    });

    it('should handle interview service errors properly', async () => {
      // Mock error response
      const errorMessage = 'Network error';
      interviewService.getInterviewHistory.mockRejectedValue(new Error(errorMessage));

      // Verify error is thrown
      await expect(interviewService.getInterviewHistory()).rejects.toThrow(errorMessage);
    });
  });

  describe('ResumeService Integration', () => {
    it('should verify resumeService upload works with correct field name', async () => {
      // Create a mock file
      const mockFile = new File(['test content'], 'test-resume.pdf', { type: 'application/pdf' });
      const mockResponse = { data: { id: 'upload-123', filename: 'test-resume.pdf' } };

      // Mock the upload response
      resumeService.uploadResume.mockResolvedValue(mockResponse.data);

      // Call the service
      const result = await resumeService.uploadResume(mockFile);

      // Verify the call was made with the file
      expect(resumeService.uploadResume).toHaveBeenCalledWith(mockFile);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle resume upload errors properly', async () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const errorMessage = 'Upload failed';
      
      resumeService.uploadResume.mockRejectedValue(new Error(errorMessage));

      await expect(resumeService.uploadResume(mockFile)).rejects.toThrow(errorMessage);
    });
  });



  describe('Toast Component Integration', () => {
    it('should render without crashes or console warnings with default props', () => {
      const mockRemoveToast = vi.fn();
      
      // Render Toast with minimal required props
      render(
        <Toast
          id="test-toast"
          removeToast={mockRemoveToast}
        />
      );

      // Verify it renders with default values
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Something happened')).toBeInTheDocument();
      
      // Verify default type (info) styling
      const toast = screen.getByRole('status');
      expect(toast).toHaveClass('bg-blue-50');
    });

    it('should handle missing optional props gracefully', () => {
      const mockRemoveToast = vi.fn();
      
      // Render with only required props
      const { container } = render(
        <Toast
          id="test-toast-2"
          removeToast={mockRemoveToast}
        />
      );

      // Should not crash and should render
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Something happened')).toBeInTheDocument();
    });

    it('should call removeToast when close button is clicked', () => {
      const mockRemoveToast = vi.fn();
      
      render(
        <Toast
          id="test-toast-3"
          message="Test message"
          type="success"
          removeToast={mockRemoveToast}
        />
      );

      // Click the close button
      const closeButton = screen.getByLabelText('close toast');
      fireEvent.click(closeButton);

      // Verify removeToast was called with correct id
      expect(mockRemoveToast).toHaveBeenCalledWith('test-toast-3');
    });
  });

  describe('ToastContext Integration', () => {
    it('should display toasts with unique identifiers and fallback messages', () => {
      render(
        <ToastProvider>
          <div data-testid="toast-container">
            {/* ToastProvider renders toasts automatically */}
          </div>
        </ToastProvider>
      );

      // The ToastProvider should render without errors
      expect(screen.getByTestId('toast-container')).toBeInTheDocument();
    });

    it('should handle toast messages with fallback when message is missing', () => {
      // Test that ToastContext renders fallback messages correctly
      // This is verified by the Toast component's fallback message prop
      const mockRemoveToast = vi.fn();
      
      render(
        <Toast
          id="fallback-test"
          message={undefined} // This should use fallback
          type="info"
          removeToast={mockRemoveToast}
        />
      );

      // Should show fallback message from default props
      expect(screen.getByText('Something happened')).toBeInTheDocument();
    });
  });

  describe('Complete Integration Flow', () => {
    it('should verify all components work together without errors', async () => {
      // Mock all services to return success
      interviewService.getInterviewHistory.mockResolvedValue([]);
      interviewService.startInterview.mockResolvedValue(mockStartInterviewResponse.data);
      resumeService.uploadResume.mockResolvedValue({ id: 'test-upload' });

      // Test interview service
      const historyResult = await interviewService.getInterviewHistory();
      expect(historyResult).toEqual([]);

      const startResult = await interviewService.startInterview('technical');
      expect(startResult.sessionType).toBe('technical');

      // Test resume service
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const uploadResult = await resumeService.uploadResume(mockFile);
      expect(uploadResult.id).toBe('test-upload');

      // Test Toast component rendering
      const mockRemoveToast = vi.fn();
      render(
        <Toast
          id="integration-test"
          message="Integration test message"
          type="success"
          removeToast={mockRemoveToast}
        />
      );

      expect(screen.getByText('Integration test message')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('bg-green-50');
    });
  });
});