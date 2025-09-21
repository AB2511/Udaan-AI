/**
 * System Routes
 * Health checks and system status endpoints for AI service monitoring
 */

import express from 'express';
import aiService from '../services/aiService.js';
import enhancedAIErrorHandler from '../services/AIErrorHandlingService.js';
import aiConfig from '../config/ai.js';

const router = express.Router();

/**
 * GET /api/system/health
 * Get overall system health status
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = enhancedAIErrorHandler.getSystemHealth();
    
    res.json({
      success: true,
      data: {
        status: healthStatus.overall,
        services: {
          aiService: {
            isHealthy: healthStatus.aiService.isHealthy,
            degradationLevel: healthStatus.aiService.degradationLevel,
            successRate: healthStatus.aiService.successRate,
            averageResponseTime: healthStatus.aiService.averageResponseTime,
            consecutiveFailures: healthStatus.aiService.consecutiveFailures,
            lastError: healthStatus.aiService.lastError
          },
          fallbackService: {
            available: healthStatus.fallbackService.available
          }
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get system health status',
      details: error.message
    });
  }
});

/**
 * GET /api/system/ai-status
 * Get detailed AI service status
 */
router.get('/ai-status', async (req, res) => {
  try {
    const isReady = aiService.isReady();
    const healthStatus = enhancedAIErrorHandler.getSystemHealth();
    
    res.json({
      success: true,
      data: {
        isReady,
        isInitialized: aiService.isInitialized,
        configuration: {
          model: aiConfig.vertexAI.model,
          projectId: aiConfig.googleCloud.projectId,
          location: aiConfig.googleCloud.location,
          maxTokens: aiConfig.vertexAI.maxTokens,
          temperature: aiConfig.vertexAI.temperature,
          timeout: aiConfig.service.timeout,
          maxRetries: aiConfig.service.maxRetries
        },
        health: healthStatus.aiService,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get AI service status',
      details: error.message
    });
  }
});

/**
 * POST /api/system/ai-health-check
 * Perform comprehensive AI health check
 */
router.post('/ai-health-check', async (req, res) => {
  try {
    const healthCheck = await aiService.testConnection();
    
    res.json({
      success: true,
      data: {
        connectionTest: healthCheck,
        systemHealth: enhancedAIErrorHandler.getSystemHealth(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error.message
    });
  }
});

/**
 * POST /api/system/test-ai-connection
 * Test AI service connectivity
 */
router.post('/test-ai-connection', async (req, res) => {
  try {
    const connectionTest = await aiService.testConnection();
    
    if (connectionTest.success) {
      res.json({
        success: true,
        data: connectionTest,
        message: 'AI service connection test successful'
      });
    } else {
      res.status(503).json({
        success: false,
        error: connectionTest.error,
        data: connectionTest,
        fallbackAvailable: true
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Connection test failed',
      details: error.message,
      fallbackAvailable: true
    });
  }
});

/**
 * GET /api/system/metrics
 * Get system performance metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const healthStatus = enhancedAIErrorHandler.getSystemHealth();
    
    res.json({
      success: true,
      data: {
        aiService: {
          totalRequests: healthStatus.aiService.totalRequests,
          successfulRequests: healthStatus.aiService.successfulRequests,
          failedRequests: healthStatus.aiService.failedRequests,
          successRate: healthStatus.aiService.successRate,
          averageResponseTime: healthStatus.aiService.averageResponseTime,
          consecutiveFailures: healthStatus.aiService.consecutiveFailures
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get system metrics',
      details: error.message
    });
  }
});

/**
 * POST /api/system/recover-ai-service
 * Attempt to recover AI service
 */
router.post('/recover-ai-service', async (req, res) => {
  try {
    // Attempt to reinitialize the AI service
    await aiService.initialize();
    
    // Test the connection
    const connectionTest = await aiService.testConnection();
    
    if (connectionTest.success) {
      res.json({
        success: true,
        message: 'AI service recovery successful',
        data: connectionTest
      });
    } else {
      res.status(503).json({
        success: false,
        error: 'AI service recovery failed',
        details: connectionTest.error,
        fallbackAvailable: true
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Recovery attempt failed',
      details: error.message,
      fallbackAvailable: true
    });
  }
});

/**
 * POST /api/system/reset-health-monitor
 * Reset health monitoring state
 */
router.post('/reset-health-monitor', async (req, res) => {
  try {
    // Stop and restart health monitoring
    enhancedAIErrorHandler.stopMonitoring();
    enhancedAIErrorHandler.startMonitoring();
    
    res.json({
      success: true,
      message: 'Health monitor reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to reset health monitor',
      details: error.message
    });
  }
});

/**
 * GET /api/system/ai-diagnostics
 * Get comprehensive AI service diagnostics
 */
router.get('/ai-diagnostics', async (req, res) => {
  try {
    const diagnostics = {
      service: {
        isReady: aiService.isReady(),
        isInitialized: aiService.isInitialized
      },
      configuration: {
        valid: true,
        model: aiConfig.vertexAI.model,
        projectId: aiConfig.googleCloud.projectId,
        location: aiConfig.googleCloud.location,
        credentialsPath: aiConfig.googleCloud.credentials
      },
      health: enhancedAIErrorHandler.getSystemHealth(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
        hasProjectId: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
        hasLocation: !!process.env.GOOGLE_CLOUD_LOCATION
      },
      timestamp: new Date().toISOString()
    };
    
    // Test basic connectivity if service is ready
    if (aiService.isReady()) {
      try {
        const connectionTest = await aiService.testConnection();
        diagnostics.connectivity = connectionTest;
      } catch (error) {
        diagnostics.connectivity = {
          success: false,
          error: error.message
        };
      }
    }
    
    res.json({
      success: true,
      data: diagnostics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get diagnostics',
      details: error.message
    });
  }
});

/**
 * POST /api/system/test-ai-operation
 * Test specific AI operation with fallback
 */
router.post('/test-ai-operation', async (req, res) => {
  const { operation, testData } = req.body;
  
  try {
    let result;
    
    switch (operation) {
      case 'resume_analysis':
        result = await enhancedAIErrorHandler.handleAIOperation(
          () => aiService.analyzeResume(testData.resumeText || 'Test resume', testData.userProfile || {}),
          'resume_analysis',
          { resumeText: testData.resumeText, userProfile: testData.userProfile }
        );
        break;
        
      case 'content_generation':
        result = await enhancedAIErrorHandler.handleAIOperation(
          () => aiService.generateContent(testData.prompt || 'Test prompt'),
          'content_generation',
          { prompt: testData.prompt }
        );
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid operation type',
          supportedOperations: ['resume_analysis', 'content_generation']
        });
    }
    
    res.json({
      success: true,
      data: result,
      message: `${operation} test completed`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `${operation} test failed`,
      details: error.message,
      fallbackAvailable: true
    });
  }
});

export default router;