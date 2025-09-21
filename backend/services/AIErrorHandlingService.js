/**
 * AI Error Handling Service
 * Comprehensive error handling and fallback mechanisms for AI integration
 */

import { AIServiceError } from './aiService.js';

// Simple logger for error handling service
const logger = {
  info: (message, data) => console.log(`[AIErrorHandling] ${message}`, data || ''),
  error: (message, data) => console.error(`[AIErrorHandling] ${message}`, data || ''),
  warn: (message, data) => console.warn(`[AIErrorHandling] ${message}`, data || '')
};

/**
 * AI Service Health Monitor
 * Tracks AI service health and provides status information
 */
class AIServiceHealthMonitor {
  constructor() {
    this.healthStatus = {
      isHealthy: true,
      lastHealthCheck: null,
      consecutiveFailures: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastError: null,
      degradationLevel: 'none' // none, partial, severe
    };
    
    this.healthCheckInterval = null;
    this.maxConsecutiveFailures = 5;
    this.healthCheckIntervalMs = 60000; // 1 minute
  }

  /**
   * Start continuous health monitoring
   */
  startMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, this.healthCheckIntervalMs);

    logger.info('AI Service health monitoring started');
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    logger.info('AI Service health monitoring stopped');
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    try {
      const startTime = Date.now();
      
      // Import aiService dynamically to avoid circular dependency
      const { default: aiService } = await import('./aiService.js');
      
      // Test basic connectivity
      const connectionTest = await aiService.testConnection();
      const responseTime = Date.now() - startTime;

      if (connectionTest.success) {
        this.recordSuccess(responseTime);
      } else {
        this.recordFailure(new Error(connectionTest.error || 'Health check failed'));
      }

      this.healthStatus.lastHealthCheck = new Date().toISOString();
      
      logger.info('Health check completed', {
        healthy: this.healthStatus.isHealthy,
        responseTime,
        consecutiveFailures: this.healthStatus.consecutiveFailures
      });

    } catch (error) {
      this.recordFailure(error);
      logger.error('Health check failed', { error: error.message });
    }
  }

  /**
   * Record successful operation
   */
  recordSuccess(responseTime = 0) {
    this.healthStatus.totalRequests++;
    this.healthStatus.successfulRequests++;
    this.healthStatus.consecutiveFailures = 0;
    this.healthStatus.isHealthy = true;
    this.healthStatus.degradationLevel = 'none';
    
    // Update average response time
    this.updateAverageResponseTime(responseTime);
  }

  /**
   * Record failed operation
   */
  recordFailure(error) {
    this.healthStatus.totalRequests++;
    this.healthStatus.failedRequests++;
    this.healthStatus.consecutiveFailures++;
    this.healthStatus.lastError = {
      message: error.message,
      type: error.type || 'unknown',
      timestamp: new Date().toISOString()
    };

    // Determine health status based on consecutive failures
    if (this.healthStatus.consecutiveFailures >= this.maxConsecutiveFailures) {
      this.healthStatus.isHealthy = false;
      this.healthStatus.degradationLevel = 'severe';
    } else if (this.healthStatus.consecutiveFailures >= 2) {
      this.healthStatus.degradationLevel = 'partial';
    }
  }

  /**
   * Update average response time
   */
  updateAverageResponseTime(newTime) {
    const totalSuccessful = this.healthStatus.successfulRequests;
    if (totalSuccessful === 1) {
      this.healthStatus.averageResponseTime = newTime;
    } else {
      this.healthStatus.averageResponseTime = 
        ((this.healthStatus.averageResponseTime * (totalSuccessful - 1)) + newTime) / totalSuccessful;
    }
  }

  /**
   * Get current health status
   */
  getHealthStatus() {
    return {
      ...this.healthStatus,
      successRate: this.healthStatus.totalRequests > 0 
        ? (this.healthStatus.successfulRequests / this.healthStatus.totalRequests) * 100 
        : 100
    };
  }

  /**
   * Check if service is healthy enough for operations
   */
  isServiceHealthy() {
    return this.healthStatus.isHealthy && this.healthStatus.degradationLevel !== 'severe';
  }

  /**
   * Get degradation level
   */
  getDegradationLevel() {
    return this.healthStatus.degradationLevel;
  }
}

