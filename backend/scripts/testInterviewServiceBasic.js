#!/usr/bin/env node

/**
 * Basic test runner for InterviewService
 * Tests core functionality without requiring Jest setup
 */

import InterviewService from '../services/InterviewService.js';
import mongoose from 'mongoose';

console.log('🧪 Running Basic InterviewService Tests...\n');

let testsPassed = 0;
let testsTotal = 0;

function runTest(testName, testFn) {
  testsTotal++;
  try {
    const result = testFn();
    if (result === true || (typeof result === 'object' && result.success)) {
      console.log(`✅ ${testName}: PASS`);
      testsPassed++;
    } else {
      console.log(`❌ ${testName}: FAIL - ${result.message || 'Test returned false'}`);
    }
  } catch (error) {
    console.log(`❌ ${testName}: ERROR - ${error.message}`);
  }
}

// Test 1: Basic response analysis
runTest('Basic Response Analysis', () => {
  const result = InterviewService.analyzeResponse(
    'I have experience with JavaScript and React',
    'Describe your technical experience',
    'technical',
    'technical'
  );
  
  return result && 
         typeof result.score === 'number' && 
         result.score >= 0 && 
         result.score <= 10 &&
         typeof result.completeness === 'number' &&
         typeof result.clarity === 'number' &&
         typeof result.relevance === 'number' &&
         typeof result.confidence === 'number';
});

// Test 2: Empty response handling
runTest('Empty Response Handling', () => {
  const result = InterviewService.analyzeResponse('', 'Test question', 'technical', 'technical');
  return result && result.score === 0 && Array.isArray(result.insights);
});

// Test 3: Null response handling
runTest('Null Response Handling', () => {
  const result = InterviewService.analyzeResponse(null, 'Test question', 'technical', 'technical');
  return result && result.score === 0;
});

// Test 4: Completeness analysis
runTest('Completeness Analysis', () => {
  const shortScore = InterviewService.analyzeCompleteness(10, 'technical');
  const longScore = InterviewService.analyzeCompleteness(150, 'technical');
  return shortScore < longScore && shortScore >= 0 && longScore <= 10;
});

// Test 5: Clarity analysis
runTest('Clarity Analysis', () => {
  const clearResponse = 'This is a clear response. It has good structure.';
  const unclearResponse = 'This is like um you know basically unclear.';
  
  const clearScore = InterviewService.analyzeClarity(12, 2, clearResponse);
  const unclearScore = InterviewService.analyzeClarity(15, 1, unclearResponse);
  
  return clearScore > unclearScore;
});

// Test 6: Confidence analysis
runTest('Confidence Analysis', () => {
  const confidentResponse = 'I am confident I can solve this problem successfully.';
  const uncertainResponse = 'I think maybe I could probably try to solve this.';
  
  const confidentScore = InterviewService.analyzeConfidence(confidentResponse);
  const uncertainScore = InterviewService.analyzeConfidence(uncertainResponse);
  
  return confidentScore > uncertainScore;
});

// Test 7: Sentiment analysis
runTest('Sentiment Analysis', () => {
  const positiveResponse = 'I achieved excellent results and successfully improved performance.';
  const negativeResponse = 'I failed and struggled with difficult problems.';
  
  const positiveScore = InterviewService.analyzeSentiment(positiveResponse);
  const negativeScore = InterviewService.analyzeSentiment(negativeResponse);
  
  return positiveScore > negativeScore;
});

// Test 8: Overall score calculation
runTest('Overall Score Calculation', () => {
  const analysis = {
    completeness: 8,
    clarity: 7,
    relevance: 9,
    confidence: 6,
    structureScore: 7,
    sentimentScore: 2
  };
  
  const score = InterviewService.calculateOverallScore(analysis);
  return score >= 0 && score <= 10 && typeof score === 'number';
});

// Test 9: STAR structure analysis
runTest('STAR Structure Analysis', () => {
  const starResponse = 'In a challenging situation, my task was to improve performance. I took action by implementing new processes. The result was significant improvement.';
  const nonStarResponse = 'I have good leadership skills.';
  
  const starScore = InterviewService.analyzeStarStructure(starResponse);
  const nonStarScore = InterviewService.analyzeStarStructure(nonStarResponse);
  
  return starScore > nonStarScore;
});

// Test 10: Technical structure analysis
runTest('Technical Structure Analysis', () => {
  const technicalResponse = 'The problem required analyzing complexity and implementing an efficient solution.';
  const nonTechnicalResponse = 'I like working with technology.';
  
  const technicalScore = InterviewService.analyzeTechnicalStructure(technicalResponse);
  const nonTechnicalScore = InterviewService.analyzeTechnicalStructure(nonTechnicalResponse);
  
  return technicalScore >= nonTechnicalScore;
});

// Test 11: Category keywords
runTest('Category Keywords', () => {
  const technicalKeywords = InterviewService.getCategoryKeywords('technical', 'technical');
  const behavioralKeywords = InterviewService.getCategoryKeywords('behavioral', 'behavioral');
  
  return Array.isArray(technicalKeywords) && 
         Array.isArray(behavioralKeywords) &&
         technicalKeywords.includes('algorithm') &&
         behavioralKeywords.includes('team');
});

