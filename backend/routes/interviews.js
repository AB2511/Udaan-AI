import express from 'express';
import {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviewHistory,
  getInterviewSession,
  getNextQuestion,
  submitInterviewAnswer,
  getInterviewFeedback,
  validateInterviewParameters,
  generateInterviewQuestions,
  evaluateInterviewAnswers
} from '../controllers/interviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// ✅ Validate interview parameters
router.post('/validate', authenticate, validateInterviewParameters);

// ✅ Generate interview questions (simplified for hackathon)
router.post('/generate-questions', authenticate, generateInterviewQuestions);

// ✅ Evaluate interview answers (simplified for hackathon)
router.post('/evaluate-answers', authenticate, evaluateInterviewAnswers);

// ✅ Start interview
router.post('/start', authenticate, startInterview);

// ✅ Submit answer (original endpoint)
router.put('/:sessionId/answer', authenticate, submitAnswer);

// ✅ Submit answer (new endpoint as per task requirements)
router.post('/submit', authenticate, submitInterviewAnswer);

// ✅ Complete interview
router.post('/:sessionId/complete', authenticate, completeInterview);

// ✅ Get interview history
router.get('/history', authenticate, getInterviewHistory);

// ✅ Get interview results (original endpoint)
router.get('/:sessionId', authenticate, getInterviewSession);

// ✅ Get interview feedback (new endpoint as per task requirements)
router.get('/feedback/:sessionId', authenticate, getInterviewFeedback);

// ✅ Get next question
router.get('/:sessionId/question', authenticate, getNextQuestion);

export default router;