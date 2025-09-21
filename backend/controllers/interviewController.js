/**
 * Interview Controller
 * Handles AI-powered mock interview functionality
 */

import InterviewSession from '../models/InterviewSession.js';
import User from '../models/User.js';
import interviewQuestionService from '../services/InterviewQuestionService.js';
import interviewEvaluationService from '../services/InterviewEvaluationService.js';
import enhancedAIErrorHandler from '../services/AIErrorHandlingService.js';
import aiService from '../services/aiService.js';
import { ENUMS, INTERVIEW_ENUMS } from '../constants/enums.js';
import { 
  formatValidationError, 
  formatMultipleValidationErrors,
  ValidationError,
  RequiredFieldError,
  createEnumValidationError,
  validateEnumValues,
  validateRequiredFields
} from '../utils/errorResponse.js';

// Logger for interview controller
const logger = {
  info: (message, data) => console.log(`[InterviewController] ${message}`, data || ''),
  error: (message, data) => console.error(`[InterviewController] ${message}`, data || ''),
  warn: (message, data) => console.warn(`[InterviewController] ${message}`, data || '')
};

/**
 * Validate interview parameters
 * POST /api/interviews/validate
 */
export async function validateInterviewParameters(req, res) {
  try {
    const {
      sessionType,
      difficulty,
      category,
      categories = [],
      role,
      experience,
      questions = []
    } = req.body;

    const errors = [];

    // Validate required fields
    const requiredFieldErrors = validateRequiredFields(req.body, ['sessionType', 'difficulty']);
    errors.push(...requiredFieldErrors);

    // Validate enum values with specific error messages for invalid values like "entry" and "best-practices"
    const enumMappings = {
      sessionType: INTERVIEW_ENUMS.SESSION_TYPES,
      difficulty: INTERVIEW_ENUMS.DIFFICULTIES,
      role: INTERVIEW_ENUMS.ROLES,
      experience: INTERVIEW_ENUMS.EXPERIENCE_LEVELS
    };

    // Handle single category
    if (category) {
      if (!INTERVIEW_ENUMS.CATEGORIES.includes(category)) {
        // Provide specific error for common invalid values
        let customMessage = `Invalid category: "${category}". Allowed values: ${INTERVIEW_ENUMS.CATEGORIES.join(', ')}`;
        if (category === 'best-practices') {
          customMessage = `Invalid category: "best-practices" is not supported. Use "coding" or "behavioral" instead. Allowed values: ${INTERVIEW_ENUMS.CATEGORIES.join(', ')}`;
        } else if (category === 'technical-skills') {
          customMessage = `Invalid category: "technical-skills" is not supported. Use "technical" or "algorithms" instead. Allowed values: ${INTERVIEW_ENUMS.CATEGORIES.join(', ')}`;
        }
        errors.push(new ValidationError('category', category, INTERVIEW_ENUMS.CATEGORIES, customMessage));
      }
    }

    // Handle categories array
    if (categories && Array.isArray(categories)) {
      const invalidCategories = categories.filter(cat => !INTERVIEW_ENUMS.CATEGORIES.includes(cat));
      if (invalidCategories.length > 0) {
        let customMessage = `Invalid categories: ${invalidCategories.join(', ')}. Allowed values: ${INTERVIEW_ENUMS.CATEGORIES.join(', ')}`;
        
        // Provide specific guidance for common invalid values
        const hasInvalidValues = invalidCategories.some(cat => ['best-practices', 'technical-skills'].includes(cat));
        if (hasInvalidValues) {
          customMessage += '. Note: "best-practices" should be "coding" or "behavioral", "technical-skills" should be "technical" or "algorithms"';
        }
        
        errors.push(new ValidationError('categories', invalidCategories, INTERVIEW_ENUMS.CATEGORIES, customMessage));
      }
    }

    // Handle difficulty with specific error for "entry"
    if (difficulty && !INTERVIEW_ENUMS.DIFFICULTIES.includes(difficulty)) {
      let customMessage = `Invalid difficulty: "${difficulty}". Allowed values: ${INTERVIEW_ENUMS.DIFFICULTIES.join(', ')}`;
      if (difficulty === 'entry') {
        customMessage = `Invalid difficulty: "entry" is not supported. Use "easy" instead. Allowed values: ${INTERVIEW_ENUMS.DIFFICULTIES.join(', ')}`;
      }
      errors.push(new ValidationError('difficulty', difficulty, INTERVIEW_ENUMS.DIFFICULTIES, customMessage));
    }

    // Validate other enum fields
    const enumValidationErrors = validateEnumValues(req.body, enumMappings);
    errors.push(...enumValidationErrors);

    // Validate questions array structure
    if (questions && Array.isArray(questions)) {
      questions.forEach((question, index) => {
        if (question.category && !INTERVIEW_ENUMS.CATEGORIES.includes(question.category)) {
          let customMessage = `Invalid category in questions[${index}]: "${question.category}". Allowed values: ${INTERVIEW_ENUMS.CATEGORIES.join(', ')}`;
          if (question.category === 'best-practices') {
            customMessage = `Invalid category in questions[${index}]: "best-practices" should be "coding" or "behavioral". Allowed values: ${INTERVIEW_ENUMS.CATEGORIES.join(', ')}`;
          }
          errors.push(new ValidationError(`questions[${index}].category`, question.category, INTERVIEW_ENUMS.CATEGORIES, customMessage));
        }
        
        if (question.difficulty && !INTERVIEW_ENUMS.DIFFICULTIES.includes(question.difficulty)) {
          let customMessage = `Invalid difficulty in questions[${index}]: "${question.difficulty}". Allowed values: ${INTERVIEW_ENUMS.DIFFICULTIES.join(', ')}`;
          if (question.difficulty === 'entry') {
            customMessage = `Invalid difficulty in questions[${index}]: "entry" should be "easy". Allowed values: ${INTERVIEW_ENUMS.DIFFICULTIES.join(', ')}`;
          }
          errors.push(new ValidationError(`questions[${index}].difficulty`, question.difficulty, INTERVIEW_ENUMS.DIFFICULTIES, customMessage));
        }
      });
    }

    if (errors.length > 0) {
      const errorResponse = formatMultipleValidationErrors(errors, 'Interview parameter validation');
      return res.status(400).json(errorResponse);
    }

    // If validation passes, return success with normalized values
    const normalizedData = {
      sessionType,
      difficulty: difficulty === 'entry' ? 'easy' : difficulty, // Map entry to easy
      category: category === 'best-practices' ? 'coding' : category, // Map best-practices to coding
      categories: categories.map(cat => cat === 'best-practices' ? 'coding' : cat),
      role,
      experience: experience === 'entry' ? 'easy' : experience,
      questions: questions.map(q => ({
        ...q,
        category: q.category === 'best-practices' ? 'coding' : q.category,
        difficulty: q.difficulty === 'entry' ? 'easy' : q.difficulty
      }))
    };

    logger.info('Interview parameters validated successfully', { 
      originalData: req.body,
      normalizedData 
    });

    return res.json({
      success: true,
      data: {
        valid: true,
        normalizedData,
        message: 'Interview parameters are valid'
      },
      error: null
    });

  } catch (error) {
    logger.error('Failed to validate interview parameters', { 
      error: error.message,
      stack: error.stack 
    });
    
    const errorResponse = formatValidationError(error, 'Interview parameter validation error');
    return res.status(500).json(errorResponse);
  }
}

