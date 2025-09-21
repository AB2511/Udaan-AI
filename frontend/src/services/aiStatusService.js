/**
 * AI Status Service - Enhanced for Hackathon Prototype
 * Provides real-time AI service status monitoring and user feedback
 */

class AIStatusService {
  constructor() {
    this.status = 'unknown';
    this.lastCheck = null;
    this.listeners = new Set();
    this.checkInterval = null;
    this.isChecking = false;
  }

  /**
   * Initialize the AI status service
   */
  initialize() {
    this.startPeriodicChecks();
    this.checkStatus(); // Initial check
  }

  /**
   * Start periodic status checks
   */
  startPeriodicChecks() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    // Check every 5 minutes
    this.checkInterval = setInterval(() => {
      this.checkStatus();
    }, 5 * 60 * 1000);
  }

  /**
   * Stop periodic status checks
   */
  stopPeriodicChecks() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check AI service status
   */
  async checkStatus() {
    if (this.isChecking) return this.status;
    
    this.isChecking = true;
    
    try {
      const response = await fetch('/api/system/ai-status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      const newStatus = data.success ? 'healthy' : 'unhealthy';
      this.updateStatus(newStatus, data);
      
      return newStatus;
    } catch (error) {
      console.warn('AI status check failed:', error.message);
      this.updateStatus('error', { error: error.message });
      return 'error';
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Update status and notify listeners
   */
  updateStatus(newStatus, details = {}) {
    const previousStatus = this.status;
    this.status = newStatus;
    this.lastCheck = new Date();
    
    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener({
          status: newStatus,
          previousStatus,
          lastCheck: this.lastCheck,
          details,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Error notifying AI status listener:', error);
      }
    });
  }

  /**
   * Subscribe to status changes
   */
  subscribe(listener) {
    this.listeners.add(listener);
    
    // Immediately notify with current status
    if (this.status !== 'unknown') {
      listener({
        status: this.status,
        lastCheck: this.lastCheck,
        timestamp: Date.now()
      });
    }
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get current status
   */
  getCurrentStatus() {
    return {
      status: this.status,
      lastCheck: this.lastCheck,
      isHealthy: this.status === 'healthy',
      timestamp: Date.now()
    };
  }

  /**
   * Force a status check
   */
  async forceCheck() {
    return await this.checkStatus();
  }

  /**
   * Get status display information
   */
  getStatusDisplay() {
    const statusConfig = {
      healthy: {
        color: 'green',
        icon: '✅',
        message: 'AI Service Online',
        description: 'All AI features are working normally'
      },
      unhealthy: {
        color: 'orange',
        icon: '⚠️',
        message: 'AI Service Issues',
        description: 'Some AI features may be limited'
      },
      error: {
        color: 'red',
        icon: '❌',
        message: 'AI Service Offline',
        description: 'AI features are currently unavailable'
      },
      unknown: {
        color: 'gray',
        icon: '❓',
        message: 'Checking AI Status',
        description: 'Verifying AI service availability'
      }
    };

    return statusConfig[this.status] || statusConfig.unknown;
  }

  /**
   * Get fallback message for AI operations
   */
  getFallbackMessage(operation = 'general') {
    const fallbackMessages = {
      resume_analysis: {
        title: 'AI Analysis Temporarily Unavailable',
        message: 'We\'re experiencing temporary issues with our AI service. Please try again in a few minutes, or contact support if the problem persists.',
        action: 'Try Again Later'
      },
      job_recommendations: {
        title: 'Job Recommendations Unavailable',
        message: 'Our AI-powered job recommendation service is temporarily offline. We\'re working to restore it quickly.',
        action: 'Check Back Soon'
      },
      interview_questions: {
        title: 'Interview Questions Unavailable',
        message: 'The AI interview question generator is currently unavailable. Please try the feature again later.',
        action: 'Try Again Later'
      },
      general: {
        title: 'AI Service Temporarily Unavailable',
        message: 'Our AI features are temporarily offline. We\'re working to restore full functionality.',
        action: 'Please Try Again'
      }
    };

    return fallbackMessages[operation] || fallbackMessages.general;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopPeriodicChecks();
    this.listeners.clear();
  }
}

// Export singleton instance
const aiStatusService = new AIStatusService();

export default aiStatusService;