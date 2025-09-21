/**
 * AI Utilities
 * Helper functions for AI service error handling, validation, and testing
 */

import aiService, { AIServiceError } from '../services/aiService.js';
// Simple logger for AI utilities
const logger = {
  info: (message, data) => console.log(`[INFO] ${message}`, data || ''),
  error: (message, data) => console.error(`[ERROR] ${message}`, data || ''),
  warn: (message, data) => console.warn(`[WARN] ${message}`, data || '')
};

/**
 * AI Error Handler - Provides graceful error handling for AI operations
 */
export class AIErrorHandler {
  /**
   * Handle AI service errors with appropriate fallback strategies
   */
  static handleAIError(error, context = {}) {
    // Use the simple logger defined above
    
    // Log the error with context
    logger.error('AI Service Error', {
      error: error.message,
      type: error.type || 'unknown',
      context,
      stack: error.stack
    });

    // Determine error type and response strategy
    if (error instanceof AIServiceError) {
      switch (error.type) {
        case 'not_initialized':
          return {
            success: false,
            error: 'AI service is not available. Please try again later.',
            fallbackAvailable: false,
            retryable: true
          };

        case 'initialization_error':
          return {
            success: false,
            error: 'AI service configuration error. Please contact support.',
            fallbackAvailable: false,
            retryable: false
          };

        case 'generation_failed':
          return {
            success: false,
            error: 'AI processing failed. Please try again or use manual options.',
            fallbackAvailable: true,
            retryable: true
          };

        case 'quota_exceeded':
          return {
            success: false,
            error: 'AI service temporarily unavailable due to high demand. Please try again later.',
            fallbackAvailable: true,
            retryable: true,
            retryAfter: 300 // 5 minutes
          };

        case 'invalid_response':
          return {
            success: false,
            error: 'AI service returned invalid data. Please try again.',
            fallbackAvailable: true,
            retryable: true
          };

        default:
          return {
            success: false,
            error: 'AI service encountered an unexpected error.',
            fallbackAvailable: true,
            retryable: true
          };
      }
    }

    // Handle non-AI service errors
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
      fallbackAvailable: false,
      retryable: true
    };
  }

  /**
   * Wrap AI operations with error handling
   */
  static async withErrorHandling(operation, context = {}) {
    try {
      const result = await operation();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return this.handleAIError(error, context);
    }
  }
}

/**
 * AI Connection Tester - Utilities for testing AI service connectivity
 */
export class AIConnectionTester {
  /**
   * Perform comprehensive AI service health check
   */
  static async performHealthCheck() {
    const results = {
      timestamp: new Date().toISOString(),
      overall: 'unknown',
      checks: {}
    };

    try {
      // Test 1: Service initialization
      results.checks.initialization = await this.testInitialization();
      
      // Test 2: Basic connectivity
      results.checks.connectivity = await this.testConnectivity();
      
      // Test 3: Content generation
      results.checks.contentGeneration = await this.testContentGeneration();
      
      // Test 4: Error handling
      results.checks.errorHandling = await this.testErrorHandling();

      // Determine overall health
      const allPassed = Object.values(results.checks).every(check => check.passed);
      results.overall = allPassed ? 'healthy' : 'degraded';

      logger.info('AI Service health check completed', results);
      return results;
    } catch (error) {
      results.overall = 'unhealthy';
      results.error = error.message;
      logger.error('AI Service health check failed', { error: error.message });
      return results;
    }
  }

  /**
   * Test AI service initialization
   */
  static async testInitialization() {
    try {
      const status = aiService.getStatus();
      return {
        passed: status.ready,
        message: status.ready ? 'Service initialized successfully' : 'Service not initialized',
        details: status
      };
    } catch (error) {
      return {
        passed: false,
        message: 'Initialization test failed',
        error: error.message
      };
    }
  }