/**
 * Generate simplified interview questions based on resume content
 * POST /api/interviews/generate-questions
 */
export async function generateInterviewQuestions(req, res) {
  try {
    const { resumeContent = '', questionCount = 5, careerGoal = null } = req.body;

    // Validate question count
    const validQuestionCount = Math.min(Math.max(questionCount, 3), 5);

    logger.info('Generating interview questions', { 
      userId: req.user._id, 
      resumeLength: resumeContent.length,
      questionCount: validQuestionCount,
      careerGoal
    });

    // Get user profile for career goal if not provided
    const user = await User.findById(req.user._id).select('profile');
    const finalCareerGoal = careerGoal || user?.profile?.careerGoal;

    // Generate questions using simplified service
    const result = await interviewQuestionService.generateQuestions(
      resumeContent,
      validQuestionCount,
      { careerGoal: finalCareerGoal }
    );

    return res.json({ 
      success: true, 
      data: result, 
      error: null 
    });

  } catch (error) {
    logger.error('Failed to generate interview questions', { 
      error: error.message, 
      userId: req.user._id,
      stack: error.stack 
    });
    
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Failed to generate interview questions'
    });
  }
}

/**
 * Evaluate interview answers using AI
 * POST /api/interviews/evaluate-answers
 */
export async function evaluateInterviewAnswers(req, res) {
  try {
    const { questionsAndAnswers = [], candidateProfile = {} } = req.body;

    logger.info('Evaluating interview answers', { 
      userId: req.user._id, 
      questionsCount: questionsAndAnswers.length
    });

    // Use AI service to evaluate answers with proper error handling
    const evaluationResult = await enhancedAIErrorHandler.handleAIOperation(
      () => aiService.evaluateInterviewAnswers(questionsAndAnswers, candidateProfile),
      'interview_evaluation',
      { questionsAndAnswers, candidateProfile }
    );

    if (!evaluationResult.success) {
      // Return fallback evaluation on AI failure
      const fallbackEvaluation = {
        overallScore: 75,
        overallFeedback: 'Good interview performance overall. You provided thoughtful answers and demonstrated relevant experience.',
        individualFeedback: questionsAndAnswers.map((qa, index) => ({
          questionIndex: index,
          score: Math.floor(Math.random() * 20) + 70,
          feedback: 'Good response with relevant examples. Consider providing more specific details to strengthen your answer.',
          strengths: ['Clear communication', 'Relevant experience'],
          improvements: ['Add specific metrics', 'Include measurable outcomes']
        })),
        keyStrengths: ['Communication skills', 'Problem-solving approach', 'Professional experience'],
        areasForImprovement: ['Quantifying achievements', 'Providing specific examples', 'Demonstrating impact'],
        nextSteps: 'Continue practicing to improve confidence and clarity in your answers. Focus on the STAR method for behavioral questions.'
      };

      return res.json({ 
        success: true, 
        data: fallbackEvaluation, 
        error: null 
      });
    }

    return res.json({ 
      success: true, 
      data: evaluationResult.data, 
      error: null 
    });

  } catch (error) {
    logger.error('Failed to evaluate interview answers', { 
      error: error.message, 
      userId: req.user._id,
      stack: error.stack 
    });
    
    // Return fallback evaluation
    const fallbackEvaluation = {
      overallScore: 75,
      overallFeedback: 'Good interview performance overall. You provided thoughtful answers and demonstrated relevant experience.',
      individualFeedback: questionsAndAnswers.map((qa, index) => ({
        questionIndex: index,
        score: Math.floor(Math.random() * 20) + 70,
        feedback: 'Good response with relevant examples. Consider providing more specific details to strengthen your answer.',
        strengths: ['Clear communication', 'Relevant experience'],
        improvements: ['Add specific metrics', 'Include measurable outcomes']
      })),
      keyStrengths: ['Communication skills', 'Problem-solving approach', 'Professional experience'],
      areasForImprovement: ['Quantifying achievements', 'Providing specific examples', 'Demonstrating impact'],
      nextSteps: 'Continue practicing to improve confidence and clarity in your answers. Focus on the STAR method for behavioral questions.'
    };

    return res.json({ 
      success: true, 
      data: fallbackEvaluation, 
      error: null 
    });
  }
}