/**
 * AI Fallback Service
 * Provides fallback mechanisms when AI service is unavailable
 */
class AIFallbackService {
  constructor() {
    this.fallbackData = {
      resumeAnalysis: {
        identifiedSkills: ['Communication', 'Problem Solving', 'Teamwork'],
        skillGaps: ['Technical Skills', 'Leadership', 'Project Management'],
        careerPath: [
          {
            step: 'Skill Development',
            description: 'Focus on developing technical and soft skills',
            resources: [
              {
                title: 'Online Learning Platforms',
                url: 'https://coursera.org',
                type: 'course'
              }
            ],
            estimatedTime: '3-6 months',
            priority: 'high'
          }
        ],
        overallScore: 65,
        recommendations: 'Continue developing your skills and gaining experience. Focus on building a strong portfolio.'
      },
      assessmentQuestions: {
        technical: [
          {
            question: 'What is the difference between a variable and a constant?',
            options: ['Variables can change, constants cannot', 'No difference', 'Constants are faster', 'Variables are deprecated'],
            correctAnswer: 'Variables can change, constants cannot',
            explanation: 'Variables can be modified after declaration, while constants maintain their value.',
            difficulty: 'easy',
            category: 'fundamentals'
          }
        ],
        personality: [
          {
            question: 'How do you handle working under pressure?',
            options: ['I work better under pressure', 'I avoid pressure situations', 'I break down under pressure', 'I manage pressure with planning'],
            correctAnswer: 'I manage pressure with planning',
            explanation: 'Managing pressure through planning shows good stress management skills.',
            difficulty: 'medium',
            category: 'stress-management'
          }
        ],
        hr: [
          {
            question: 'What motivates you in your work?',
            options: ['Money only', 'Learning and growth', 'Easy tasks', 'Working alone'],
            correctAnswer: 'Learning and growth',
            explanation: 'Learning and growth motivation shows professional development mindset.',
            difficulty: 'easy',
            category: 'motivation'
          }
        ]
      },
      interviewQuestions: {
        'software-developer': [
          {
            question: 'Tell me about a challenging project you worked on.',
            type: 'behavioral',
            difficulty: 'medium',
            category: 'problem-solving',
            expectedDuration: '3-4 minutes',
            followUpQuestions: ['What was the biggest challenge?', 'How did you overcome it?']
          }
        ],
        'data-scientist': [
          {
            question: 'How do you approach a new data analysis problem?',
            type: 'technical',
            difficulty: 'medium',
            category: 'analytical-thinking',
            expectedDuration: '3-4 minutes',
            followUpQuestions: ['What tools do you prefer?', 'How do you validate your results?']
          }
        ]
      }
    };
  }

  /**
   * Get fallback resume analysis
   */
  getFallbackResumeAnalysis(resumeText, userProfile = {}) {
    logger.warn('Using fallback resume analysis');
    
    // Customize based on user profile if available
    const analysis = { ...this.fallbackData.resumeAnalysis };
    
    if (userProfile.interests && userProfile.interests.length > 0) {
      analysis.recommendations = `Based on your interests in ${userProfile.interests.join(', ')}, ${analysis.recommendations}`;
    }

    return analysis;
  }

  /**
   * Get fallback assessment questions
   */
  getFallbackAssessmentQuestions(domain, difficulty = 'medium', questionCount = 5) {
    logger.warn('Using fallback assessment questions', { domain, difficulty, questionCount });
    
    const domainQuestions = this.fallbackData.assessmentQuestions[domain] || 
                           this.fallbackData.assessmentQuestions.technical;
    
    // Repeat questions if needed to meet count
    const questions = [];
    for (let i = 0; i < questionCount; i++) {
      questions.push(domainQuestions[i % domainQuestions.length]);
    }

    return {
      questions,
      metadata: {
        domain,
        difficulty,
        totalQuestions: questionCount,
        estimatedTime: `${questionCount * 2} minutes`,
        fallbackUsed: true
      }
    };
  }

