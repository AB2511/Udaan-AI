#!/usr/bin/env node

/**
 * Comprehensive Integration Validation Script
 * Tests all components and workflows for the career platform enhancements
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

class IntegrationValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
    this.authToken = null;
    this.testUserId = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async test(name, testFn) {
    try {
      this.log(`Running test: ${name}`);
      await testFn();
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASSED' });
      this.log(`Test passed: ${name}`, 'success');
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAILED', error: error.message });
      this.log(`Test failed: ${name} - ${error.message}`, 'error');
    }
  }

  async setupTestUser() {
    try {
      // Register test user
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
        name: 'Integration Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'testpassword123'
      });

      this.testUserId = registerResponse.data.user.id;
      this.authToken = registerResponse.data.token;

      this.log('Test user created successfully');
    } catch (error) {
      // Try to login if user already exists
      try {
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: 'test@example.com',
          password: 'testpassword123'
        });
        
        this.testUserId = loginResponse.data.user.id;
        this.authToken = loginResponse.data.token;
        this.log('Using existing test user');
      } catch (loginError) {
        throw new Error('Failed to setup test user');
      }
    }
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json'
    };
  }

  async validateBackendEndpoints() {
    await this.test('Backend Health Check', async () => {
      const response = await axios.get(`${BASE_URL}/api/health`);
      if (response.status !== 200) {
        throw new Error('Backend health check failed');
      }
    });

    await this.test('Career Recommendations API', async () => {
      const response = await axios.get(`${BASE_URL}/api/career/recommendations`, {
        headers: this.getAuthHeaders()
      });
      if (response.status !== 200) {
        throw new Error('Career recommendations API failed');
      }
    });

    await this.test('Assessment Types API', async () => {
      const response = await axios.get(`${BASE_URL}/api/assessments/types`, {
        headers: this.getAuthHeaders()
      });
      if (response.status !== 200) {
        throw new Error('Assessment types API failed');
      }
    });

    await this.test('Activity History API', async () => {
      const response = await axios.get(`${BASE_URL}/api/activities/history`, {
        headers: this.getAuthHeaders()
      });
      if (response.status !== 200) {
        throw new Error('Activity history API failed');
      }
    });

    await this.test('Interview Types API', async () => {
      const response = await axios.get(`${BASE_URL}/api/interviews/types`, {
        headers: this.getAuthHeaders()
      });
      if (response.status !== 200) {
        throw new Error('Interview types API failed');
      }
    });
  }

  async validateCompleteWorkflows() {
    await this.test('Complete Assessment Workflow', async () => {
      // Start assessment
      const startResponse = await axios.post(`${BASE_URL}/api/assessments/start`, {
        type: 'technical'
      }, {
        headers: this.getAuthHeaders()
      });

      const assessmentId = startResponse.data.assessmentId;

      // Submit answers
      const submitResponse = await axios.put(`${BASE_URL}/api/assessments/${assessmentId}/answer`, {
        questionId: 'q1',
        answer: 'test answer'
      }, {
        headers: this.getAuthHeaders()
      });

      // Complete assessment
      const completeResponse = await axios.post(`${BASE_URL}/api/assessments/${assessmentId}/complete`, {}, {
        headers: this.getAuthHeaders()
      });

      if (completeResponse.status !== 200 || !completeResponse.data.score) {
        throw new Error('Assessment workflow incomplete');
      }
    });

    await this.test('Complete Interview Workflow', async () => {
      // Start interview
      const startResponse = await axios.post(`${BASE_URL}/api/interviews/start`, {
        type: 'technical'
      }, {
        headers: this.getAuthHeaders()
      });

      const sessionId = startResponse.data.sessionId;

      // Get question
      const questionResponse = await axios.get(`${BASE_URL}/api/interviews/${sessionId}/question`, {
        headers: this.getAuthHeaders()
      });

      // Submit answer
      const answerResponse = await axios.put(`${BASE_URL}/api/interviews/${sessionId}/answer`, {
        answer: 'This is a test answer for the interview question.'
      }, {
        headers: this.getAuthHeaders()
      });

      // Complete interview
      const completeResponse = await axios.post(`${BASE_URL}/api/interviews/${sessionId}/complete`, {}, {
        headers: this.getAuthHeaders()
      });

      if (completeResponse.status !== 200 || !completeResponse.data.feedback) {
        throw new Error('Interview workflow incomplete');
      }
    });

    await this.test('Resume Upload and Analysis Workflow', async () => {
      // Create a test resume file
      const testResumeContent = `
        John Doe
        Software Engineer
        
        Experience:
        - 3 years at Tech Company as Full Stack Developer
        - Worked with JavaScript, React, Node.js, MongoDB
        
        Education:
        - Bachelor's in Computer Science
        
        Skills:
        - JavaScript, React, Node.js, MongoDB, Python
      `;

      // Note: This is a simplified test - in real scenario we'd upload actual file
      const uploadResponse = await axios.post(`${BASE_URL}/api/resume/analyze`, {
        resumeText: testResumeContent
      }, {
        headers: this.getAuthHeaders()
      });

      if (uploadResponse.status !== 200 || !uploadResponse.data.extractedSkills) {
        throw new Error('Resume analysis workflow failed');
      }
    });
  }

  async validateDataConsistency() {
    await this.test('User Activity Logging', async () => {
      // Perform an action that should be logged
      await axios.get(`${BASE_URL}/api/career/recommendations`, {
        headers: this.getAuthHeaders()
      });

      // Check if activity was logged
      const activityResponse = await axios.get(`${BASE_URL}/api/activities/history`, {
        headers: this.getAuthHeaders()
      });

      const activities = activityResponse.data.activities;
      const hasRecentActivity = activities.some(activity => 
        activity.activityType === 'career_view' && 
        new Date(activity.timestamp) > new Date(Date.now() - 60000) // Within last minute
      );

      if (!hasRecentActivity) {
        throw new Error('Activity logging not working properly');
      }
    });

    await this.test('Assessment Progress Tracking', async () => {
      // Get user stats before
      const statsBefore = await axios.get(`${BASE_URL}/api/activities/stats`, {
        headers: this.getAuthHeaders()
      });

      // Complete an assessment
      const startResponse = await axios.post(`${BASE_URL}/api/assessments/start`, {
        type: 'soft-skills'
      }, {
        headers: this.getAuthHeaders()
      });

      const assessmentId = startResponse.data.assessmentId;
      
      await axios.post(`${BASE_URL}/api/assessments/${assessmentId}/complete`, {}, {
        headers: this.getAuthHeaders()
      });

      // Get user stats after
      const statsAfter = await axios.get(`${BASE_URL}/api/activities/stats`, {
        headers: this.getAuthHeaders()
      });

      if (statsAfter.data.assessmentsCompleted <= statsBefore.data.assessmentsCompleted) {
        throw new Error('Assessment progress not being tracked');
      }
    });
  }

  async validateFrontendIntegration() {
    await this.test('Frontend Accessibility', async () => {
      // Check if frontend is running
      try {
        const response = await axios.get(FRONTEND_URL);
        if (response.status !== 200) {
          throw new Error('Frontend not accessible');
        }
      } catch (error) {
        throw new Error('Frontend server not running');
      }
    });

    await this.test('API Integration from Frontend', async () => {
      // This would typically be done with a headless browser
      // For now, we'll just verify the API endpoints are accessible
      const endpoints = [
        '/api/career/recommendations',
        '/api/assessments/types',
        '/api/activities/history',
        '/api/interviews/types'
      ];

      for (const endpoint of endpoints) {
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
          headers: this.getAuthHeaders()
        });
        if (response.status !== 200) {
          throw new Error(`Frontend API integration failed for ${endpoint}`);
        }
      }
    });
  }

  async validatePerformance() {
    await this.test('API Response Times', async () => {
      const endpoints = [
        '/api/career/recommendations',
        '/api/assessments/types',
        '/api/activities/history'
      ];

      for (const endpoint of endpoints) {
        const startTime = Date.now();
        await axios.get(`${BASE_URL}${endpoint}`, {
          headers: this.getAuthHeaders()
        });
        const responseTime = Date.now() - startTime;

        if (responseTime > 5000) { // 5 seconds threshold
          throw new Error(`${endpoint} response time too slow: ${responseTime}ms`);
        }
      }
    });

    await this.test('Concurrent User Handling', async () => {
      // Simulate multiple concurrent requests
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          axios.get(`${BASE_URL}/api/career/recommendations`, {
            headers: this.getAuthHeaders()
          })
        );
      }

      const results = await Promise.allSettled(promises);
      const failures = results.filter(result => result.status === 'rejected');

      if (failures.length > 2) { // Allow up to 2 failures
        throw new Error(`Too many concurrent request failures: ${failures.length}/10`);
      }
    });
  }

  async validateSecurity() {
    await this.test('Authentication Required', async () => {
      try {
        await axios.get(`${BASE_URL}/api/career/recommendations`);
        throw new Error('Unauthenticated request should have failed');
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // This is expected - authentication is required
          return;
        }
        throw error;
      }
    });

    await this.test('Input Validation', async () => {
      try {
        await axios.post(`${BASE_URL}/api/assessments/start`, {
          type: 'invalid_type'
        }, {
          headers: this.getAuthHeaders()
        });
        throw new Error('Invalid input should have been rejected');
      } catch (error) {
        if (error.response && error.response.status === 400) {
          // This is expected - invalid input should be rejected
          return;
        }
        throw error;
      }
    });
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.passed + this.results.failed,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: `${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(2)}%`
      },
      tests: this.results.tests
    };

    const reportPath = path.join(__dirname, '..', 'integration-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.log(`Integration test report generated: ${reportPath}`);
    return report;
  }

  async run() {
    this.log('Starting comprehensive integration validation...');

    try {
      await this.setupTestUser();

      // Run all validation categories
      await this.validateBackendEndpoints();
      await this.validateCompleteWorkflows();
      await this.validateDataConsistency();
      await this.validateFrontendIntegration();
      await this.validatePerformance();
      await this.validateSecurity();

      const report = await this.generateReport();

      this.log(`Integration validation completed!`);
      this.log(`Results: ${report.summary.passed} passed, ${report.summary.failed} failed`);
      this.log(`Success rate: ${report.summary.successRate}`);

      if (report.summary.failed > 0) {
        process.exit(1);
      }

    } catch (error) {
      this.log(`Integration validation failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run the validation if this script is executed directly
if (require.main === module) {
  const validator = new IntegrationValidator();
  validator.run();
}

module.exports = IntegrationValidator;