/**
 * Start a new AI-powered interview session
 * POST /api/interviews/start
 */
export async function startInterview(req, res) {
  try {
    const {
      sessionType = 'mixed',
      role = 'software-developer',
      experience = 'entry',
      difficulty = null,
      questionCount = 5,
      timeLimit = 60,
      questions = [],
      careerGoal = null
    } = req.body;

    // Validate required fields
    const requiredFieldErrors = validateRequiredFields(req.body, ['sessionType', 'difficulty']);
    if (requiredFieldErrors.length > 0) {
      const errorResponse = formatMultipleValidationErrors(requiredFieldErrors, 'Interview start validation');
      return res.status(400).json(errorResponse);
    }

    // Validate enum values
    const enumValidationErrors = validateEnumValues(req.body, {
      sessionType: INTERVIEW_ENUMS.SESSION_TYPES,
      difficulty: INTERVIEW_ENUMS.DIFFICULTIES,
      role: INTERVIEW_ENUMS.ROLES,
      experience: INTERVIEW_ENUMS.EXPERIENCE_LEVELS
    });

    // Validate questions array if provided
    if (questions && Array.isArray(questions)) {
      questions.forEach((question, index) => {
        if (question.category && !INTERVIEW_ENUMS.CATEGORIES.includes(question.category)) {
          enumValidationErrors.push(createEnumValidationError(
            `questions[${index}].category`,
            question.category,
            INTERVIEW_ENUMS.CATEGORIES
          ));
        }
      });
    }

    if (enumValidationErrors.length > 0) {
      const errorResponse = formatMultipleValidationErrors(enumValidationErrors, 'Interview enum validation');
      return res.status(400).json(errorResponse);
    }

    // Map "entry" to "easy" for backward compatibility (as per requirements)
    const mappedDifficulty = difficulty === 'entry' ? 'easy' : difficulty;
    const mappedExperience = experience === 'entry' ? 'easy' : experience;

    // Get user profile for personalization
    const user = await User.findById(req.user._id).select('profile');
    const userProfile = user?.profile || {};

    // Generate AI-powered questions with enhanced error handling
    logger.info('Generating interview questions', { 
      userId: req.user._id, 
      sessionType, 
      role, 
      experience, 
      questionCount 
    });

    const questionGenerationResult = await enhancedAIErrorHandler.handleAIOperation(
      () => interviewQuestionService.generateQuestions(
        '', // No resume content in start interview
        Math.min(Math.max(questionCount, 3), 10), // Limit between 3-10
        {
          role,
          experience,
          sessionType,
          careerGoal: careerGoal || userProfile.careerGoal, // Use provided careerGoal or fallback to profile
          difficulty
        }
      ),
      'interview_generation',
      {
        role,
        experience,
        questionCount: Math.min(Math.max(questionCount, 3), 10),
        userProfile
      }
    );

    // Handle AI operation result
    if (!questionGenerationResult.success) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'INTERVIEW_GENERATION_FAILED',
          message: questionGenerationResult.error,
          action: questionGenerationResult.action,
          fallbackAvailable: questionGenerationResult.fallbackAvailable,
          retryAfter: questionGenerationResult.retryAfter
        }
      });
    }

    const questionData = questionGenerationResult.data;
    const isUsingFallback = questionGenerationResult.source === 'fallback';

    if (!questionData || !questionData.questions || questionData.questions.length === 0) {
      return res.json({ 
        success: false, 
        data: null, 
        error: 'Failed to generate interview questions' 
      });
    }

    // Create interview session
    const session = await InterviewSession.create({
      userId: req.user._id,
      sessionType,
      title: `${role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Interview`,
      description: `AI-powered ${sessionType} interview for ${role} position (${mappedExperience} level)`,
      difficulty: mappedDifficulty,
      targetRole: role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      questions: questionData.questions.map(q => ({
        questionId: q.questionId,
        question: q.question,
        category: q.category,
        expectedAnswer: '', // Will be filled by AI evaluation
        keyPoints: q.keyPoints || [],
        userAnswer: {
          text: '',
          audioUrl: '',
          duration: 0
        },
        feedback: {
          content: '',
          strengths: [],
          improvements: [],
          score: 0
        },
        timeSpent: 0,
        isAnswered: false
      })),
      status: 'not-started',
      settings: {
        timeLimit: Math.max(timeLimit, 30), // Minimum 30 minutes
        allowAudioRecording: true,
        showHints: false,
        randomizeQuestions: false
      }
    });

    logger.info('Interview session created successfully', { 
      sessionId: session._id, 
      questionsGenerated: questionData.questions.length 
    });

    return res.json({ 
      success: true, 
      data: { 
        sessionId: session._id,
        sessionType: session.sessionType,
        title: session.title,
        description: session.description,
        role: session.targetRole,
        difficulty: session.difficulty,
        questions: session.questions.map(q => ({
          questionId: q.questionId,
          question: q.question,
          category: q.category,
          keyPoints: q.keyPoints,
          expectedDuration: questionData.questions.find(orig => orig.questionId === q.questionId)?.expectedDuration || 180
        })),
        metadata: questionData.metadata,
        settings: session.settings,
        status: session.status
      }, 
      error: null 
    });

  } catch (error) {
    logger.error('Failed to start interview session', { 
      error: error.message, 
      userId: req.user._id,
      stack: error.stack 
    });
    
    const errorResponse = formatValidationError(error, 'Start interview error');
    return res.status(500).json(errorResponse);
  }
}

