import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Assessment from '../models/Assessment.js';
import QuestionBank from '../models/QuestionBank.js';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Simple test endpoints
app.get('/test/assessment-types', async (req, res) => {
  try {
    const statistics = await QuestionBank.getStatistics();
    res.json({ success: true, statistics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/test/create-questions', async (req, res) => {
  try {
    // Create test questions
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

    await QuestionBank.deleteMany({});
    const created = await QuestionBank.insertMany(testQuestions);
    res.json({ success: true, created: created.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

async function startServer() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/udaan-ai-test');
    console.log('✅ Connected to database');

    const server = app.listen(3001, () => {
      console.log('🚀 Test server running on port 3001');
      console.log('📋 Test endpoints:');
      console.log('  GET  http://localhost:3001/test/assessment-types');
      console.log('  POST http://localhost:3001/test/create-questions');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🔌 Shutting down server...');
      server.close();
      await mongoose.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();