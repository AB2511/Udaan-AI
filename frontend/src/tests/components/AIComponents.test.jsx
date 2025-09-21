/**
 * Frontend Component Tests for AI Feature Interfaces
 * Tests all AI-related React components with comprehensive scenarios
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';

// Import components to test
import ResumeUpload from '../../components/resume/ResumeUpload';
import ResumeAnalysisResults from '../../components/resume/ResumeAnalysisResults';
import AssessmentSelection from '../../components/assessment/AssessmentSelection';
import AssessmentInterface from '../../components/assessment/AssessmentInterface';
import InterviewSetup from '../../components/interview/InterviewSetup';
import InterviewQuestionInterface from '../../components/interview/InterviewQuestionInterface';
import InterviewResults from '../../components/interview/InterviewResults';
import AIStatusIndicator from '../../components/common/AIStatusIndicator';
import AIErrorBoundary from '../../components/common/AIErrorBoundary';

// Mock services
vi.mock('../../services/resumeService', () => ({
  analyzeResume: vi.fn(),
  uploadResume: vi.fn()
}));

vi.mock('../../services/assessmentService', () => ({
  startAssessment: vi.fn(),
  submitAssessment: vi.fn(),
  getQuestions: vi.fn()
}));

vi.mock('../../services/interviewService', () => ({
  startInterview: vi.fn(),
  submitAnswers: vi.fn(),
  getFeedback: vi.fn()
}));

vi.mock('../../services/aiStatusService', () => ({
  getStatus: vi.fn(),
  testConnection: vi.fn()
}));

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ToastProvider>
      {children}
    </ToastProvider>
  </BrowserRouter>
);

describe('AI Components Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ResumeUpload Component', () => {
    test('should render upload interface correctly', () => {
      render(
        <TestWrapper>
          <ResumeUpload onAnalysisComplete={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByText(/upload.*resume/i)).toBeInTheDocument();
      expect(screen.getByText(/drag.*drop/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /browse/i })).toBeInTheDocument();
    });

    test('should handle file selection and validation', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['mock pdf content'], 'resume.pdf', {
        type: 'application/pdf'
      });

      render(
        <TestWrapper>
          <ResumeUpload onAnalysisComplete={vi.fn()} />
        </TestWrapper>
      );

      const fileInput = screen.getByLabelText(/upload.*resume/i);
      await user.upload(fileInput, mockFile);

      expect(screen.getByText('resume.pdf')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
    });

    test('should reject invalid file types', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['mock content'], 'document.txt', {
        type: 'text/plain'
      });

      render(
        <TestWrapper>
          <ResumeUpload onAnalysisComplete={vi.fn()} />
        </TestWrapper>
      );

      const fileInput = screen.getByLabelText(/upload.*resume/i);
      await user.upload(fileInput, mockFile);

      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    });

    test('should reject files that are too large', async () => {
      const user = userEvent.setup();
      const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf'
      });

      render(
        <TestWrapper>
          <ResumeUpload onAnalysisComplete={vi.fn()} />
        </TestWrapper>
      );

      const fileInput = screen.getByLabelText(/upload.*resume/i);
      await user.upload(fileInput, largeFile);

      expect(screen.getByText(/file too large/i)).toBeInTheDocument();
    });

    test('should show upload progress during analysis', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['mock pdf content'], 'resume.pdf', {
        type: 'application/pdf'
      });

      const { analyzeResume } = await import('../../services/resumeService');
      analyzeResume.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(
        <TestWrapper>
          <ResumeUpload onAnalysisComplete={vi.fn()} />
        </TestWrapper>
      );

      const fileInput = screen.getByLabelText(/upload.*resume/i);
      await user.upload(fileInput, mockFile);

      const analyzeButton = screen.getByRole('button', { name: /analyze/i });
      await user.click(analyzeButton);

      expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('should handle analysis errors gracefully', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['mock pdf content'], 'resume.pdf', {
        type: 'application/pdf'
      });

      const { analyzeResume } = await import('../../services/resumeService');
      analyzeResume.mockRejectedValue(new Error('Analysis failed'));

      render(
        <TestWrapper>
          <ResumeUpload onAnalysisComplete={vi.fn()} />
        </TestWrapper>
      );

      const fileInput = screen.getByLabelText(/upload.*resume/i);
      await user.upload(fileInput, mockFile);

      const analyzeButton = screen.getByRole('button', { name: /analyze/i });
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/analysis failed/i)).toBeInTheDocument();
      });
    });

    test('should support drag and drop functionality', async () => {
      const mockFile = new File(['mock pdf content'], 'resume.pdf', {
        type: 'application/pdf'
      });

      render(
        <TestWrapper>
          <ResumeUpload onAnalysisComplete={vi.fn()} />
        </TestWrapper>
      );

      const dropZone = screen.getByText(/drag.*drop/i).closest('div');
      
      fireEvent.dragEnter(dropZone);
      expect(dropZone).toHaveClass('drag-over');

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [mockFile]
        }
      });

      await waitFor(() => {
        expect(screen.getByText('resume.pdf')).toBeInTheDocument();
      });
    });
  });

  describe('ResumeAnalysisResults Component', () => {
    const mockAnalysis = {
      identifiedSkills: ['JavaScript', 'React', 'Node.js'],
      skillGaps: ['Python', 'Machine Learning', 'Docker'],
      careerPath: [
        {
          step: 'Learn Python',
          description: 'Start with Python basics for backend development',
          resources: [
            {
              title: 'Python Tutorial',
              url: 'https://example.com/python',
              type: 'course'
            }
          ],
          estimatedTime: '2-3 months',
          priority: 'high'
        }
      ],
      overallScore: 75,
      recommendations: 'Focus on backend development and cloud technologies'
    };

    test('should display analysis results correctly', () => {
      render(
        <TestWrapper>
          <ResumeAnalysisResults analysis={mockAnalysis} />
        </TestWrapper>
      );

      expect(screen.getByText(/overall score/i)).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('Python')).toBeInTheDocument();
      expect(screen.getByText('Learn Python')).toBeInTheDocument();
    });

    test('should categorize skills properly', () => {
      render(
        <TestWrapper>
          <ResumeAnalysisResults analysis={mockAnalysis} />
        </TestWrapper>
      );

      expect(screen.getByText(/identified skills/i)).toBeInTheDocument();
      expect(screen.getByText(/skill gaps/i)).toBeInTheDocument();
      
      // Check that skills are displayed in correct sections
      const skillsSection = screen.getByText(/identified skills/i).closest('div');
      const gapsSection = screen.getByText(/skill gaps/i).closest('div');
      
      expect(skillsSection).toHaveTextContent('JavaScript');
      expect(gapsSection).toHaveTextContent('Python');
    });

    test('should display career path with resources', () => {
      render(
        <TestWrapper>
          <ResumeAnalysisResults analysis={mockAnalysis} />
        </TestWrapper>
      );

      expect(screen.getByText(/career path/i)).toBeInTheDocument();
      expect(screen.getByText('Learn Python')).toBeInTheDocument();
      expect(screen.getByText(/2-3 months/i)).toBeInTheDocument();
      
      const resourceLink = screen.getByRole('link', { name: /python tutorial/i });
      expect(resourceLink).toHaveAttribute('href', 'https://example.com/python');
    });

    test('should handle empty analysis gracefully', () => {
      const emptyAnalysis = {
        identifiedSkills: [],
        skillGaps: [],
        careerPath: [],
        overallScore: 0,
        recommendations: ''
      };

      render(
        <TestWrapper>
          <ResumeAnalysisResults analysis={emptyAnalysis} />
        </TestWrapper>
      );

      expect(screen.getByText(/no skills identified/i)).toBeInTheDocument();
      expect(screen.getByText(/no gaps identified/i)).toBeInTheDocument();
    });

    test('should show priority indicators for career path steps', () => {
      render(
        <TestWrapper>
          <ResumeAnalysisResults analysis={mockAnalysis} />
        </TestWrapper>
      );

      const highPriorityStep = screen.getByText('Learn Python').closest('div');
      expect(highPriorityStep).toHaveClass('priority-high');
    });
  });

  describe('AssessmentSelection Component', () => {
    test('should render domain selection options', () => {
      render(
        <TestWrapper>
          <AssessmentSelection onStartAssessment={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByText(/technical/i)).toBeInTheDocument();
      expect(screen.getByText(/personality/i)).toBeInTheDocument();
      expect(screen.getByText(/hr/i)).toBeInTheDocument();
    });

    test('should allow difficulty selection', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AssessmentSelection onStartAssessment={vi.fn()} />
        </TestWrapper>
      );

      const difficultySelect = screen.getByLabelText(/difficulty/i);
      await user.selectOptions(difficultySelect, 'hard');

      expect(screen.getByDisplayValue('hard')).toBeInTheDocument();
    });

    test('should validate selection before starting', async () => {
      const user = userEvent.setup();
      const mockStartAssessment = vi.fn();

      render(
        <TestWrapper>
          <AssessmentSelection onStartAssessment={mockStartAssessment} />
        </TestWrapper>
      );

      const startButton = screen.getByRole('button', { name: /start assessment/i });
      await user.click(startButton);

      expect(screen.getByText(/please select/i)).toBeInTheDocument();
      expect(mockStartAssessment).not.toHaveBeenCalled();
    });

    test('should start assessment with valid selection', async () => {
      const user = userEvent.setup();
      const mockStartAssessment = vi.fn();

      render(
        <TestWrapper>
          <AssessmentSelection onStartAssessment={mockStartAssessment} />
        </TestWrapper>
      );

      // Select domain
      const technicalOption = screen.getByLabelText(/technical/i);
      await user.click(technicalOption);

      // Select difficulty
      const difficultySelect = screen.getByLabelText(/difficulty/i);
      await user.selectOptions(difficultySelect, 'medium');

      // Start assessment
      const startButton = screen.getByRole('button', { name: /start assessment/i });
      await user.click(startButton);

      expect(mockStartAssessment).toHaveBeenCalledWith({
        domain: 'technical',
        difficulty: 'medium',
        questionCount: expect.any(Number)
      });
    });

    test('should show assessment preview information', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AssessmentSelection onStartAssessment={vi.fn()} />
        </TestWrapper>
      );

      const technicalOption = screen.getByLabelText(/technical/i);
      await user.click(technicalOption);

      expect(screen.getByText(/estimated time/i)).toBeInTheDocument();
      expect(screen.getByText(/question count/i)).toBeInTheDocument();
    });
  });

  describe('AssessmentInterface Component', () => {
    const mockQuestions = [
      {
        question: 'What is JavaScript?',
        options: ['A programming language', 'A framework', 'A database', 'An operating system'],
        correctAnswer: 'A programming language'
      },
      {
        question: 'What is React?',
        options: ['A library', 'A language', 'A database', 'A server'],
        correctAnswer: 'A library'
      }
    ];

    test('should display current question and options', () => {
      render(
        <TestWrapper>
          <AssessmentInterface 
            questions={mockQuestions}
            onComplete={vi.fn()}
            sessionId="test-session"
          />
        </TestWrapper>
      );

      expect(screen.getByText('What is JavaScript?')).toBeInTheDocument();
      expect(screen.getByText('A programming language')).toBeInTheDocument();
      expect(screen.getByText('A framework')).toBeInTheDocument();
    });

    test('should track progress through questions', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AssessmentInterface 
            questions={mockQuestions}
            onComplete={vi.fn()}
            sessionId="test-session"
          />
        </TestWrapper>
      );

      expect(screen.getByText('1 of 2')).toBeInTheDocument();

      // Answer first question
      const firstOption = screen.getByLabelText('A programming language');
      await user.click(firstOption);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      expect(screen.getByText('What is React?')).toBeInTheDocument();
      expect(screen.getByText('2 of 2')).toBeInTheDocument();
    });

    test('should implement timer functionality', async () => {
      vi.useFakeTimers();

      render(
        <TestWrapper>
          <AssessmentInterface 
            questions={mockQuestions}
            onComplete={vi.fn()}
            sessionId="test-session"
            timeLimit={60}
          />
        </TestWrapper>
      );

      expect(screen.getByText(/60/)).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(30000); // 30 seconds
      });

      expect(screen.getByText(/30/)).toBeInTheDocument();

      vi.useRealTimers();
    });

    test('should auto-submit when timer expires', async () => {
      vi.useFakeTimers();
      const mockOnComplete = vi.fn();

      render(
        <TestWrapper>
          <AssessmentInterface 
            questions={mockQuestions}
            onComplete={mockOnComplete}
            sessionId="test-session"
            timeLimit={5}
          />
        </TestWrapper>
      );

      act(() => {
        vi.advanceTimersByTime(6000); // 6 seconds
      });

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });

      vi.useRealTimers();
    });

    test('should allow navigation between questions', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AssessmentInterface 
            questions={mockQuestions}
            onComplete={vi.fn()}
            sessionId="test-session"
            allowNavigation={true}
          />
        </TestWrapper>
      );

      // Answer first question and go to next
      const firstOption = screen.getByLabelText('A programming language');
      await user.click(firstOption);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Go back to previous question
      const prevButton = screen.getByRole('button', { name: /previous/i });
      await user.click(prevButton);

      expect(screen.getByText('What is JavaScript?')).toBeInTheDocument();
      expect(screen.getByLabelText('A programming language')).toBeChecked();
    });

    test('should complete assessment and show results', async () => {
      const user = userEvent.setup();
      const mockOnComplete = vi.fn();

      render(
        <TestWrapper>
          <AssessmentInterface 
            questions={mockQuestions}
            onComplete={mockOnComplete}
            sessionId="test-session"
          />
        </TestWrapper>
      );

      // Answer all questions
      const firstOption = screen.getByLabelText('A programming language');
      await user.click(firstOption);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      const secondOption = screen.getByLabelText('A library');
      await user.click(secondOption);

      const finishButton = screen.getByRole('button', { name: /finish/i });
      await user.click(finishButton);

      expect(mockOnComplete).toHaveBeenCalledWith({
        answers: expect.any(Array),
        timeSpent: expect.any(Number)
      });
    });
  });

  describe('InterviewSetup Component', () => {
    test('should render role and experience selection', () => {
      render(
        <TestWrapper>
          <InterviewSetup onStartInterview={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/experience/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start interview/i })).toBeInTheDocument();
    });

    test('should validate inputs before starting', async () => {
      const user = userEvent.setup();
      const mockStartInterview = vi.fn();

      render(
        <TestWrapper>
          <InterviewSetup onStartInterview={mockStartInterview} />
        </TestWrapper>
      );

      const startButton = screen.getByRole('button', { name: /start interview/i });
      await user.click(startButton);

      expect(screen.getByText(/please enter/i)).toBeInTheDocument();
      expect(mockStartInterview).not.toHaveBeenCalled();
    });

    test('should start interview with valid inputs', async () => {
      const user = userEvent.setup();
      const mockStartInterview = vi.fn();

      render(
        <TestWrapper>
          <InterviewSetup onStartInterview={mockStartInterview} />
        </TestWrapper>
      );

      const roleInput = screen.getByLabelText(/role/i);
      await user.type(roleInput, 'Software Developer');

      const experienceSelect = screen.getByLabelText(/experience/i);
      await user.selectOptions(experienceSelect, 'entry');

      const startButton = screen.getByRole('button', { name: /start interview/i });
      await user.click(startButton);

      expect(mockStartInterview).toHaveBeenCalledWith({
        role: 'Software Developer',
        experience: 'entry',
        questionCount: expect.any(Number)
      });
    });

    test('should show interview preview information', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <InterviewSetup onStartInterview={vi.fn()} />
        </TestWrapper>
      );

      const roleInput = screen.getByLabelText(/role/i);
      await user.type(roleInput, 'Software Developer');

      expect(screen.getByText(/estimated duration/i)).toBeInTheDocument();
      expect(screen.getByText(/question types/i)).toBeInTheDocument();
    });
  });

  describe('InterviewQuestionInterface Component', () => {
    const mockQuestions = [
      {
        question: 'Tell me about yourself',
        type: 'behavioral',
        expectedDuration: '2-3 minutes'
      },
      {
        question: 'What is your greatest strength?',
        type: 'behavioral',
        expectedDuration: '2-3 minutes'
      }
    ];

    test('should display current question with timer', () => {
      render(
        <TestWrapper>
          <InterviewQuestionInterface 
            questions={mockQuestions}
            onComplete={vi.fn()}
            sessionId="test-session"
          />
        </TestWrapper>
      );

      expect(screen.getByText('Tell me about yourself')).toBeInTheDocument();
      expect(screen.getByText(/2-3 minutes/i)).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    test('should allow answer input and navigation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <InterviewQuestionInterface 
            questions={mockQuestions}
            onComplete={vi.fn()}
            sessionId="test-session"
          />
        </TestWrapper>
      );

      const answerInput = screen.getByRole('textbox');
      await user.type(answerInput, 'I am a passionate developer...');

      expect(answerInput).toHaveValue('I am a passionate developer...');

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      expect(screen.getByText('What is your greatest strength?')).toBeInTheDocument();
    });

    test('should implement question timer', async () => {
      vi.useFakeTimers();

      render(
        <TestWrapper>
          <InterviewQuestionInterface 
            questions={mockQuestions}
            onComplete={vi.fn()}
            sessionId="test-session"
            questionTimeLimit={180}
          />
        </TestWrapper>
      );

      expect(screen.getByText(/3:00/)).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(60000); // 1 minute
      });

      expect(screen.getByText(/2:00/)).toBeInTheDocument();

      vi.useRealTimers();
    });

    test('should auto-advance when question timer expires', async () => {
      vi.useFakeTimers();

      render(
        <TestWrapper>
          <InterviewQuestionInterface 
            questions={mockQuestions}
            onComplete={vi.fn()}
            sessionId="test-session"
            questionTimeLimit={5}
          />
        </TestWrapper>
      );

      act(() => {
        vi.advanceTimersByTime(6000); // 6 seconds
      });

      await waitFor(() => {
        expect(screen.getByText('What is your greatest strength?')).toBeInTheDocument();
      });

      vi.useRealTimers();
    });

    test('should complete interview and submit answers', async () => {
      const user = userEvent.setup();
      const mockOnComplete = vi.fn();

      render(
        <TestWrapper>
          <InterviewQuestionInterface 
            questions={mockQuestions}
            onComplete={mockOnComplete}
            sessionId="test-session"
          />
        </TestWrapper>
      );

      // Answer first question
      const answerInput = screen.getByRole('textbox');
      await user.type(answerInput, 'First answer');

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Answer second question
      const secondAnswerInput = screen.getByRole('textbox');
      await user.type(secondAnswerInput, 'Second answer');

      const finishButton = screen.getByRole('button', { name: /finish/i });
      await user.click(finishButton);

      expect(mockOnComplete).toHaveBeenCalledWith({
        answers: expect.arrayContaining([
          expect.objectContaining({ answer: 'First answer' }),
          expect.objectContaining({ answer: 'Second answer' })
        ])
      });
    });
  });

  describe('InterviewResults Component', () => {
    const mockEvaluation = {
      overallScore: 75,
      individualScores: [
        {
          questionIndex: 0,
          score: 80,
          feedback: 'Good answer with specific examples',
          strengths: ['Clear communication', 'Specific examples'],
          improvements: ['More technical depth', 'Structure better']
        }
      ],
      summary: {
        strengths: ['Communication skills', 'Problem-solving approach'],
        areasForImprovement: ['Technical knowledge', 'Leadership examples'],
        recommendations: ['Study system design', 'Practice behavioral questions'],
        nextSteps: ['Take online courses', 'Practice with peers']
      },
      competencyAssessment: {
        technical: 70,
        communication: 85,
        problemSolving: 75,
        leadership: 60
      }
    };

    test('should display overall score and summary', () => {
      render(
        <TestWrapper>
          <InterviewResults evaluation={mockEvaluation} />
        </TestWrapper>
      );

      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText(/overall score/i)).toBeInTheDocument();
      expect(screen.getByText('Communication skills')).toBeInTheDocument();
      expect(screen.getByText('Technical knowledge')).toBeInTheDocument();
    });

    test('should display competency breakdown', () => {
      render(
        <TestWrapper>
          <InterviewResults evaluation={mockEvaluation} />
        </TestWrapper>
      );

      expect(screen.getByText(/technical/i)).toBeInTheDocument();
      expect(screen.getByText(/communication/i)).toBeInTheDocument();
      expect(screen.getByText(/problem solving/i)).toBeInTheDocument();
      expect(screen.getByText(/leadership/i)).toBeInTheDocument();

      expect(screen.getByText('70')).toBeInTheDocument(); // Technical score
      expect(screen.getByText('85')).toBeInTheDocument(); // Communication score
    });

    test('should display individual question feedback', () => {
      render(
        <TestWrapper>
          <InterviewResults evaluation={mockEvaluation} />
        </TestWrapper>
      );

      expect(screen.getByText('Good answer with specific examples')).toBeInTheDocument();
      expect(screen.getByText('Clear communication')).toBeInTheDocument();
      expect(screen.getByText('More technical depth')).toBeInTheDocument();
    });

    test('should display recommendations and next steps', () => {
      render(
        <TestWrapper>
          <InterviewResults evaluation={mockEvaluation} />
        </TestWrapper>
      );

      expect(screen.getByText(/recommendations/i)).toBeInTheDocument();
      expect(screen.getByText('Study system design')).toBeInTheDocument();
      expect(screen.getByText(/next steps/i)).toBeInTheDocument();
      expect(screen.getByText('Take online courses')).toBeInTheDocument();
    });

    test('should handle missing evaluation data gracefully', () => {
      const incompleteEvaluation = {
        overallScore: 60,
        individualScores: [],
        summary: {},
        competencyAssessment: {}
      };

      render(
        <TestWrapper>
          <InterviewResults evaluation={incompleteEvaluation} />
        </TestWrapper>
      );

      expect(screen.getByText('60')).toBeInTheDocument();
      expect(screen.getByText(/no detailed feedback/i)).toBeInTheDocument();
    });
  });

  describe('AIStatusIndicator Component', () => {
    test('should show healthy status', () => {
      const mockStatus = {
        ready: true,
        overallHealth: 'healthy',
        rateLimiting: { remainingRequests: 95 }
      };

      render(
        <TestWrapper>
          <AIStatusIndicator status={mockStatus} />
        </TestWrapper>
      );

      expect(screen.getByText(/ai service.*healthy/i)).toBeInTheDocument();
      expect(screen.getByText(/95.*requests/i)).toBeInTheDocument();
    });

    test('should show degraded status with warning', () => {
      const mockStatus = {
        ready: true,
        overallHealth: 'degraded',
        rateLimiting: { remainingRequests: 10 }
      };

      render(
        <TestWrapper>
          <AIStatusIndicator status={mockStatus} />
        </TestWrapper>
      );

      expect(screen.getByText(/degraded/i)).toBeInTheDocument();
      expect(screen.getByText(/10.*requests/i)).toBeInTheDocument();
    });

    test('should show unhealthy status with error', () => {
      const mockStatus = {
        ready: false,
        overallHealth: 'unhealthy',
        error: 'Connection failed'
      };

      render(
        <TestWrapper>
          <AIStatusIndicator status={mockStatus} />
        </TestWrapper>
      );

      expect(screen.getByText(/unhealthy/i)).toBeInTheDocument();
      expect(screen.getByText(/connection failed/i)).toBeInTheDocument();
    });

    test('should handle loading state', () => {
      render(
        <TestWrapper>
          <AIStatusIndicator status={null} loading={true} />
        </TestWrapper>
      );

      expect(screen.getByText(/checking.*status/i)).toBeInTheDocument();
    });
  });

  describe('AIErrorBoundary Component', () => {
    const ThrowError = ({ shouldThrow }) => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>No error</div>;
    };

    test('should render children when no error', () => {
      render(
        <TestWrapper>
          <AIErrorBoundary>
            <ThrowError shouldThrow={false} />
          </AIErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    test('should catch and display error with fallback UI', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestWrapper>
          <AIErrorBoundary>
            <ThrowError shouldThrow={true} />
          </AIErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/ai feature.*unavailable/i)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    test('should provide retry functionality', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { rerender } = render(
        <TestWrapper>
          <AIErrorBoundary>
            <ThrowError shouldThrow={true} />
          </AIErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      // Rerender with no error
      rerender(
        <TestWrapper>
          <AIErrorBoundary>
            <ThrowError shouldThrow={false} />
          </AIErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    test('should show fallback options when AI is unavailable', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestWrapper>
          <AIErrorBoundary fallbackOptions={['Manual assessment', 'Offline resources']}>
            <ThrowError shouldThrow={true} />
          </AIErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('Manual assessment')).toBeInTheDocument();
      expect(screen.getByText('Offline resources')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });
});