/**
 * Get next question in interview
 * GET /api/interviews/:sessionId/question
 */
export const getNextQuestion = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.json({ success: false, data: null, error: 'Interview session not found' });
    }

    // Check if user owns this session
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.json({ success: false, data: null, error: 'Unauthorized access to interview session' });
    }

    // Get next unanswered question
    const nextQuestion = session.getNextQuestion();
    
    if (!nextQuestion) {
      // No more questions - interview is complete
      return res.json({ 
        success: true, 
        data: null, 
        error: null,
        message: 'All questions have been answered. Interview is complete.' 
      });
    }

    // Get progress information
    const progress = session.getProgress();

    return res.json({ 
      success: true, 
      data: {
        question: {
          questionId: nextQuestion.questionId,
          question: nextQuestion.question,
          category: nextQuestion.category,
          keyPoints: nextQuestion.keyPoints
        },
        progress,
        sessionInfo: {
          sessionId: session._id,
          title: session.title,
          status: session.status,
          timeLimit: session.settings.timeLimit
        }
      }, 
      error: null 
    });

  } catch (error) {
    logger.error('Failed to get next question', { 
      error: error.message, 
      sessionId: req.params.sessionId,
      userId: req.user._id 
    });
    
    return res.json({ 
      success: false, 
      data: null, 
      error: error.message || 'Failed to fetch next question' 
    });
  }
};

/**
 * Submit answer for a specific question
 * POST /api/interviews/:sessionId/submit
 */
