import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Testing basic imports...');

try {
  // Test Assessment model import
  const Assessment = await import('../models/Assessment.js');
  console.log('✅ Assessment model imported');

  // Test QuestionBank model import
  const QuestionBank = await import('../models/QuestionBank.js');
  console.log('✅ QuestionBank model imported');

  // Test controller import
  const controller = await import('../controllers/assessmentController.js');
  console.log('✅ Controller imported');
  console.log('Available exports:', Object.keys(controller));

  // Connect to database
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/udaan-ai-test');
  console.log('✅ Connected to database');

  // Test QuestionBank statistics
  const stats = await QuestionBank.default.getStatistics();
  console.log('✅ QuestionBank statistics:', stats.length, 'entries');

  await mongoose.disconnect();
  console.log('✅ All tests passed');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
}