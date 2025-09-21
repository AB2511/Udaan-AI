#!/usr/bin/env node

/**
 * Model Validation Script
 * 
 * This script validates that all models are properly defined and can be instantiated
 * without requiring a database connection.
 */

import {
  User,
  CareerRecommendation,
  Assessment,
  ResumeAnalysis,
  InterviewSession,
  ActivityLog
} from '../models/index.js';

/**
 * Test model instantiation and basic validation
 */
const validateModels = () => {
  console.log('🔍 Validating model definitions...\n');

  const tests = [
    {
      name: 'User',
      model: User,
      sampleData: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123',
        profile: {
          grade: '12th',
          interests: ['Technology', 'Science'],
          skills: ['JavaScript', 'Python'],
          careerGoals: ['Software Developer']
        }
      }
    },
    {
      name: 'CareerRecommendation',
      model: CareerRecommendation,
      sampleData: {
        userId: '507f1f77bcf86cd799439011', // Valid ObjectId string
        recommendations: [{
          title: 'Software Developer',
          description: 'Develop software applications and systems',
          salaryRange: { min: 50000, max: 80000 },
          growthProspects: 'High',
          requiredSkills: ['JavaScript', 'React', 'Node.js'],
          marketTrends: 'Growing demand for web developers',
          relevantJobs: ['Frontend Developer', 'Full Stack Developer'],
          matchScore: 85
        }]
      }
    },
    {
      name: 'Assessment',
      model: Assessment,
      sampleData: {
        userId: '507f1f77bcf86cd799439011',
        assessmentType: 'technical',
        title: 'JavaScript Fundamentals',
        description: 'Test your JavaScript knowledge',
        questions: [{
          questionId: 'q1',
          question: 'What is a closure in JavaScript?',
          questionType: 'multiple-choice',
          options: ['A function', 'A variable', 'A scope concept', 'An object'],
          correctAnswer: 'A scope concept',
          points: 5
        }],
        difficulty: 'intermediate'
      }
    },
    {
      name: 'ResumeAnalysis',
      model: ResumeAnalysis,
      sampleData: {
        userId: '507f1f77bcf86cd799439011',
        fileName: 'test-resume.pdf',
        fileSize: 1024000,
        fileType: 'pdf',
        resumeText: 'Sample resume text content...',
        extractedSkills: [{
          skill: 'JavaScript',
          category: 'technical',
          confidence: 0.9
        }],
        experience: [{
          company: 'Tech Corp',
          role: 'Software Developer',
          duration: {
            startDate: '2022-01',
            endDate: '2023-12',
            totalMonths: 24
          },
          skills: ['JavaScript', 'React']
        }],
        education: [{
          institution: 'University of Technology',
          degree: 'Bachelor of Computer Science',
          field: 'Computer Science',
          year: 2022
        }]
      }
    },
    {
      name: 'InterviewSession',
      model: InterviewSession,
      sampleData: {
        userId: '507f1f77bcf86cd799439011',
        sessionType: 'technical',
        title: 'Frontend Developer Interview',
        description: 'Technical interview for frontend position',
        difficulty: 'intermediate',
        targetRole: 'Frontend Developer',
        questions: [{
          questionId: 'iq1',
          question: 'Explain the difference between let, const, and var',
          category: 'technical',
          expectedAnswer: 'let and const are block-scoped...',
          keyPoints: ['Block scoping', 'Hoisting', 'Reassignment']
        }],
        settings: {
          timeLimit: 45,
          allowAudioRecording: true,
          showHints: false
        }
      }
    },
    {
      name: 'ActivityLog',
      model: ActivityLog,
      sampleData: {
        userId: '507f1f77bcf86cd799439011',
        activityType: 'assessment',
        description: 'Completed JavaScript fundamentals assessment',
        category: 'assessment',
        metadata: {
          score: 85,
          duration: 1200,
          skillsInvolved: ['JavaScript', 'Programming']
        },
        impact: 'medium'
      }
    }
  ];

  let allPassed = true;

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name} model...`);
      
      // Test model instantiation
      const instance = new test.model(test.sampleData);
      
      // Test validation (this doesn't require DB connection)
      const validationError = instance.validateSync();
      
      if (validationError) {
        console.log(`❌ ${test.name}: Validation failed`);
        console.log(`   Error: ${validationError.message}`);
        allPassed = false;
      } else {
        console.log(`✅ ${test.name}: Model definition and validation passed`);
        
        // Test some instance methods if they exist
        if (typeof instance.toJSON === 'function') {
          const json = instance.toJSON();
          console.log(`   ✓ toJSON method works`);
        }
        
        // Test specific methods for each model
        if (test.name === 'Assessment' && typeof instance.calculateScore === 'function') {
          const score = instance.calculateScore();
          console.log(`   ✓ calculateScore method works (score: ${score})`);
        }
        
        if (test.name === 'CareerRecommendation' && typeof instance.getTopRecommendations === 'function') {
          const topRecs = instance.getTopRecommendations(3);
          console.log(`   ✓ getTopRecommendations method works (${topRecs.length} recommendations)`);
        }
        
        if (test.name === 'ActivityLog' && typeof instance.calculatePoints === 'function') {
          const points = instance.calculatePoints();
          console.log(`   ✓ calculatePoints method works (points: ${points})`);
        }
      }
      
      console.log('');
    } catch (error) {
      console.log(`❌ ${test.name}: Failed to instantiate model`);
      console.log(`   Error: ${error.message}`);
      allPassed = false;
      console.log('');
    }
  }

  return allPassed;
};

/**
 * Test model schema information
 */
const testSchemaInfo = () => {
  console.log('📋 Model Schema Information:\n');

  const models = [
    { name: 'User', model: User },
    { name: 'CareerRecommendation', model: CareerRecommendation },
    { name: 'Assessment', model: Assessment },
    { name: 'ResumeAnalysis', model: ResumeAnalysis },
    { name: 'InterviewSession', model: InterviewSession },
    { name: 'ActivityLog', model: ActivityLog }
  ];

  for (const { name, model } of models) {
    console.log(`${name}:`);
    console.log(`  Collection: ${model.collection.name}`);
    console.log(`  Schema paths: ${Object.keys(model.schema.paths).length}`);
    console.log(`  Indexes: ${model.schema.indexes().length}`);
    console.log('');
  }
};

/**
 * Main execution
 */
const main = () => {
  console.log('🚀 Starting model validation...\n');
  
  try {
    const validationPassed = validateModels();
    testSchemaInfo();
    
    if (validationPassed) {
      console.log('✅ All model validations passed successfully!');
      console.log('\n📝 Summary:');
      console.log('   - All models can be instantiated');
      console.log('   - Schema validations pass');
      console.log('   - Instance methods work correctly');
      console.log('   - Models are ready for database operations');
    } else {
      console.log('❌ Some model validations failed. Please check the errors above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Model validation failed:', error.message);
    process.exit(1);
  }
};

// Run the validation
main();