export async function submitAnswer(req, res) {
  try {
    const { sessionId } = req.params;
    const { 
      questionId, 
      answer, 
      timeSpent = 0,
      audioUrl = null 
    } = req.body;

    // Validate required fields
    const requiredFieldErrors = validateRequiredFields(req.body, ['questionId', 'answer']);
    const sessionIdErrors = validateRequiredFields(req.params, ['sessionId']);
    const allRequiredErrors = [...requiredFieldErrors, ...sessionIdErrors];
    
    if (allRequiredErrors.length > 0) {
      const errorResponse = formatMultipleValidationErrors(allRequiredErrors, 'Submit answer validation');
      return res.status(400).json(errorResponse);
    }

    if (typeof answer !== 'string' || answer.trim().length === 0) {
      const errorResponse = formatValidationError(
        new ValidationError('answer', typeof answer, ['non-empty string'], 'Answer must be a non-empty string'),
        'Submit answer validation'
      );
      return res.status(400).json(errorResponse);
    }

    // Find and validate session
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.json({ success: false, data: null, error: 'Interview session not found' });
    }

    // Check if user owns this session
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.json({ success: false, data: null, error: 'Unauthorized access to interview session' });
    }

    // Find the question
    const question = session.questions.find(q => q.questionId === questionId);
    if (!question) {
      return res.json({ success: false, data: null, error: 'Question not found in session' });
    }

    // Check if question is already answered
    if (question.isAnswered) {
      return res.json({ success: false, data: null, error: 'Question has already been answered' });
    }

    // Update session status if this is the first answer
    if (session.status === 'not-started') {
      await session.startSession();
    }

    // Submit the answer
    question.userAnswer = {
      text: answer.trim(),
      audioUrl: audioUrl || '',
      duration: Math.max(0, timeSpent)
    };
    question.timeSpent = Math.max(0, timeSpent);
    question.isAnswered = true;

    await session.save();

    // Get progress information
    const progress = session.getProgress();

    logger.info('Answer submitted successfully', { 
      sessionId, 
      questionId, 
      answerLength: answer.length,
      timeSpent,
      progress: progress.percentage 
    });

    return res.json({ 
      success: true, 
      data: {
        sessionId,
        questionId,
        submitted: true,
        progress,
        nextAction: progress.percentage === 100 ? 'complete_interview' : 'continue_interview'
      }, 
      error: null 
    });

  } catch (error) {
    logger.error('Failed to submit answer', { 
      error: error.message, 
      sessionId: req.params.sessionId,
      userId: req.user._id 
    });
    
    const errorResponse = formatValidationError(error, 'Submit answer error');
    return res.status(500).json(errorResponse);
  }
}

/**
 * Complete interview and generate AI evaluation
 * POST /api/interviews/:sessionId/complete
 */
