import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Assessment from '../models/Assessment.js';
import QuestionBank from '../models/QuestionBank.js';
import {
  getAssessmentTypes,
  startAssessment,
  submitAnswer,
  completeAssessment
} from '../controllers/assessmentController.js';

// Load environment variables
dotenv.config();

// Mock request and response objects
function createMockReq(user = null, params = {}, body = {}, query = {}) {
  return {
    user: user || { _id: new mongoose.Types.ObjectId() },
    params,
    body,
    query
  };
}

function createMockRes() {
  const res = {
    statusCode: null,
    jsonData: null,
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.jsonData = data;
      return this;
    }
  };
  return res;
}

async function testAssessmentController() {
  try {
    console.log('🧪 Testing Assessment Controller...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/udaan-ai-test');
    console.log('✅ Connected to database');

    // Test 1: Get Assessment Types
    console.log('\n📋 Test 1: Get Assessment Types');
    const req1 = createMockReq();
    const res1 = createMockRes();
    
    await getAssessmentTypes(req1, res1);
    console.log(`Status: ${res1.statusCode}`);
    console.log(`Success: ${res1.jsonData?.success}`);
    console.log(`Types Count: ${res1.jsonData?.data?.totalTypes}`);

    // Test 2: Start Assessment (should fail - no questions in DB)
    console.log('\n🚀 Test 2: Start Assessment');
    const req2 = createMockReq(null, {}, {
      assessmentType: 'technical',
      difficulty: 'intermediate',
      questionCount: 5
    });
    const res2 = createMockRes();
    
    await startAssessment(req2, res2);
    console.log(`Status: ${res2.statusCode}`);
    console.log(`Success: ${res2.jsonData?.success}`);
    console.log(`Message: ${res2.jsonData?.message}`);

    // Test 3: Create some test questions first
    console.log('\n📝 Creating test questions...');
    const testQuestions = [
      {
        category: 'technical',
        subcategory: 'programming',
        difficulty: 'intermediate',
        question: 'What is JavaScript?',
        questionType: 'multiple-choice',
        options: [
          { text: 'A programming language', isCorrect: true },
          { text: 'A markup language', isCorrect: false },
          { text: 'A database', isCorrect: false },
          { text: 'An operating system', isCorrect: false }
        ],
        correctAnswer: 'A programming language',
        explanation: 'JavaScript is a programming language used for web development.',
        tags: ['javascript', 'programming', 'web'],
        points: 1,
        isActive: true
      },
      {
        category: 'technical',
        subcategory: 'programming',
        difficulty: 'intermediate',
        question: 'What does HTML stand for?',
        questionType: 'multiple-choice',
        options: [
          { text: 'Hypertext Markup Language', isCorrect: true },
          { text: 'High Tech Modern Language', isCorrect: false },
          { text: 'Home Tool Markup Language', isCorrect: false },
          { text: 'Hyperlink and Text Markup Language', isCorrect: false }
        ],
        correctAnswer: 'Hypertext Markup Language',
        explanation: 'HTML stands for Hypertext Markup Language.',
        tags: ['html', 'web', 'markup'],
        points: 1,
        isActive: true
      }
    ];

    // Clear existing questions and insert test questions
    await QuestionBank.deleteMany({});
    await QuestionBank.insertMany(testQuestions);
    console.log(`✅ Created ${testQuestions.length} test questions`);

    // Test 4: Start Assessment (should succeed now)
    console.log('\n🚀 Test 4: Start Assessment (with questions)');
    const req4 = createMockReq(null, {}, {
      assessmentType: 'technical',
      difficulty: 'intermediate',
      questionCount: 2
    });
    const res4 = createMockRes();
    
    await startAssessment(req4, res4);
    console.log(`Status: ${res4.statusCode}`);
    console.log(`Success: ${res4.jsonData?.success}`);
    console.log(`Assessment ID: ${res4.jsonData?.data?.assessmentId}`);
    console.log(`Questions Count: ${res4.jsonData?.data?.totalQuestions}`);

    if (res4.jsonData?.success && res4.jsonData?.data?.assessmentId) {
      const assessmentId = res4.jsonData.data.assessmentId;
      const questions = res4.jsonData.data.questions;

      // Test 5: Submit Answer
      console.log('\n✍️ Test 5: Submit Answer');
      const req5 = createMockReq(req4.user, { id: assessmentId }, {
        questionId: questions[0].questionId,
        answer: 'A programming language',
        timeSpent: 30
      });
      const res5 = createMockRes();
      
      await submitAnswer(req5, res5);
      console.log(`Status: ${res5.statusCode}`);
      console.log(`Success: ${res5.jsonData?.success}`);
      console.log(`Is Correct: ${res5.jsonData?.data?.isCorrect}`);
      console.log(`Progress: ${res5.jsonData?.data?.progress}%`);

      // Submit answer for second question
      const req5b = createMockReq(req4.user, { id: assessmentId }, {
        questionId: questions[1].questionId,
        answer: 'Hypertext Markup Language',
        timeSpent: 25
      });
      const res5b = createMockRes();
      
      await submitAnswer(req5b, res5b);
      console.log(`Second answer - Status: ${res5b.statusCode}, Progress: ${res5b.jsonData?.data?.progress}%`);

      // Test 6: Complete Assessment
      console.log('\n🏁 Test 6: Complete Assessment');
      const req6 = createMockReq(req4.user, { id: assessmentId });
      const res6 = createMockRes();
      
      await completeAssessment(req6, res6);
      console.log(`Status: ${res6.statusCode}`);
      console.log(`Success: ${res6.jsonData?.success}`);
      console.log(`Final Score: ${res6.jsonData?.data?.score}%`);
      console.log(`Performance: ${res6.jsonData?.data?.performance}`);
      console.log(`Correct Answers: ${res6.jsonData?.data?.correctAnswers}/${res6.jsonData?.data?.totalQuestions}`);
    }

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the test
testAssessmentController();