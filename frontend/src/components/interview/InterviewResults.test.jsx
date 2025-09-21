import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import InterviewResults from './InterviewResults';

// Mock the interview service
vi.mock('../../services/interviewService', () => ({
  interviewService: {
    getInterviewFeedback: vi.fn(),
  }
}));

const { interviewService } = await import('../../services/interviewService');

describe('InterviewResults', () => {
  const mockResults = {
    sessionId: 'test-session-123',
    overallScore: 85,
    completed: true
  };

  const mockSessionData = {
    title: 'Software Developer Interview',
    sessionType: 'technical',
    role: 'Software Developer',
    questions: [
      { questionId: '1', question: 'Test question 1' },
      { questionId: '2', question: 'Test question 2' }
    ]
  };

  const mockDetailedFeedback = {
    sessionId: 'test-session-123',
    title: 'Software Developer Interview',
    sessionType: 'technical',
    targetRole: 'Software Developer',
    overallScore: 85,
    feedback: {
      communication: { score: 8, feedback: 'Good communication skills' },
      technicalAccuracy: { score: 9, feedback: 'Strong technical knowledge' },
      confidence: { score: 7, feedback: 'Shows confidence in answers' },
      problemSolving: { score: 8, feedback: 'Good problem-solving approach' },
      overall: 'Great performance overall with room for improvement in confidence.',
      strengths: ['Clear communication', 'Technical expertise', 'Problem-solving'],
      improvementAreas: [
        { area: 'Confidence', suggestion: 'Practice more mock interviews', priority: 'medium' }
      ],
      nextSteps: ['Practice behavioral questions', 'Work on presentation skills']
    },
    questionFeedback: [
      {
        questionId: '1',
        question: 'Explain the concept of closures in JavaScript',
        category: 'technical',
        userAnswer: 'A closure is a function that has access to variables in its outer scope...',
        timeSpent: 120,
        feedback: {
          content: 'Good explanation with clear examples',
          strengths: ['Clear explanation', 'Good examples'],
          improvements: ['Could mention more use cases'],
          score: 8
        }
      }
    ],
    sessionInfo: {
      duration: 1800,
      completedAt: '2024-01-15T10:30:00Z',
      progress: {
        totalQuestions: 2,
        answeredQuestions: 2,
        percentage: 100
      }
    }
  };

  const mockProps = {
    results: mockResults,
    sessionData: mockSessionData,
    onRestart: vi.fn(),
    onClose: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    interviewService.getInterviewFeedback.mockImplementation(() => new Promise(() => {}));
    
    render(<InterviewResults {...mockProps} />);
    
    expect(screen.getByText('Loading detailed feedback...')).toBeInTheDocument();
  });

  it('renders interview results with overall score', async () => {
    interviewService.getInterviewFeedback.mockResolvedValue({
      success: true,
      data: mockDetailedFeedback
    });

    render(<InterviewResults {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Interview Complete! 🎉')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('Overall Score')).toBeInTheDocument();
    });
  });

  it('displays session information correctly', async () => {
    interviewService.getInterviewFeedback.mockResolvedValue({
      success: true,
      data: mockDetailedFeedback
    });

    render(<InterviewResults {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Software Developer Interview')).toBeInTheDocument();
      expect(screen.getByText('Technical')).toBeInTheDocument();
      expect(screen.getByText('Software Developer')).toBeInTheDocument();
    });
  });

  it('switches between tabs correctly', async () => {
    interviewService.getInterviewFeedback.mockResolvedValue({
      success: true,
      data: mockDetailedFeedback
    });

    render(<InterviewResults {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Strengths')).toBeInTheDocument();
    });

    // Click on competencies tab
    fireEvent.click(screen.getByText('Skills Assessment'));
    
    await waitFor(() => {
      expect(screen.getByText('Skills Assessment Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Communication')).toBeInTheDocument();
      expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    });

    // Click on questions tab
    fireEvent.click(screen.getByText('questions'));
    
    await waitFor(() => {
      expect(screen.getByText('Question-by-Question Feedback')).toBeInTheDocument();
    });

    // Click on recommendations tab
    fireEvent.click(screen.getByText('recommendations'));
    
    await waitFor(() => {
      expect(screen.getByText('Personalized Recommendations')).toBeInTheDocument();
    });
  });

  it('displays competency scores with correct colors', async () => {
    interviewService.getInterviewFeedback.mockResolvedValue({
      success: true,
      data: mockDetailedFeedback
    });

    render(<InterviewResults {...mockProps} />);

    // Switch to competencies tab
    await waitFor(() => {
      fireEvent.click(screen.getByText('Skills Assessment'));
    });

    await waitFor(() => {
      expect(screen.getByText('80%')).toBeInTheDocument(); // Communication score
      expect(screen.getByText('90%')).toBeInTheDocument(); // Technical score
      expect(screen.getByText('70%')).toBeInTheDocument(); // Confidence score
      expect(screen.getByText('80%')).toBeInTheDocument(); // Problem solving score
    });
  });

  it('displays question feedback correctly', async () => {
    interviewService.getInterviewFeedback.mockResolvedValue({
      success: true,
      data: mockDetailedFeedback
    });

    render(<InterviewResults {...mockProps} />);

    // Switch to questions tab
    await waitFor(() => {
      fireEvent.click(screen.getByText('questions'));
    });

    await waitFor(() => {
      expect(screen.getByText('Explain the concept of closures in JavaScript')).toBeInTheDocument();
      expect(screen.getByText('A closure is a function that has access to variables in its outer scope...')).toBeInTheDocument();
      expect(screen.getByText('Good explanation with clear examples')).toBeInTheDocument();
      expect(screen.getByText('Clear explanation')).toBeInTheDocument();
      expect(screen.getByText('Could mention more use cases')).toBeInTheDocument();
    });
  });

  it('displays recommendations and next steps', async () => {
    interviewService.getInterviewFeedback.mockResolvedValue({
      success: true,
      data: mockDetailedFeedback
    });

    render(<InterviewResults {...mockProps} />);

    // Switch to recommendations tab
    await waitFor(() => {
      fireEvent.click(screen.getByText('recommendations'));
    });

    await waitFor(() => {
      expect(screen.getByText('Next Steps')).toBeInTheDocument();
      expect(screen.getByText('Practice behavioral questions')).toBeInTheDocument();
      expect(screen.getByText('Work on presentation skills')).toBeInTheDocument();
      expect(screen.getByText('Focus Areas for Improvement')).toBeInTheDocument();
      expect(screen.getByText('Confidence')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    interviewService.getInterviewFeedback.mockRejectedValue(new Error('API Error'));

    render(<InterviewResults {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Error Loading Results')).toBeInTheDocument();
      expect(screen.getByText('Failed to load detailed feedback')).toBeInTheDocument();
    });
  });

  it('calls onRestart when restart button is clicked', async () => {
    interviewService.getInterviewFeedback.mockResolvedValue({
      success: true,
      data: mockDetailedFeedback
    });

    render(<InterviewResults {...mockProps} />);

    await waitFor(() => {
      const restartButton = screen.getByText('Take Another Interview');
      fireEvent.click(restartButton);
      expect(mockProps.onRestart).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onClose when close button is clicked', async () => {
    interviewService.getInterviewFeedback.mockResolvedValue({
      success: true,
      data: mockDetailedFeedback
    });

    render(<InterviewResults {...mockProps} />);

    await waitFor(() => {
      const closeButton = screen.getByText('Back to Dashboard');
      fireEvent.click(closeButton);
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('formats duration correctly', async () => {
    interviewService.getInterviewFeedback.mockResolvedValue({
      success: true,
      data: mockDetailedFeedback
    });

    render(<InterviewResults {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Duration: 30m 0s')).toBeInTheDocument();
    });
  });

  it('displays fallback content when no detailed feedback is available', async () => {
    interviewService.getInterviewFeedback.mockResolvedValue({
      success: true,
      data: {
        ...mockDetailedFeedback,
        questionFeedback: []
      }
    });

    render(<InterviewResults {...mockProps} />);

    // Switch to questions tab
    await waitFor(() => {
      fireEvent.click(screen.getByText('questions'));
    });

    await waitFor(() => {
      expect(screen.getByText('No Question Feedback Available')).toBeInTheDocument();
    });
  });

  it('retries fetching feedback when try again button is clicked', async () => {
    interviewService.getInterviewFeedback
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValueOnce({
        success: true,
        data: mockDetailedFeedback
      });

    render(<InterviewResults {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Error Loading Results')).toBeInTheDocument();
    });

    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);

    await waitFor(() => {
      expect(screen.getByText('Interview Complete! 🎉')).toBeInTheDocument();
    });

    expect(interviewService.getInterviewFeedback).toHaveBeenCalledTimes(2);
  });
});