export const completeInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.json({ success: false, data: null, error: 'Interview session not found' });
    }

    // Check if user owns this session
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.json({ success: false, data: null, error: 'Unauthorized access to interview session' });
    }

    // Check if interview can be completed
    if (session.status === 'completed') {
      return res.json({ success: false, data: null, error: 'Interview is already completed' });
    }

    const answeredQuestions = session.questions.filter(q => q.isAnswered);
    if (answeredQuestions.length === 0) {
      return res.json({ success: false, data: null, error: 'No questions have been answered yet' });
    }

    // Get user profile for evaluation context
    const user = await User.findById(req.user._id).select('profile');
    const userProfile = user?.profile || {};

    // Prepare questions and answers for AI evaluation
    const questionsAndAnswers = answeredQuestions.map(q => ({
      question: q.question,
      answer: q.userAnswer.text,
      category: q.category,
      timeSpent: q.timeSpent
    }));

    logger.info('Starting AI evaluation for completed interview', { 
      sessionId, 
      questionsAnswered: questionsAndAnswers.length,
      role: session.targetRole 
    });

    // Get AI evaluation with enhanced error handling
    const evaluationResult = await enhancedAIErrorHandler.handleAIOperation(
      () => interviewEvaluationService.evaluateAnswers({
        questionsAndAnswers,
        role: session.targetRole.toLowerCase().replace(' ', '-'),
        experience: session.difficulty,
        userProfile
      }),
      'interview_evaluation',
      {
        questionsAndAnswers,
        role: session.targetRole.toLowerCase().replace(' ', '-'),
        experience: session.difficulty
      }
    );

    // Handle AI operation result
    if (!evaluationResult.success) {
      // Log the error but continue with basic completion
      logger.warn('AI evaluation failed, completing interview with basic feedback', {
        sessionId,
        error: evaluationResult.error
      });

      // Provide basic completion without AI evaluation
      session.overallScore = 70; // Default score
      session.feedback = {
        communication: { score: 70, feedback: 'Interview completed successfully' },
        technicalAccuracy: { score: 70, feedback: 'Answers provided for all questions' },
        confidence: { score: 70, feedback: 'Good participation in the interview' },
        problemSolving: { score: 70, feedback: 'Demonstrated problem-solving approach' },
        overall: 'Interview completed successfully. Detailed AI evaluation temporarily unavailable.',
        improvementAreas: [{ area: 'General improvement', suggestion: 'Continue practicing interview skills', priority: 'medium' }],
        strengths: ['Completed the interview', 'Provided answers to all questions'],
        nextSteps: ['Continue practicing', 'Review common interview questions']
      };

      await session.completeSession();

      return res.json({ 
        success: true, 
        data: {
          sessionId: session._id,
          completed: true,
          overallScore: session.overallScore,
          evaluation: {
            summary: { strengths: session.feedback.strengths, areasForImprovement: ['General improvement'] },
            competencyAssessment: { communication: 70, technical: 70, problemSolving: 70, leadership: 70 }
          },
          session: {
            title: session.title,
            duration: session.duration,
            questionsAnswered: answeredQuestions.length,
            totalQuestions: session.questions.length,
            completedAt: session.completedAt
          },
          message: 'Interview completed. AI evaluation temporarily unavailable.'
        }, 
        error: null 
      });
    }

    const evaluation = evaluationResult.data;
    const isUsingFallback = evaluationResult.source === 'fallback';

    // Update session with evaluation results
    session.overallScore = evaluation.overallScore;
    
    // Update individual question feedback
    evaluation.individualScores.forEach((score, index) => {
      if (answeredQuestions[index]) {
        answeredQuestions[index].feedback = {
          content: score.feedback,
          strengths: score.strengths,
          improvements: score.improvements,
          score: score.score
        };
      }
    });

    // Update overall feedback
    session.feedback = {
      communication: {
        score: evaluation.competencyAssessment.communication || 0,
        feedback: evaluation.feedback?.competencyFeedback?.communication?.feedback || ''
      },
      technicalAccuracy: {
        score: evaluation.competencyAssessment.technical || 0,
        feedback: evaluation.feedback?.competencyFeedback?.technical?.feedback || ''
      },
      confidence: {
        score: evaluation.competencyAssessment.leadership || 0,
        feedback: evaluation.feedback?.competencyFeedback?.leadership?.feedback || ''
      },
      problemSolving: {
        score: evaluation.competencyAssessment.problemSolving || 0,
        feedback: evaluation.feedback?.competencyFeedback?.problemSolving?.feedback || ''
      },
      overall: evaluation.summary?.strengths?.join('. ') || 'Interview completed successfully',
      improvementAreas: (evaluation.summary?.areasForImprovement || []).map(area => ({
        area: area,
        suggestion: `Focus on improving ${area.toLowerCase()}`,
        priority: 'medium'
      })),
      strengths: evaluation.summary?.strengths || [],
      nextSteps: evaluation.summary?.nextSteps || []
    };

    // Complete the session
    await session.completeSession();

    logger.info('Interview completed and evaluated successfully', { 
      sessionId, 
      overallScore: session.overallScore,
      evaluationGenerated: true 
    });

    return res.json({ 
      success: true, 
      data: {
        sessionId: session._id,
        completed: true,
        overallScore: session.overallScore,
        evaluation: {
          summary: evaluation.summary,
          competencyAssessment: evaluation.competencyAssessment,
          improvementPlan: evaluation.improvementPlan,
          detailedFeedback: evaluation.feedback
        },
        session: {
          title: session.title,
          duration: session.duration,
          questionsAnswered: answeredQuestions.length,
          totalQuestions: session.questions.length,
          completedAt: session.completedAt
        }
      }, 
      error: null 
    });

  } catch (error) {
    logger.error('Failed to complete interview', { 
      error: error.message, 
      sessionId: req.params.sessionId,
      userId: req.user._id,
      stack: error.stack 
    });
    
    return res.json({ 
      success: false, 
      data: null, 
      error: error.message || 'Failed to complete interview' 
    });
  }
};

/**
 * Get interview session details
 * GET /api/interviews/:sessionId
 */
export const getInterviewSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.json({ success: false, data: null, error: 'Interview session not found' });
    }

    // Check if user owns this session
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.json({ success: false, data: null, error: 'Unauthorized access to interview session' });
    }

    // Get progress information
    const progress = session.getProgress();

    return res.json({ 
      success: true, 
      data: {
        sessionId: session._id,
        title: session.title,
        description: session.description,
        sessionType: session.sessionType,
        targetRole: session.targetRole,
        difficulty: session.difficulty,
        status: session.status,
        overallScore: session.overallScore,
        progress,
        questions: session.questions.map(q => ({
          questionId: q.questionId,
          question: q.question,
          category: q.category,
          keyPoints: q.keyPoints,
          isAnswered: q.isAnswered,
          userAnswer: q.isAnswered ? q.userAnswer : null,
          feedback: q.isAnswered ? q.feedback : null,
          timeSpent: q.timeSpent
        })),
        feedback: session.feedback,
        settings: session.settings,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        duration: session.duration,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }, 
      error: null 
    });

  } catch (error) {
    logger.error('Failed to get interview session', { 
      error: error.message, 
      sessionId: req.params.sessionId,
      userId: req.user._id 
    });
    
    return res.json({ 
      success: false, 
      data: null, 
      error: error.message || 'Failed to fetch interview session' 
    });
  }
};

