import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Assessment from '../models/Assessment.js';
import QuestionBank from '../models/QuestionBank.js';

// Load environment variables
dotenv.config();

async function validateModels() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/udaan-ai';
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Test Assessment model creation
    console.log('\n🧪 Testing Assessment Model...');
    
    const testUserId = new mongoose.Types.ObjectId();
    const assessmentData = {
      userId: testUserId,
      assessmentType: 'technical',
      title: 'Test JavaScript Assessment',
      description: 'A test assessment for JavaScript fundamentals',
      questions: [
        {
          questionId: 'q1',
          question: 'What is JavaScript?',
          questionType: 'multiple-choice',
          options: ['Programming language', 'Database', 'Framework', 'Library'],
          correctAnswer: 'Programming language',
          points: 1
        },
        {
          questionId: 'q2',
          question: 'What is a variable?',
          questionType: 'multiple-choice',
          options: ['Container for data', 'Function', 'Loop', 'Object'],
          correctAnswer: 'Container for data',
          points: 2
        }
      ],
      difficulty: 'beginner'
    };

    const assessment = new Assessment(assessmentData);
    const savedAssessment = await assessment.save();
    console.log('✅ Assessment model validation passed');
    console.log(`   - Assessment ID: ${savedAssessment._id}`);
    console.log(`   - Total Questions: ${savedAssessment.totalQuestions}`);
    console.log(`   - Status: ${savedAssessment.status}`);

    // Test Assessment methods
    console.log('\n🔧 Testing Assessment Methods...');
    
    // Test startAssessment
    await savedAssessment.startAssessment();
    console.log('✅ startAssessment() method works');
    console.log(`   - Status: ${savedAssessment.status}`);
    console.log(`   - Started At: ${savedAssessment.startedAt}`);

    // Test submitAnswer
    const questionId = savedAssessment.questions[0]._id;
    await savedAssessment.submitAnswer(questionId, 'Programming language', 30);
    console.log('✅ submitAnswer() method works');
    
    const updatedQuestion = savedAssessment.questions.id(questionId);
    console.log(`   - User Answer: ${updatedQuestion.userAnswer}`);
    console.log(`   - Is Correct: ${updatedQuestion.isCorrect}`);
    console.log(`   - Time Spent: ${updatedQuestion.timeSpent}s`);

    // Test calculateScore
    const score = savedAssessment.calculateScore();
    console.log('✅ calculateScore() method works');
    console.log(`   - Score: ${score}%`);
    console.log(`   - Correct Answers: ${savedAssessment.correctAnswers}`);

    // Test completeAssessment
    await savedAssessment.completeAssessment();
    console.log('✅ completeAssessment() method works');
    console.log(`   - Status: ${savedAssessment.status}`);
    console.log(`   - Completed At: ${savedAssessment.completedAt}`);
    console.log(`   - Total Time Spent: ${savedAssessment.timeSpent}s`);

    // Test QuestionBank model creation
    console.log('\n🧪 Testing QuestionBank Model...');
    
    const questionData = {
      category: 'technical',
      subcategory: 'javascript',
      difficulty: 'beginner',
      question: 'What is the correct way to declare a variable in JavaScript?',
      questionType: 'multiple-choice',
      options: [
        { text: 'var myVariable;', isCorrect: true },
        { text: 'variable myVariable;', isCorrect: false },
        { text: 'v myVariable;', isCorrect: false },
        { text: 'declare myVariable;', isCorrect: false }
      ],
      explanation: 'In JavaScript, variables can be declared using var, let, or const keywords.',
      tags: ['javascript', 'variables', 'syntax'],
      points: 1,
      timeLimit: 30
    };

    const question = new QuestionBank(questionData);
    const savedQuestion = await question.save();
    console.log('✅ QuestionBank model validation passed');
    console.log(`   - Question ID: ${savedQuestion._id}`);
    console.log(`   - Category: ${savedQuestion.category}`);
    console.log(`   - Difficulty: ${savedQuestion.difficulty}`);
    console.log(`   - Correct Answer: ${savedQuestion.correctAnswer}`);
    console.log(`   - Is Active: ${savedQuestion.isActive}`);

    // Test QuestionBank static methods
    console.log('\n🔧 Testing QuestionBank Methods...');
    
    // Test getQuestionsByCriteria
    const questions = await QuestionBank.getQuestionsByCriteria({
      category: 'technical',
      difficulty: 'beginner',
      limit: 5
    });
    console.log('✅ getQuestionsByCriteria() method works');
    console.log(`   - Found ${questions.length} questions`);

    // Test getStatistics
    const stats = await QuestionBank.getStatistics();
    console.log('✅ getStatistics() method works');
    console.log(`   - Statistics entries: ${stats.length}`);

    // Test getUserHistory
    const history = await Assessment.getUserHistory(testUserId);
    console.log('✅ getUserHistory() method works');
    console.log(`   - Found ${history.length} assessments for user`);

    // Test getUserStats
    const userStats = await Assessment.getUserStats(testUserId);
    console.log('✅ getUserStats() method works');
    console.log(`   - Statistics entries: ${userStats.length}`);

    // Clean up test data
    await Assessment.deleteOne({ _id: savedAssessment._id });
    await QuestionBank.deleteOne({ _id: savedQuestion._id });
    console.log('\n🧹 Cleaned up test data');

    console.log('\n✅ All model validations passed successfully!');
    
  } catch (error) {
    console.error('❌ Model validation failed:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    throw error;
  } finally {
    try {
      await mongoose.connection.close();
      console.log('✅ Database connection closed');
    } catch (error) {
      console.error('❌ Error closing database connection:', error.message);
    }
  }
}

// Run the validation if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateModels();
}

export default validateModels;