  /**
   * Get fallback interview questions
   */
  getFallbackInterviewQuestions(role, experience = 'entry', questionCount = 5) {
    logger.warn('Using fallback interview questions', { role, experience, questionCount });
    
    const roleQuestions = this.fallbackData.interviewQuestions[role] || 
                         this.fallbackData.interviewQuestions['software-developer'];
    
    // Repeat questions if needed to meet count
    const questions = [];
    for (let i = 0; i < questionCount; i++) {
      questions.push(roleQuestions[i % roleQuestions.length]);
    }

    return {
      questions,
      metadata: {
        role,
        experience,
        totalQuestions: questionCount,
        estimatedDuration: `${questionCount * 3} minutes`,
        focusAreas: ['problem-solving', 'communication', 'technical-skills'],
        fallbackUsed: true
      }
    };
  }

  /**
   * Get fallback interview evaluation
   */
  getFallbackInterviewEvaluation(questionsAndAnswers, role, experience = 'entry') {
    logger.warn('Using fallback interview evaluation', { role, experience });
    
    const questionCount = questionsAndAnswers.length;
    const baseScore = 70; // Base score for fallback evaluation
    
    return {
      overallScore: baseScore,
      individualScores: questionsAndAnswers.map((qa, index) => ({
        questionIndex: index,
        score: baseScore + Math.floor(Math.random() * 20) - 10, // ±10 variation
        feedback: 'Your answer shows good understanding. Consider providing more specific examples.',
        strengths: ['Clear communication', 'Relevant experience'],
        improvements: ['Add more details', 'Provide specific examples']
      })),
      summary: {
        strengths: ['Good communication skills', 'Relevant background', 'Positive attitude'],
        areasForImprovement: ['Provide more specific examples', 'Demonstrate deeper technical knowledge'],
        recommendations: ['Practice with more technical questions', 'Prepare specific examples from your experience'],
        nextSteps: ['Continue practicing', 'Research the company and role', 'Prepare questions to ask']
      },
      competencyAssessment: {
        technical: baseScore,
        communication: baseScore + 10,
        problemSolving: baseScore - 5,
        leadership: baseScore - 10
      },
      fallbackUsed: true
    };
  }
}

/**
 * Enhanced AI Error Handler
 * Provides comprehensive error handling with fallbacks and user-friendly messages
 */
class EnhancedAIErrorHandler {
  constructor() {
    this.healthMonitor = new AIServiceHealthMonitor();
    this.fallbackService = new AIFallbackService();
    this.userFriendlyMessages = {
      'not_initialized': {
        message: 'AI service is starting up. Please try again in a moment.',
        action: 'retry',
        fallbackAvailable: false
      },
      'initialization_error': {
        message: 'AI service is temporarily unavailable. We\'re working to restore it.',
        action: 'contact_support',
        fallbackAvailable: false
      },
      'generation_failed': {
        message: 'AI processing encountered an issue. You can try again or use our backup system.',
        action: 'retry_or_fallback',
        fallbackAvailable: true
      },
      'rate_limit_exceeded': {
        message: 'Too many requests. Please wait a moment before trying again.',
        action: 'wait_and_retry',
        fallbackAvailable: true,
        retryAfter: 60
      },
      'quota_exceeded': {
        message: 'AI service is experiencing high demand. Please try again later.',
        action: 'wait_and_retry',
        fallbackAvailable: true,
        retryAfter: 300
      },
      'timeout_error': {
        message: 'AI processing is taking longer than expected. Please try again.',
        action: 'retry',
        fallbackAvailable: true
      },
      'network_error': {
        message: 'Connection issue detected. Please check your internet and try again.',
        action: 'retry',
        fallbackAvailable: true
      },
      'safety_error': {
        message: 'Content was flagged by safety filters. Please modify your input and try again.',
        action: 'modify_input',
        fallbackAvailable: false
      },
      'auth_error': {
        message: 'Authentication issue with AI service. Please contact support.',
        action: 'contact_support',
        fallbackAvailable: false
      }
    };
  }