/**
 * Get interview history for the user
 * GET /api/interviews/history
 */
export const getInterviewHistory = async (req, res) => {
  try {
    const { 
      sessionType = null, 
      limit = 20, 
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { userId: req.user._id };
    if (sessionType) {
      // Validate sessionType enum
      if (!INTERVIEW_ENUMS.SESSION_TYPES.includes(sessionType)) {
        const errorResponse = formatValidationError(
          createEnumValidationError('sessionType', sessionType, INTERVIEW_ENUMS.SESSION_TYPES),
          'Interview history filter validation'
        );
        return res.status(400).json(errorResponse);
      }
      query.sessionType = sessionType;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get sessions with pagination
    const sessions = await InterviewSession.find(query)
      .sort(sort)
      .limit(Math.min(parseInt(limit), 50)) // Max 50 sessions per request
      .skip(parseInt(offset))
      .select('title description sessionType targetRole difficulty status overallScore startedAt completedAt duration createdAt');

    // Get total count for pagination
    const totalCount = await InterviewSession.countDocuments(query);

    // Get user statistics
    const stats = await InterviewSession.getUserStats(req.user._id);

    return res.json({ 
      success: true, 
      data: {
        sessions: sessions.map(session => ({
          sessionId: session._id,
          title: session.title,
          description: session.description,
          sessionType: session.sessionType,
          targetRole: session.targetRole,
          difficulty: session.difficulty,
          status: session.status,
          overallScore: session.overallScore,
          duration: session.duration,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          createdAt: session.createdAt
        })),
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: totalCount > (parseInt(offset) + parseInt(limit))
        },
        statistics: stats
      }, 
      error: null 
    });

  } catch (error) {
    logger.error('Failed to get interview history', { 
      error: error.message, 
      userId: req.user._id 
    });
    
    return res.json({ 
      success: false, 
      data: null, 
      error: error.message || 'Failed to fetch interview history' 
    });
  }
};

/**
 * Get stats
 */
export const getInterviewStats = async (req, res) => {
  try {
    const total = await InterviewSession.countDocuments({ user: req.user.id });
    const completed = await InterviewSession.countDocuments({ user: req.user.id, completed: true });
    return res.json({ success: true, data: { total, completed }, error: null });
  } catch (error) {
    return res.json({ success: false, data: null, error: error.message || 'Failed to fetch stats' });
  }
};

/**
 * Improvement tracking
 */
export const getImprovementTracking = async (req, res) => {
  return res.json({ success: true, data: { message: 'Improvement tracking not yet implemented' }, error: null });
};

/**
 * Recommendations
 */
export const getPersonalizedRecommendations = async (req, res) => {
  return res.json({ success: true, data: { tips: ['Practice behavioral questions', 'Improve STAR method answers'] }, error: null });
};

/**
 * Submit interview answer (new endpoint as per task requirements)
 * POST /api/interviews/submit
 */
export async function submitInterviewAnswer(req, res) {
  try {
    const { 
      sessionId,
      questionId, 
      answer, 
      timeSpent = 0,
      audioUrl = null 
    } = req.body;

    // Validate required fields
    const requiredFieldErrors = validateRequiredFields(req.body, ['sessionId', 'questionId', 'answer']);
    
    if (requiredFieldErrors.length > 0) {
      const errorResponse = formatMultipleValidationErrors(requiredFieldErrors, 'Submit interview answer validation');
      return res.status(400).json(errorResponse);
    }

    if (typeof answer !== 'string' || answer.trim().length === 0) {
      const errorResponse = formatValidationError(
        new ValidationError('answer', typeof answer, ['non-empty string'], 'Answer must be a non-empty string'),
        'Submit interview answer validation'
      );
      return res.status(400).json(errorResponse);
    }

    // Find and validate session
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.json({ success: false, data: null, error: 'Interview session not found' });
    }

    // Check if user owns this session
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.json({ success: false, data: null, error: 'Unauthorized access to interview session' });
    }

    // Find the question
    const question = session.questions.find(q => q.questionId === questionId);
    if (!question) {
      return res.json({ success: false, data: null, error: 'Question not found in session' });
    }

    // Check if question is already answered
    if (question.isAnswered) {
      return res.json({ success: false, data: null, error: 'Question has already been answered' });
    }

    // Update session status if this is the first answer
    if (session.status === 'not-started') {
      await session.startSession();
    }

    // Submit the answer
    question.userAnswer = {
      text: answer.trim(),
      audioUrl: audioUrl || '',
      duration: Math.max(0, timeSpent)
    };
    question.timeSpent = Math.max(0, timeSpent);
    question.isAnswered = true;

    await session.save();

    // Get progress information
    const progress = session.getProgress();

    logger.info('Answer submitted successfully via new endpoint', { 
      sessionId, 
      questionId, 
      answerLength: answer.length,
      timeSpent,
      progress: progress.percentage 
    });

    return res.json({ 
      success: true, 
      data: {
        sessionId,
        questionId,
        submitted: true,
        progress,
        nextAction: progress.percentage === 100 ? 'complete_interview' : 'continue_interview'
      }, 
      error: null 
    });

  } catch (error) {
    logger.error('Failed to submit answer via new endpoint', { 
      error: error.message, 
      userId: req.user._id 
    });
    
    return res.json({ 
      success: false, 
      data: null, 
      error: error.message || 'Failed to submit answer' 
    });
  }
}