// Test 12: STAR synonyms
runTest('STAR Synonyms', () => {
  const situationSynonyms = InterviewService.getStarSynonyms('situation');
  const actionSynonyms = InterviewService.getStarSynonyms('action');
  
  return Array.isArray(situationSynonyms) &&
         Array.isArray(actionSynonyms) &&
         situationSynonyms.includes('situation') &&
         actionSynonyms.includes('action');
});

// Test 13: Performance levels
runTest('Performance Levels', () => {
  const excellent = InterviewService.getPerformanceLevel(95);
  const good = InterviewService.getPerformanceLevel(85);
  const average = InterviewService.getPerformanceLevel(75);
  const belowAverage = InterviewService.getPerformanceLevel(65);
  const needsImprovement = InterviewService.getPerformanceLevel(45);
  
  return excellent === 'Excellent' &&
         good === 'Good' &&
         average === 'Average' &&
         belowAverage === 'Below Average' &&
         needsImprovement === 'Needs Improvement';
});

// Test 14: Detailed feedback generation
runTest('Detailed Feedback Generation', () => {
  const analysis = {
    score: 8,
    completeness: 8,
    clarity: 7,
    relevance: 9,
    confidence: 6,
    structureScore: 7,
    sentimentScore: 2
  };
  
  const feedback = InterviewService.generateDetailedFeedback(analysis, 'technical');
  return typeof feedback === 'string' && feedback.length > 0;
});

// Test 15: Strengths identification
runTest('Strengths Identification', () => {
  const analysis = {
    completeness: 8,
    clarity: 8,
    relevance: 9,
    confidence: 8,
    structureScore: 8,
    sentimentScore: 3
  };
  
  const strengths = InterviewService.identifyStrengths(analysis);
  return Array.isArray(strengths) && strengths.length > 0;
});

// Test 16: Improvements identification
runTest('Improvements Identification', () => {
  const analysis = {
    completeness: 3,
    clarity: 4,
    relevance: 3,
    confidence: 2,
    structureScore: 3,
    sentimentScore: -1
  };
  
  const improvements = InterviewService.identifyImprovements(analysis, 'behavioral');
  return Array.isArray(improvements) && improvements.length > 0;
});

// Test 17: Long response handling
runTest('Long Response Handling', () => {
  const longResponse = 'This is a very long response. '.repeat(200);
  const result = InterviewService.analyzeResponse(longResponse, 'Question?', 'technical', 'technical');
  
  return result && typeof result.score === 'number' && result.score >= 0;
});

// Test 18: Special characters handling
runTest('Special Characters Handling', () => {
  const specialResponse = 'I work with C++, .NET, SQL (MySQL & PostgreSQL). Success rate: 95%!';
  const result = InterviewService.analyzeResponse(specialResponse, 'Technical experience?', 'technical', 'technical');
  
  return result && typeof result.score === 'number' && result.score >= 0;
});

// Test 19: Relevance analysis with keywords
runTest('Relevance Analysis with Keywords', () => {
  const relevantResponse = 'I have worked extensively with JavaScript frameworks including React and Angular.';
  const irrelevantResponse = 'I enjoy cooking and playing sports.';
  
  const relevantScore = InterviewService.analyzeRelevance(relevantResponse, 'Describe your JavaScript experience', 'technical', 'technical');
  const irrelevantScore = InterviewService.analyzeRelevance(irrelevantResponse, 'Describe your JavaScript experience', 'technical', 'technical');
  
  return relevantScore > irrelevantScore;
});

// Test 20: Comprehensive feedback structure
async function testComprehensiveFeedback() {
  const mockSession = {
    sessionType: 'behavioral',
    overallScore: 75,
    questions: [
      {
        questionId: '1',
        question: 'Tell me about a challenge',
        category: 'behavioral',
        isAnswered: true,
        userAnswer: { text: 'I faced a difficult situation where I had to lead a team through a crisis.' },
        feedback: {}
      }
    ]
  };
  
  try {
    const feedback = await InterviewService.generateComprehensiveFeedback(mockSession);
    
    return feedback &&
           typeof feedback.communication === 'object' &&
           typeof feedback.technicalAccuracy === 'object' &&
           typeof feedback.confidence === 'object' &&
           typeof feedback.problemSolving === 'object' &&
           typeof feedback.overall === 'string' &&
           Array.isArray(feedback.improvementAreas) &&
           Array.isArray(feedback.strengths) &&
           Array.isArray(feedback.nextSteps);
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Run the async test separately
testComprehensiveFeedback().then(result => {
  testsTotal++;
  if (result === true || (typeof result === 'object' && result.success)) {
    console.log(`✅ Comprehensive Feedback Structure: PASS`);
    testsPassed++;
  } else {
    console.log(`❌ Comprehensive Feedback Structure: FAIL - ${result.message || 'Test returned false'}`);
  }
  
  console.log(`\n📊 Test Results: ${testsPassed}/${testsTotal} tests passed`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All tests passed! InterviewService is working correctly.');
  } else {
    console.log(`⚠️  ${testsTotal - testsPassed} tests failed. Please review the implementation.`);
  }
  
  console.log('\n✅ InterviewService basic validation completed!');
}).catch(error => {
  console.error(`❌ Comprehensive Feedback Structure: ERROR - ${error.message}`);
  testsTotal++;
  console.log(`\n📊 Test Results: ${testsPassed}/${testsTotal} tests passed`);
  console.log(`⚠️  ${testsTotal - testsPassed} tests failed. Please review the implementation.`);
  console.log('\n✅ InterviewService basic validation completed!');
});

// Results will be printed by the async test