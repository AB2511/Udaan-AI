import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import InterviewResults from './InterviewResults';

// Mock the interview service
vi.mock('../../services/interviewService', () => ({
  interviewService: {
    getInterviewFeedback: vi.fn().mockResolvedValue({
      success: true,
      data: {
        sessionId: 'test-123',
        overallScore: 85,
        feedback: {
          overall: 'Great job!',
          strengths: ['Good communication'],
          improvementAreas: []
        }
      }
    }),
  }
}));

describe('InterviewResults - Simple Test', () => {
  const mockProps = {
    results: { sessionId: 'test-123', overallScore: 85 },
    sessionData: { title: 'Test Interview', sessionType: 'technical' },
    onRestart: vi.fn(),
    onClose: vi.fn()
  };

  it('renders without crashing', () => {
    render(<InterviewResults {...mockProps} />);
    expect(screen.getByText('Loading detailed feedback...')).toBeInTheDocument();
  });
});