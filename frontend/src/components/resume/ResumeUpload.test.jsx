import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ResumeUpload from './ResumeUpload';
import { ToastProvider } from '../../context/ToastContext';

// Mock the resume service
vi.mock('../../services/resumeService', () => ({
  resumeService: {
    uploadResume: vi.fn()
  }
}));

// Mock the useToast hook
vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
    addToast: vi.fn(),
    removeToast: vi.fn(),
    toasts: []
  })
}));

const renderWithToast = (component) => {
  return render(component);
};

describe('ResumeUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders upload interface correctly', () => {
    renderWithToast(<ResumeUpload />);
    
    expect(screen.getByText('Upload Your Resume')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop your resume here, or click to browse files')).toBeInTheDocument();
    expect(screen.getByText('Choose File')).toBeInTheDocument();
    expect(screen.getByText('Supports PDF, DOC, and DOCX files up to 10MB')).toBeInTheDocument();
  });

  test('displays benefits section', () => {
    renderWithToast(<ResumeUpload />);
    
    expect(screen.getByText('AI-Powered Analysis')).toBeInTheDocument();
    expect(screen.getByText('Gap Identification')).toBeInTheDocument();
    expect(screen.getByText('Personalized Learning')).toBeInTheDocument();
  });

  test('handles file selection', async () => {
    renderWithToast(<ResumeUpload />);
    
    const fileInput = screen.getByRole('button', { name: /choose file/i });
    const file = new File(['test content'], 'test-resume.pdf', { type: 'application/pdf' });
    
    // Mock the file input
    const hiddenInput = document.querySelector('input[type="file"]');
    Object.defineProperty(hiddenInput, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(hiddenInput);
    
    await waitFor(() => {
      expect(screen.getByText('File Ready')).toBeInTheDocument();
      expect(screen.getByText('test-resume.pdf')).toBeInTheDocument();
    });
  });

  test('validates file type', async () => {
    renderWithToast(<ResumeUpload />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const hiddenInput = document.querySelector('input[type="file"]');
    
    Object.defineProperty(hiddenInput, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(hiddenInput);
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'Please upload a PDF or Word document (.pdf, .doc, .docx)',
        'error'
      );
    });
  });

  test('validates file size', async () => {
    renderWithToast(<ResumeUpload />);
    
    // Create a file larger than 10MB
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large-resume.pdf', { 
      type: 'application/pdf' 
    });
    
    const hiddenInput = document.querySelector('input[type="file"]');
    Object.defineProperty(hiddenInput, 'files', {
      value: [largeFile],
      writable: false,
    });
    
    fireEvent.change(hiddenInput);
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'File size must be less than 10MB',
        'error'
      );
    });
  });

  test('calls onUploadSuccess when upload succeeds', async () => {
    const mockOnUploadSuccess = vi.fn();
    const { resumeService } = await import('../../services/resumeService');
    
    resumeService.uploadResume.mockResolvedValue({
      success: true,
      file: { originalname: 'test-resume.pdf' }
    });
    
    renderWithToast(
      <ResumeUpload onUploadSuccess={mockOnUploadSuccess} />
    );
    
    const file = new File(['test content'], 'test-resume.pdf', { type: 'application/pdf' });
    const hiddenInput = document.querySelector('input[type="file"]');
    
    Object.defineProperty(hiddenInput, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(hiddenInput);
    
    await waitFor(() => {
      expect(screen.getByText('Upload & Analyze')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Upload & Analyze'));
    
    await waitFor(() => {
      expect(resumeService.uploadResume).toHaveBeenCalledWith(file);
      expect(mockOnUploadSuccess).toHaveBeenCalled();
    });
  });

  test('handles upload error', async () => {
    const mockOnUploadError = vi.fn();
    const { resumeService } = await import('../../services/resumeService');
    
    resumeService.uploadResume.mockRejectedValue(new Error('Upload failed'));
    
    renderWithToast(
      <ResumeUpload onUploadError={mockOnUploadError} />
    );
    
    const file = new File(['test content'], 'test-resume.pdf', { type: 'application/pdf' });
    const hiddenInput = document.querySelector('input[type="file"]');
    
    Object.defineProperty(hiddenInput, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(hiddenInput);
    
    await waitFor(() => {
      expect(screen.getByText('Upload & Analyze')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Upload & Analyze'));
    
    await waitFor(() => {
      expect(mockOnUploadError).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith(
        'Upload failed',
        'error'
      );
    });
  });
});