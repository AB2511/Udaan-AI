import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

// Sample resume content for testing
const SAMPLE_RESUME_TEXT = `
John Doe
Software Engineer

Contact Information:
Email: john.doe@email.com
Phone: (555) 123-4567

Experience:
Software Engineer at Tech Corp
January 2020 - Present
• Developed web applications using JavaScript, React, and Node.js
• Implemented RESTful APIs and worked with MongoDB databases
• Collaborated with cross-functional teams using Agile methodologies
• Mentored junior developers and conducted code reviews

Junior Developer at StartupXYZ
June 2018 - December 2019
• Built responsive web interfaces using HTML, CSS, and JavaScript
• Integrated third-party APIs and payment systems
• Participated in daily standups and sprint planning

Education:
Bachelor of Computer Science
University of Technology
2014-2018
GPA: 3.7/4.0

Skills:
Programming Languages: JavaScript, Python, Java, TypeScript
Frontend: React, Vue.js, HTML5, CSS3, Bootstrap
Backend: Node.js, Express.js, Django, Spring Boot
Databases: MongoDB, PostgreSQL, MySQL
Tools: Git, Docker, Jenkins, AWS, Jira

Certifications:
AWS Certified Developer Associate (2021)
Scrum Master Certification (2020)

Projects:
E-commerce Platform - Built a full-stack e-commerce application using React and Node.js
Task Management App - Developed a collaborative task management tool with real-time updates
`;

class ResumeEndpointValidator {
  constructor() {
    this.authToken = null;
    this.testResults = [];
  }