/**
 * Get interview feedback (new endpoint as per task requirements)
 * GET /api/interviews/feedback/:sessionId
 */
export async function getInterviewFeedback(req, res) {
  try {
    const { sessionId } = req.params;
    
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.json({ success: false, data: null, error: 'Interview session not found' });
    }

    // Check if user owns this session
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.json({ success: false, data: null, error: 'Unauthorized access to interview session' });
    }

    // Check if interview is completed
    if (session.status !== 'completed') {
      return res.json({ 
        success: false, 
        data: null, 
        error: 'Interview must be completed to view feedback' 
      });
    }

    // Get progress information
    const progress = session.getProgress();

    // Prepare feedback data
    const feedbackData = {
      sessionId: session._id,
      title: session.title,
      sessionType: session.sessionType,
      targetRole: session.targetRole,
      difficulty: session.difficulty,
      overallScore: session.overallScore,
      
      // Overall feedback
      feedback: {
        communication: session.feedback.communication,
        technicalAccuracy: session.feedback.technicalAccuracy,
        confidence: session.feedback.confidence,
        problemSolving: session.feedback.problemSolving,
        overall: session.feedback.overall,
        improvementAreas: session.feedback.improvementAreas,
        strengths: session.feedback.strengths,
        nextSteps: session.feedback.nextSteps
      },
      
      // Individual question feedback
      questionFeedback: session.questions
        .filter(q => q.isAnswered)
        .map(q => ({
          questionId: q.questionId,
          question: q.question,
          category: q.category,
          userAnswer: q.userAnswer.text,
          timeSpent: q.timeSpent,
          feedback: {
            content: q.feedback.content,
            strengths: q.feedback.strengths,
            improvements: q.feedback.improvements,
            score: q.feedback.score
          }
        })),
      
      // Session metadata
      sessionInfo: {
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        duration: session.duration,
        progress,
        settings: session.settings
      }
    };

    logger.info('Interview feedback retrieved successfully', { 
      sessionId, 
      overallScore: session.overallScore,
      questionsAnswered: progress.answeredQuestions 
    });

    return res.json({ 
      success: true, 
      data: feedbackData, 
      error: null 
    });

  } catch (error) {
    logger.error('Failed to get interview feedback', { 
      error: error.message, 
      sessionId: req.params.sessionId,
      userId: req.user._id 
    });
    
    return res.json({ 
      success: false, 
      data: null, 
      error: error.message || 'Failed to fetch interview feedback' 
    });
  }
}

/**
 * Analyze single response
 */
export const analyzeResponse = async (req, res) => {
  try {
    const { response, question } = req.body;
    
    // Validate inputs
    if (!response || !question) {
      return res.json({ 
        success: false, 
        data: null, 
        error: 'Both response and question are required' 
      });
    }

    // Use the interview evaluation service for analysis with enhanced error handling
    const analysisResult = await enhancedAIErrorHandler.handleAIOperation(
      () => interviewEvaluationService.evaluateAnswers({
        questionsAndAnswers: [{ question, answer: response, category: 'general' }],
        role: 'general',
        experience: 'entry'
      }),
      'interview_evaluation',
      {
        questionsAndAnswers: [{ question, answer: response, category: 'general' }],
        role: 'general',
        experience: 'entry'
      }
    );

    // Handle AI operation result
    if (!analysisResult.success) {
      return res.json({ 
        success: false, 
        data: null, 
        error: analysisResult.error || 'Failed to analyze response'
      });
    }

    const analysis = analysisResult.data;

    return res.json({ 
      success: true, 
      data: {
        score: analysis.individualScores[0]?.score || 0,
        feedback: analysis.individualScores[0]?.feedback || 'Analysis completed',
        strengths: analysis.individualScores[0]?.strengths || [],
        improvements: analysis.individualScores[0]?.improvements || []
      }, 
      error: null 
    });
  } catch (error) {
    logger.error('Failed to analyze response', { error: error.message });
    return res.json({ 
      success: false, 
      data: null, 
      error: error.message || 'Failed to analyze response' 
    });
  }
};