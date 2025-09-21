#!/usr/bin/env node

/**
 * Data Consistency Validation Script
 * Validates data consistency across all features and components
 */

const axios = require('axios');
const mongoose = require('mongoose');

// Import models
const CareerRecommendation = require('../backend/models/CareerRecommendation');
const Assessment = require('../backend/models/Assessment');
const ResumeAnalysis = require('../backend/models/ResumeAnalysis');
const InterviewSession = require('../backend/models/InterviewSession');
const ActivityLog = require('../backend/models/ActivityLog');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/udaan-ai';

class DataConsistencyValidator {
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

  async connectDatabase() {
    try {
      await mongoose.connect(MONGODB_URI);
      this.log('Connected to MongoDB');
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  async setupTestUser() {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/register`, {
        name: 'Data Consistency Test User',
        email: `consistency-test-${Date.now()}@example.com`,
        password: 'testpassword123'
      });

      this.testUserId = response.data.user.id;
      this.authToken = response.data.token;
      this.log('Test user created for consistency validation');
    } catch (error) {
      throw new Error(`Failed to setup test user: ${error.message}`);
    }
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json'
    };
  }

  async validateCareerRecommendationConsistency() {
    await this.test('Career Recommendation Data Consistency', async () => {
      // Create recommendation via API
      const apiResponse = await axios.post(`${BASE_URL}/api/career/generate-recommendations`, {}, {
        headers: this.getAuthHeaders()
      });

      // Verify in database
      const dbRecommendation = await CareerRecommendation.findOne({ userId: this.testUserId });
      
      if (!dbRecommendation) {
        throw new Error('Recommendation not found in database');
      }

      // Verify data consistency
      if (dbRecommendation.recommendations.length === 0) {
        throw new Error('No recommendations generated');
      }

      // Verify API response matches database
      const apiRecommendations = await axios.get(`${BASE_URL}/api/career/recommendations`, {
        headers: this.getAuthHeaders()
      });

      if (apiRecommendations.data.recommendations.length !== dbRecommendation.recommendations.length) {
        throw new Error('API and database recommendation counts do not match');
      }
    });
  }

  async validateAssessmentConsistency() {
    await this.test('Assessment Data Consistency', async () => {
      // Start assessment via API
      const startResponse = await axios.post(`${BASE_URL}/api/assessments/start`, {
        type: 'technical'
      }, {
        headers: this.getAuthHeaders()
      });

      const assessmentId = startResponse.data.assessmentId;

      // Submit answers
      await axios.put(`${BASE_URL}/api/assessments/${assessmentId}/answer`, {
        questionId: 'q1',
        answer: 'test answer'
      }, {
        headers: this.getAuthHeaders()
      });

      // Complete assessment
      const completeResponse = await axios.post(`${BASE_URL}/api/assessments/${assessmentId}/complete`, {}, {
        headers: this.getAuthHeaders()
      });

      // Verify in database
      const dbAssessment = await Assessment.findById(assessmentId);
      
      if (!dbAssessment) {
        throw new Error('Assessment not found in database');
      }

      // Verify consistency
      if (dbAssessment.score !== completeResponse.data.score) {
        throw new Error('API and database scores do not match');
      }

      if (!dbAssessment.completedAt) {
        throw new Error('Assessment completion time not recorded');
      }

      // Verify activity was logged
      const activity = await ActivityLog.findOne({
        userId: this.testUserId,
        activityType: 'assessment',
        'metadata.assessmentId': assessmentId
      });

      if (!activity) {
        throw new Error('Assessment activity not logged');
      }
    });
  }

  async validateResumeAnalysisConsistency() {
    await this.test('Resume Analysis Data Consistency', async () => {
      const testResumeText = `
        John Doe
        Software Engineer
        
        Experience:
        - 3 years at Tech Company as Full Stack Developer
        - Worked with JavaScript, React, Node.js, MongoDB
        
        Skills: JavaScript, React, Node.js, Python
      `;

      // Analyze resume via API
      const analysisResponse = await axios.post(`${BASE_URL}/api/resume/analyze`, {
        resumeText: testResumeText
      }, {
        headers: this.getAuthHeaders()
      });

      // Verify in database
      const dbAnalysis = await ResumeAnalysis.findOne({ userId: this.testUserId });
      
      if (!dbAnalysis) {
        throw new Error('Resume analysis not found in database');
      }

      // Verify data consistency
      if (dbAnalysis.extractedSkills.length !== analysisResponse.data.extractedSkills.length) {
        throw new Error('Extracted skills count mismatch between API and database');
      }

      if (!dbAnalysis.learningPath || dbAnalysis.learningPath.length === 0) {
        throw new Error('Learning path not generated');
      }

      // Verify activity was logged
      const activity = await ActivityLog.findOne({
        userId: this.testUserId,
        activityType: 'resume_upload'
      });

      if (!activity) {
        throw new Error('Resume upload activity not logged');
      }
    });
  }

  async validateInterviewConsistency() {
    await this.test('Interview Session Data Consistency', async () => {
      // Start interview via API
      const startResponse = await axios.post(`${BASE_URL}/api/interviews/start`, {
        type: 'technical'
      }, {
        headers: this.getAuthHeaders()
      });

      const sessionId = startResponse.data.sessionId;

      // Get question
      await axios.get(`${BASE_URL}/api/interviews/${sessionId}/question`, {
        headers: this.getAuthHeaders()
      });

      // Submit answer
      await axios.put(`${BASE_URL}/api/interviews/${sessionId}/answer`, {
        answer: 'This is a test answer for consistency validation.'
      }, {
        headers: this.getAuthHeaders()
      });

      // Complete interview
      const completeResponse = await axios.post(`${BASE_URL}/api/interviews/${sessionId}/complete`, {}, {
        headers: this.getAuthHeaders()
      });

      // Verify in database
      const dbSession = await InterviewSession.findById(sessionId);
      
      if (!dbSession) {
        throw new Error('Interview session not found in database');
      }

      // Verify consistency
      if (dbSession.overallScore !== completeResponse.data.overallScore) {
        throw new Error('Overall scores do not match between API and database');
      }

      if (!dbSession.completedAt) {
        throw new Error('Interview completion time not recorded');
      }

      // Verify activity was logged
      const activity = await ActivityLog.findOne({
        userId: this.testUserId,
        activityType: 'interview',
        'metadata.sessionId': sessionId
      });

      if (!activity) {
        throw new Error('Interview activity not logged');
      }
    });
  }

  async validateActivityLoggingConsistency() {
    await this.test('Activity Logging Consistency', async () => {
      const initialCount = await ActivityLog.countDocuments({ userId: this.testUserId });

      // Perform multiple actions
      await axios.get(`${BASE_URL}/api/career/recommendations`, {
        headers: this.getAuthHeaders()
      });

      await axios.get(`${BASE_URL}/api/assessments/types`, {
        headers: this.getAuthHeaders()
      });

      // Wait a moment for async logging
      await new Promise(resolve => setTimeout(resolve, 1000));

      const finalCount = await ActivityLog.countDocuments({ userId: this.testUserId });

      if (finalCount <= initialCount) {
        throw new Error('Activities not being logged properly');
      }

      // Verify API returns consistent activity data
      const apiActivities = await axios.get(`${BASE_URL}/api/activities/history`, {
        headers: this.getAuthHeaders()
      });

      const dbActivities = await ActivityLog.find({ userId: this.testUserId }).sort({ timestamp: -1 });

      if (apiActivities.data.activities.length !== dbActivities.length) {
        throw new Error('API and database activity counts do not match');
      }
    });
  }

  async validateCrossFeatureConsistency() {
    await this.test('Cross-Feature Data Consistency', async () => {
      // Complete an assessment
      const startResponse = await axios.post(`${BASE_URL}/api/assessments/start`, {
        type: 'technical'
      }, {
        headers: this.getAuthHeaders()
      });

      const assessmentId = startResponse.data.assessmentId;
      
      await axios.post(`${BASE_URL}/api/assessments/${assessmentId}/complete`, {}, {
        headers: this.getAuthHeaders()
      });

      // Check if user stats are updated
      const statsResponse = await axios.get(`${BASE_URL}/api/activities/stats`, {
        headers: this.getAuthHeaders()
      });

      if (statsResponse.data.assessmentsCompleted === 0) {
        throw new Error('User stats not updated after assessment completion');
      }

      // Check if career recommendations are influenced by assessment
      const recommendationsResponse = await axios.get(`${BASE_URL}/api/career/recommendations`, {
        headers: this.getAuthHeaders()
      });

      if (!recommendationsResponse.data.recommendations || recommendationsResponse.data.recommendations.length === 0) {
        throw new Error('Career recommendations not generated based on assessment data');
      }

      // Verify activity timeline includes all actions
      const activitiesResponse = await axios.get(`${BASE_URL}/api/activities/history`, {
        headers: this.getAuthHeaders()
      });

      const hasAssessmentActivity = activitiesResponse.data.activities.some(
        activity => activity.activityType === 'assessment'
      );

      const hasCareerViewActivity = activitiesResponse.data.activities.some(
        activity => activity.activityType === 'career_view'
      );

      if (!hasAssessmentActivity || !hasCareerViewActivity) {
        throw new Error('Activity timeline missing expected activities');
      }
    });
  }

  async validateDataIntegrity() {
    await this.test('Database Data Integrity', async () => {
      // Check for orphaned records
      const assessments = await Assessment.find({ userId: this.testUserId });
      const activities = await ActivityLog.find({ 
        userId: this.testUserId,
        activityType: 'assessment'
      });

      // Verify all assessments have corresponding activities
      for (const assessment of assessments) {
        const hasActivity = activities.some(
          activity => activity.metadata && activity.metadata.assessmentId === assessment._id.toString()
        );
        
        if (!hasActivity) {
          throw new Error(`Assessment ${assessment._id} has no corresponding activity log`);
        }
      }

      // Check for data consistency in references
      const recommendations = await CareerRecommendation.findOne({ userId: this.testUserId });
      if (recommendations) {
        // Verify all referenced skills exist
        for (const rec of recommendations.recommendations) {
          if (!rec.requiredSkills || rec.requiredSkills.length === 0) {
            throw new Error('Career recommendation missing required skills');
          }
        }
      }

      // Check timestamp consistency
      const recentActivities = await ActivityLog.find({ 
        userId: this.testUserId,
        timestamp: { $gte: new Date(Date.now() - 3600000) } // Last hour
      });

      for (const activity of recentActivities) {
        if (activity.timestamp > new Date()) {
          throw new Error('Activity has future timestamp');
        }
      }
    });
  }

  async cleanup() {
    try {
      // Clean up test data
      await CareerRecommendation.deleteMany({ userId: this.testUserId });
      await Assessment.deleteMany({ userId: this.testUserId });
      await ResumeAnalysis.deleteMany({ userId: this.testUserId });
      await InterviewSession.deleteMany({ userId: this.testUserId });
      await ActivityLog.deleteMany({ userId: this.testUserId });

      // Delete test user
      await axios.delete(`${BASE_URL}/api/auth/user`, {
        headers: this.getAuthHeaders()
      });

      this.log('Test data cleaned up');
    } catch (error) {
      this.log(`Cleanup failed: ${error.message}`, 'error');
    }
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

    console.log('\n=== Data Consistency Validation Report ===');
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Success Rate: ${report.summary.successRate}`);

    if (report.summary.failed > 0) {
      console.log('\nFailed Tests:');
      report.tests.filter(test => test.status === 'FAILED').forEach(test => {
        console.log(`- ${test.name}: ${test.error}`);
      });
    }

    return report;
  }

  async run() {
    this.log('Starting data consistency validation...');

    try {
      await this.connectDatabase();
      await this.setupTestUser();

      // Run all validation tests
      await this.validateCareerRecommendationConsistency();
      await this.validateAssessmentConsistency();
      await this.validateResumeAnalysisConsistency();
      await this.validateInterviewConsistency();
      await this.validateActivityLoggingConsistency();
      await this.validateCrossFeatureConsistency();
      await this.validateDataIntegrity();

      const report = await this.generateReport();

      await this.cleanup();
      await mongoose.disconnect();

      if (report.summary.failed > 0) {
        process.exit(1);
      }

    } catch (error) {
      this.log(`Data consistency validation failed: ${error.message}`, 'error');
      await mongoose.disconnect();
      process.exit(1);
    }
  }
}

// Run the validation if this script is executed directly
if (require.main === module) {
  const validator = new DataConsistencyValidator();
  validator.run();
}

module.exports = DataConsistencyValidator;