  /**
   * Test basic connectivity to Vertex AI
   */
  static async testConnectivity() {
    try {
      const result = await aiService.testConnection();
      return {
        passed: result.success,
        message: result.success ? 'Connectivity test passed' : 'Connectivity test failed',
        details: result
      };
    } catch (error) {
      return {
        passed: false,
        message: 'Connectivity test failed',
        error: error.message
      };
    }
  }

  /**
   * Test content generation functionality
   */
  static async testContentGeneration() {
    try {
      const testPrompt = 'Generate a simple JSON object with a "test" field set to "success".';
      const response = await aiService.generateContent(testPrompt);
      
      const isValidResponse = response && response.length > 0;
      return {
        passed: isValidResponse,
        message: isValidResponse ? 'Content generation test passed' : 'Content generation test failed',
        details: {
          promptLength: testPrompt.length,
          responseLength: response ? response.length : 0,
          response: response ? response.substring(0, 200) + '...' : null
        }
      };
    } catch (error) {
      return {
        passed: false,
        message: 'Content generation test failed',
        error: error.message
      };
    }
  }

  /**
   * Test error handling mechanisms
   */
  static async testErrorHandling() {
    try {
      // Test with invalid/empty prompt
      const errorResult = await AIErrorHandler.withErrorHandling(
        () => aiService.generateContent(''),
        { test: 'error_handling' }
      );

      return {
        passed: !errorResult.success, // Should fail gracefully
        message: 'Error handling test completed',
        details: errorResult
      };
    } catch (error) {
      return {
        passed: false,
        message: 'Error handling test failed',
        error: error.message
      };
    }
  }
}

/**
 * AI Input Validator - Validates inputs for AI operations
 */
export class AIInputValidator {
  /**
   * Validate resume text for analysis
   */
  static validateResumeText(text) {
    const errors = [];

    if (!text || typeof text !== 'string') {
      errors.push('Resume text is required and must be a string');
    }

    if (text && text.length < 50) {
      errors.push('Resume text is too short (minimum 50 characters)');
    }

    if (text && text.length > 10000) {
      errors.push('Resume text is too long (maximum 10,000 characters)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }



  /**
   * Validate interview parameters
   */
  static validateInterviewParams(role, experience) {
    const errors = [];

    if (!role || typeof role !== 'string' || role.length < 2) {
      errors.push('Role is required and must be at least 2 characters');
    }

    if (!experience || typeof experience !== 'string') {
      errors.push('Experience level is required');
    }

    const validExperience = ['entry', 'junior', 'mid', 'senior', 'lead'];
    if (experience && !validExperience.includes(experience.toLowerCase())) {
      errors.push(`Experience must be one of: ${validExperience.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * AI Response Parser - Utilities for parsing and validating AI responses
 */
export class AIResponseParser {
  /**
   * Parse JSON response from AI with error handling
   */
  static parseJSONResponse(response, expectedFields = []) {
    try {
      // Clean the response (remove markdown code blocks if present)
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(cleanResponse);

      // Validate expected fields if provided
      if (expectedFields.length > 0) {
        const missingFields = expectedFields.filter(field => !(field in parsed));
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
      }

      return {
        success: true,
        data: parsed
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse AI response: ${error.message}`,
        rawResponse: response
      };
    }
  }

  /**
   * Validate and clean text response
   */
  static validateTextResponse(response, minLength = 10, maxLength = 5000) {
    if (!response || typeof response !== 'string') {
      return {
        success: false,
        error: 'Response must be a non-empty string'
      };
    }

    const cleaned = response.trim();
    
    if (cleaned.length < minLength) {
      return {
        success: false,
        error: `Response too short (minimum ${minLength} characters)`
      };
    }

    if (cleaned.length > maxLength) {
      return {
        success: false,
        error: `Response too long (maximum ${maxLength} characters)`
      };
    }

    return {
      success: true,
      data: cleaned
    };
  }
}

export default {
  AIErrorHandler,
  AIConnectionTester,
  AIInputValidator,
  AIResponseParser
};