  async validateEndpoints() {
    console.log('🚀 Starting Resume API Endpoint Validation\n');

    try {
      // Step 1: Authenticate
      await this.authenticate();

      // Step 2: Test resume upload
      await this.testResumeUpload();

      // Step 3: Test analysis retrieval
      await this.testAnalysisRetrieval();

      // Step 4: Test learning path
      await this.testLearningPath();

      // Step 5: Test progress update
      await this.testProgressUpdate();

      // Step 6: Test history
      await this.testAnalysisHistory();

      // Summary
      this.printSummary();

    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  }

  async authenticate() {
    console.log('🔐 Authenticating...');
    
    try {
      // Try to register first (in case user doesn't exist)
      const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        })
      });

      // Login (whether register succeeded or failed)
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        })
      });

      if (!loginResponse.ok) {
        throw new Error(`Login failed: ${loginResponse.status}`);
      }

      const loginData = await loginResponse.json();
      this.authToken = loginData.data.token;
      
      this.addResult('Authentication', true, 'Successfully authenticated');
      console.log('✅ Authentication successful\n');

    } catch (error) {
      this.addResult('Authentication', false, error.message);
      throw error;
    }
  }

  async testResumeUpload() {
    console.log('📄 Testing resume upload...');

    try {
      // Create a temporary text file with resume content
      const tempFilePath = path.join(__dirname, 'temp-resume.txt');
      fs.writeFileSync(tempFilePath, SAMPLE_RESUME_TEXT);

      // Create form data
      const formData = new FormData();
      const fileBuffer = fs.readFileSync(tempFilePath);
      const blob = new Blob([fileBuffer], { type: 'text/plain' });
      formData.append('resume', blob, 'test-resume.txt');

      const response = await fetch(`${BASE_URL}/api/resume/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        },
        body: formData
      });

      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Upload failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(`Upload failed: ${data.error?.message || 'Unknown error'}`);
      }

      // Store analysis ID for later tests
      this.analysisId = data.data.analysisId;

      this.addResult('Resume Upload', true, `File uploaded successfully. Analysis ID: ${this.analysisId}`);
      console.log('✅ Resume upload successful');
      console.log(`   Analysis ID: ${this.analysisId}`);
      console.log(`   Extracted Skills: ${data.data.extractedSkills.length}`);
      console.log(`   Processing Status: ${data.data.processingStatus}\n`);

    } catch (error) {
      this.addResult('Resume Upload', false, error.message);
      console.log(`❌ Resume upload failed: ${error.message}\n`);
    }
  }

  async testAnalysisRetrieval() {
    console.log('📊 Testing analysis retrieval...');

    try {
      // Test getting latest analysis
      const latestResponse = await fetch(`${BASE_URL}/api/resume/analysis`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (!latestResponse.ok) {
        const errorData = await latestResponse.json();
        throw new Error(`Get latest analysis failed: ${latestResponse.status} - ${errorData.error?.message}`);
      }

      const latestData = await latestResponse.json();

      if (!latestData.success) {
        throw new Error(`Get latest analysis failed: ${latestData.error?.message}`);
      }

      // Test getting specific analysis by ID
      if (this.analysisId) {
        const specificResponse = await fetch(`${BASE_URL}/api/resume/analysis/${this.analysisId}`, {
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        });

        if (!specificResponse.ok) {
          const errorData = await specificResponse.json();
          throw new Error(`Get specific analysis failed: ${specificResponse.status} - ${errorData.error?.message}`);
        }

        const specificData = await specificResponse.json();

        if (!specificData.success) {
          throw new Error(`Get specific analysis failed: ${specificData.error?.message}`);
        }
      }

      this.addResult('Analysis Retrieval', true, 'Successfully retrieved analysis data');
      console.log('✅ Analysis retrieval successful');
      console.log(`   Processing Status: ${latestData.data.processingStatus}`);
      console.log(`   Extracted Skills: ${latestData.data.extractedSkills?.length || 0}`);
      console.log(`   Experience Entries: ${latestData.data.experience?.length || 0}`);
      console.log(`   Education Entries: ${latestData.data.education?.length || 0}\n`);

    } catch (error) {
      this.addResult('Analysis Retrieval', false, error.message);
      console.log(`❌ Analysis retrieval failed: ${error.message}\n`);
    }
  }

  async testLearningPath() {
    console.log('🎯 Testing learning path...');

    try {
      const response = await fetch(`${BASE_URL}/api/resume/learning-path`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // 202 is acceptable (processing)
        if (response.status === 202) {
          this.addResult('Learning Path', true, 'Analysis still processing (202 status)');
          console.log('⏳ Learning path - Analysis still processing\n');
          return;
        }
        
        throw new Error(`Get learning path failed: ${response.status} - ${errorData.error?.message}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(`Get learning path failed: ${data.error?.message}`);
      }

      this.addResult('Learning Path', true, 'Successfully retrieved learning path');
      console.log('✅ Learning path retrieval successful');
      console.log(`   Learning Items: ${data.data.learningPath?.length || 0}`);
      console.log(`   Skill Gaps: ${data.data.skillGaps?.length || 0}`);
      console.log(`   High Priority Items: ${data.data.highPriorityItems?.length || 0}\n`);

    } catch (error) {
      this.addResult('Learning Path', false, error.message);
      console.log(`❌ Learning path failed: ${error.message}\n`);
    }
  }

  async testProgressUpdate() {
    console.log('📈 Testing progress update...');

    if (!this.analysisId) {
      this.addResult('Progress Update', false, 'No analysis ID available for testing');
      console.log('❌ Progress update skipped - No analysis ID\n');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/resume/learning-path/${this.analysisId}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          skill: 'python',
          status: 'in-progress'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // 404 is acceptable if the skill doesn't exist in learning path
        if (response.status === 404 && errorData.error?.code === 'LEARNING_ITEM_NOT_FOUND') {
          this.addResult('Progress Update', true, 'Correctly handled non-existent learning item (404)');
          console.log('✅ Progress update - Correctly handled non-existent item\n');
          return;
        }
        
        throw new Error(`Update progress failed: ${response.status} - ${errorData.error?.message}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(`Update progress failed: ${data.error?.message}`);
      }

      this.addResult('Progress Update', true, 'Successfully updated learning progress');
      console.log('✅ Progress update successful');
      console.log(`   Updated Skill: ${data.data.skill}`);
      console.log(`   New Status: ${data.data.status}\n`);

    } catch (error) {
      this.addResult('Progress Update', false, error.message);
      console.log(`❌ Progress update failed: ${error.message}\n`);
    }
  }

  async testAnalysisHistory() {
    console.log('📚 Testing analysis history...');

    try {
      const response = await fetch(`${BASE_URL}/api/resume/history`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Get history failed: ${response.status} - ${errorData.error?.message}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(`Get history failed: ${data.error?.message}`);
      }

      this.addResult('Analysis History', true, 'Successfully retrieved analysis history');
      console.log('✅ Analysis history retrieval successful');
      console.log(`   Total Analyses: ${data.data.pagination.total}`);
      console.log(`   Current Page: ${data.data.pagination.page}`);
      console.log(`   Items per Page: ${data.data.pagination.limit}\n`);

    } catch (error) {
      this.addResult('Analysis History', false, error.message);
      console.log(`❌ Analysis history failed: ${error.message}\n`);
    }
  }

  addResult(test, success, message) {
    this.testResults.push({ test, success, message });
  }

  printSummary() {
    console.log('📋 VALIDATION SUMMARY');
    console.log('='.repeat(50));

    let passed = 0;
    let total = this.testResults.length;

    this.testResults.forEach(result => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.test}: ${result.message}`);
      if (result.success) passed++;
    });

    console.log('='.repeat(50));
    console.log(`Results: ${passed}/${total} tests passed`);

    if (passed === total) {
      console.log('🎉 All resume API endpoints are working correctly!');
    } else {
      console.log('⚠️  Some tests failed. Please check the implementation.');
      process.exit(1);
    }
  }
}

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ResumeEndpointValidator();
  validator.validateEndpoints().catch(error => {
    console.error('Validation script failed:', error);
    process.exit(1);
  });
}

export default ResumeEndpointValidator;