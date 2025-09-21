/**
 * Interview Question Service - Simplified for Hackathon Prototype
 * Handles simplified interview question generation using AI integration
 */

import aiService from './aiService.js';



class InterviewQuestionService {
  constructor() {
    this.aiService = aiService;
    this.logger = {
      info: (message, data) => console.log(`[InterviewQuestionService] ${message}`, data || ''),
      error: (message, data) => console.error(`[InterviewQuestionService] ${message}`, data || ''),
      warn: (message, data) => console.warn(`[InterviewQuestionService] ${message}`, data || '')
    };
  }

  /**
   * Generate simplified interview questions based on resume content
   * Simplified for hackathon prototype - generates 3-5 questions
   */
  async generateQuestions(resumeContent = '', questionCount = 5, options = {}) {
    try {
      const { careerGoal, role = 'software-developer' } = options;
      
      this.logger.info('Generating simplified interview questions', {
        resumeLength: resumeContent.length,
        questionCount,
        careerGoal,
        role
      });

      // Use AI service to generate questions based on resume and career goal
      const questions = await this.aiService.generateInterviewQuestions(
        resumeContent,
        role,
        Math.min(Math.max(questionCount, 3), 5), // Ensure 3-5 questions
        careerGoal
      );

      // Simplify the response format
      const simplifiedQuestions = questions.map((q, index) => ({
        id: `q_${index + 1}`,
        question: q.question,
        type: q.type || 'behavioral',
        tip: q.tip || 'Take your time to think through your answer and provide specific examples.',
        order: index + 1
      }));

      this.logger.info('Interview questions generated successfully', {
        questionsGenerated: simplifiedQuestions.length
      });

      return {
        questions: simplifiedQuestions,
        totalQuestions: simplifiedQuestions.length,
        estimatedDuration: `${simplifiedQuestions.length * 3} minutes`,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Failed to generate interview questions', {
        error: error.message
      });
      
      // Return fallback questions
      return this.getFallbackQuestions(questionCount);
    }
  }



  /**
   * Get fallback questions when AI service fails
   */
  getFallbackQuestions(questionCount = 5) {
    this.logger.warn('Using fallback questions due to AI service failure');

    const fallbackQuestions = [
      {
        id: 'q_1',
        question: 'Tell me about a challenging project you worked on and how you overcame obstacles.',
        type: 'behavioral',
        tip: 'Use the STAR method: Situation, Task, Action, Result',
        order: 1
      },
      {
        id: 'q_2',
        question: 'How do you handle working under pressure and tight deadlines?',
        type: 'behavioral',
        tip: 'Provide specific examples and mention stress management techniques',
        order: 2
      },
      {
        id: 'q_3',
        question: 'Describe a time when you had to learn a new technology or skill quickly.',
        type: 'behavioral',
        tip: 'Highlight your learning process and how you applied the new knowledge',
        order: 3
      },
      {
        id: 'q_4',
        question: 'What motivates you in your work, and how do you stay engaged?',
        type: 'behavioral',
        tip: 'Connect your motivation to the role and company mission',
        order: 4
      },
      {
        id: 'q_5',
        question: 'Where do you see yourself in your career in the next 2-3 years?',
        type: 'behavioral',
        tip: 'Show ambition while being realistic and relevant to the role',
        order: 5
      }
    ];

    const selectedQuestions = fallbackQuestions.slice(0, Math.min(questionCount, 5));

    return {
      questions: selectedQuestions,
      totalQuestions: selectedQuestions.length,
      estimatedDuration: `${selectedQuestions.length * 3} minutes`,
      generatedAt: new Date().toISOString(),
      fallback: true
    };
  }



  /**
   * Get service status
   */
  getStatus() {
    return {
      service: 'InterviewQuestionService',
      aiServiceReady: this.aiService.isReady(),
      version: 'simplified-hackathon'
    };
  }
}

// Export singleton instance
const interviewQuestionService = new InterviewQuestionService();

export { InterviewQuestionService };
export default interviewQuestionService;