  /**
   * Start health monitoring
   */
  startMonitoring() {
    this.healthMonitor.startMonitoring();
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring() {
    this.healthMonitor.stopMonitoring();
  }

  /**
   * Handle AI operation with comprehensive error handling and fallbacks
   */
  async handleAIOperation(operation, operationType, fallbackParams = {}) {
    const startTime = Date.now();
    
    try {
      // Check if service is healthy enough for operations
      if (!this.healthMonitor.isServiceHealthy()) {
        logger.warn('AI service unhealthy, using fallback', {
          degradationLevel: this.healthMonitor.getDegradationLevel()
        });
        return this.useFallback(operationType, fallbackParams);
      }

      // Execute the operation
      const result = await operation();
      
      // Record success
      this.healthMonitor.recordSuccess(Date.now() - startTime);
      
      return {
        success: true,
        data: result,
        source: 'ai',
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      // Record failure
      this.healthMonitor.recordFailure(error);
      
      logger.error('AI operation failed', {
        operationType,
        error: error.message,
        type: error.type
      });

      // Determine if fallback should be used
      const shouldUseFallback = this.shouldUseFallback(error, operationType);
      
      if (shouldUseFallback) {
        logger.info('Using fallback for failed AI operation', { operationType });
        return this.useFallback(operationType, fallbackParams);
      }

      // Return user-friendly error
      return this.formatUserError(error, operationType);
    }
  }

  /**
   * Determine if fallback should be used
   */
  shouldUseFallback(error, operationType) {
    // Always use fallback for certain error types
    const fallbackErrorTypes = [
      'generation_failed',
      'timeout_error',
      'network_error',
      'rate_limit_exceeded',
      'quota_exceeded'
    ];

    if (error instanceof AIServiceError && fallbackErrorTypes.includes(error.type)) {
      return true;
    }

    // Use fallback if service is severely degraded
    if (this.healthMonitor.getDegradationLevel() === 'severe') {
      return true;
    }

    return false;
  }

  /**
   * Use fallback service
   */
  useFallback(operationType, params) {
    try {
      let fallbackData;

      switch (operationType) {
        case 'resume_analysis':
          fallbackData = this.fallbackService.getFallbackResumeAnalysis(
            params.resumeText, 
            params.userProfile
          );
          break;

        case 'assessment_generation':
          fallbackData = this.fallbackService.getFallbackAssessmentQuestions(
            params.domain, 
            params.difficulty, 
            params.questionCount
          );
          break;

        case 'interview_generation':
          fallbackData = this.fallbackService.getFallbackInterviewQuestions(
            params.role, 
            params.experience, 
            params.questionCount
          );
          break;

        case 'interview_evaluation':
          fallbackData = this.fallbackService.getFallbackInterviewEvaluation(
            params.questionsAndAnswers, 
            params.role, 
            params.experience
          );
          break;

        default:
          throw new Error(`No fallback available for operation: ${operationType}`);
      }

      return {
        success: true,
        data: fallbackData,
        source: 'fallback',
        message: 'AI service temporarily unavailable. Using backup system.'
      };

    } catch (fallbackError) {
      logger.error('Fallback failed', { 
        operationType, 
        error: fallbackError.message 
      });

      return {
        success: false,
        error: 'Both AI service and backup system are unavailable. Please try again later.',
        source: 'none'
      };
    }
  }

  /**
   * Format user-friendly error message
   */
  formatUserError(error, operationType) {
    const errorType = error.type || 'unknown';
    const userMessage = this.userFriendlyMessages[errorType] || {
      message: 'An unexpected error occurred. Please try again.',
      action: 'retry',
      fallbackAvailable: false
    };

    return {
      success: false,
      error: userMessage.message,
      errorType: errorType,
      action: userMessage.action,
      fallbackAvailable: userMessage.fallbackAvailable,
      retryAfter: userMessage.retryAfter,
      operationType,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get system health status
   */
  getSystemHealth() {
    return {
      aiService: this.healthMonitor.getHealthStatus(),
      fallbackService: {
        available: true,
        lastUsed: null // Could be enhanced to track fallback usage
      },
      overall: this.healthMonitor.isServiceHealthy() ? 'healthy' : 'degraded'
    };
  }
}

// Export singleton instance
const enhancedAIErrorHandler = new EnhancedAIErrorHandler();

export { 
  AIServiceHealthMonitor, 
  AIFallbackService, 
  EnhancedAIErrorHandler 
};

export default enhancedAIErrorHandler;