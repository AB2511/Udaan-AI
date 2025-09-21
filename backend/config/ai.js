/**
 * AI Service Configuration
 * Configuration settings for Google Cloud Vertex AI integration
 */

import dotenv from 'dotenv';

dotenv.config();

const aiConfig = {
  // Google Cloud Configuration
  googleCloud: {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'udaan-ai',
    location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS
  },

  // Vertex AI Model Configuration
  vertexAI: {
    model: process.env.VERTEX_AI_MODEL || 'gemini-2.5-flash',
    maxTokens: parseInt(process.env.VERTEX_AI_MAX_TOKENS) || 8192,
    temperature: parseFloat(process.env.VERTEX_AI_TEMPERATURE) || 0.7,
    topP: parseFloat(process.env.VERTEX_AI_TOP_P) || 0.8,
    topK: parseInt(process.env.VERTEX_AI_TOP_K) || 40
  },

  // Service Configuration
  service: {
    timeout: parseInt(process.env.AI_SERVICE_TIMEOUT) || 30000,
    maxRetries: parseInt(process.env.AI_SERVICE_MAX_RETRIES) || 3,
    rateLimit: parseInt(process.env.AI_SERVICE_RATE_LIMIT) || 100,
    retryDelay: 1000, // Base delay for exponential backoff
    maxRetryDelay: 10000 // Maximum delay between retries
  },

  // Prompt Templates Configuration
  prompts: {
    resumeAnalysis: {
      maxInputLength: 10000,
      responseFormat: 'json'
    },
    assessmentGeneration: {
      maxQuestions: 10,
      minQuestions: 5,
      responseFormat: 'json'
    },
    interviewQuestions: {
      maxQuestions: 8,
      minQuestions: 3,
      responseFormat: 'json'
    },
    interviewEvaluation: {
      maxFeedbackLength: 2000,
      responseFormat: 'json'
    }
  },

  // Error Handling Configuration
  errorHandling: {
    enableFallbacks: true,
    logErrors: true,
    enableGracefulDegradation: true
  },

  // Caching Configuration
  caching: {
    enabled: process.env.NODE_ENV === 'production',
    ttl: 3600, // 1 hour in seconds
    maxCacheSize: 1000 // Maximum number of cached responses
  }
};

// Validation function for required configuration
export const validateAIConfig = () => {
  const errors = [];

  if (!aiConfig.googleCloud.projectId) {
    errors.push('GOOGLE_CLOUD_PROJECT_ID is required');
  }

  if (!aiConfig.googleCloud.location) {
    errors.push('GOOGLE_CLOUD_LOCATION is required');
  }

  if (!aiConfig.googleCloud.credentials) {
    errors.push('GOOGLE_APPLICATION_CREDENTIALS is required');
  }

  if (errors.length > 0) {
    throw new Error(`AI Configuration validation failed: ${errors.join(', ')}`);
  }

  return true;
};

export default aiConfig;