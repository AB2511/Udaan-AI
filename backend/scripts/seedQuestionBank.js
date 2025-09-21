import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { QuestionBank } from '../models/index.js';

// Load environment variables
dotenv.config();

const questionBankData = [
  // Technical - JavaScript Questions
  {
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
  },
  {
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'intermediate',
    question: 'What will be the output of: console.log(typeof null)?',
    questionType: 'multiple-choice',
    options: [
      { text: 'null', isCorrect: false },
      { text: 'object', isCorrect: true },
      { text: 'undefined', isCorrect: false },
      { text: 'string', isCorrect: false }
    ],
    explanation: 'This is a well-known quirk in JavaScript where typeof null returns "object".',
    tags: ['javascript', 'typeof', 'null'],
    points: 2,
    timeLimit: 45
  },
  {
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'advanced',
    question: 'Explain the concept of closures in JavaScript and provide an example.',
    questionType: 'open-ended',
    correctAnswer: 'A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned.',
    explanation: 'Closures allow functions to access variables from their lexical scope.',
    tags: ['javascript', 'closures', 'scope'],
    points: 5,
    timeLimit: 300
  },

  // Technical - Python Questions
  {
    category: 'technical',
    subcategory: 'python',
    difficulty: 'beginner',
    question: 'Which of the following is the correct way to create a list in Python?',
    questionType: 'multiple-choice',
    options: [
      { text: 'list = []', isCorrect: true },
      { text: 'list = ()', isCorrect: false },
      { text: 'list = {}', isCorrect: false },
      { text: 'list = ""', isCorrect: false }
    ],
    explanation: 'Square brackets [] are used to create lists in Python.',
    tags: ['python', 'lists', 'data-structures'],
    points: 1,
    timeLimit: 30
  },
  {
    category: 'technical',
    subcategory: 'python',
    difficulty: 'intermediate',
    question: 'What is the difference between a list and a tuple in Python?',
    questionType: 'open-ended',
    correctAnswer: 'Lists are mutable (can be changed) while tuples are immutable (cannot be changed after creation).',
    explanation: 'Lists use square brackets and are mutable, tuples use parentheses and are immutable.',
    tags: ['python', 'lists', 'tuples', 'mutability'],
    points: 3,
    timeLimit: 120
  },

  // Soft Skills Questions
  {
    category: 'soft-skills',
    subcategory: 'communication',
    difficulty: 'beginner',
    question: 'What is the most important aspect of effective communication?',
    questionType: 'multiple-choice',
    options: [
      { text: 'Speaking loudly', isCorrect: false },
      { text: 'Active listening', isCorrect: true },
      { text: 'Using complex vocabulary', isCorrect: false },
      { text: 'Talking fast', isCorrect: false }
    ],
    explanation: 'Active listening is fundamental to effective communication as it shows respect and ensures understanding.',
    tags: ['communication', 'listening', 'interpersonal'],
    points: 2,
    timeLimit: 45
  },
  {
    category: 'soft-skills',
    subcategory: 'teamwork',
    difficulty: 'intermediate',
    question: 'How would you handle a conflict with a team member?',
    questionType: 'scenario-based',
    correctAnswer: 'Address the issue directly and professionally, seek to understand their perspective, and work together to find a solution.',
    explanation: 'Conflict resolution requires open communication, empathy, and collaborative problem-solving.',
    tags: ['teamwork', 'conflict-resolution', 'collaboration'],
    points: 4,
    timeLimit: 180
  },

  // Behavioral Questions
  {
    category: 'behavioral',
    subcategory: 'leadership',
    difficulty: 'intermediate',
    question: 'Describe a time when you had to lead a project under tight deadlines.',
    questionType: 'open-ended',
    correctAnswer: 'Should include situation, task, action, and result (STAR method).',
    explanation: 'Behavioral questions assess past experiences to predict future performance.',
    tags: ['leadership', 'project-management', 'deadlines'],
    points: 4,
    timeLimit: 240
  },
  {
    category: 'behavioral',
    subcategory: 'problem-solving',
    difficulty: 'intermediate',
    question: 'Tell me about a challenging problem you solved at work.',
    questionType: 'open-ended',
    correctAnswer: 'Should demonstrate analytical thinking, creativity, and persistence.',
    explanation: 'This question evaluates problem-solving skills and approach to challenges.',
    tags: ['problem-solving', 'analytical-thinking', 'challenges'],
    points: 4,
    timeLimit: 240
  },

  // HR Questions
  {
    category: 'hr',
    subcategory: 'motivation',
    difficulty: 'beginner',
    question: 'What motivates you in your work?',
    questionType: 'open-ended',
    correctAnswer: 'Should reflect genuine personal motivations and align with role requirements.',
    explanation: 'This question helps assess cultural fit and intrinsic motivation.',
    tags: ['motivation', 'self-awareness', 'career-goals'],
    points: 3,
    timeLimit: 120
  },
  {
    category: 'hr',
    subcategory: 'career-goals',
    difficulty: 'beginner',
    question: 'Where do you see yourself in 5 years?',
    questionType: 'open-ended',
    correctAnswer: 'Should show ambition, realistic planning, and alignment with career path.',
    explanation: 'This question evaluates long-term thinking and career planning.',
    tags: ['career-goals', 'planning', 'ambition'],
    points: 3,
    timeLimit: 120
  },

  // Personality Assessment
  {
    category: 'personality',
    subcategory: 'work-style',
    difficulty: 'beginner',
    question: 'Do you prefer working independently or in a team?',
    questionType: 'multiple-choice',
    options: [
      { text: 'Always independently', isCorrect: false },
      { text: 'Always in a team', isCorrect: false },
      { text: 'It depends on the task and situation', isCorrect: true },
      { text: 'I have no preference', isCorrect: false }
    ],
    explanation: 'Flexibility in work style shows adaptability and situational awareness.',
    tags: ['work-style', 'flexibility', 'adaptability'],
    points: 2,
    timeLimit: 60
  },

  // Cognitive Assessment
  {
    category: 'cognitive',
    subcategory: 'logical-reasoning',
    difficulty: 'intermediate',
    question: 'If all roses are flowers, and some flowers fade quickly, can we conclude that some roses fade quickly?',
    questionType: 'true-false',
    options: [
      { text: 'True', isCorrect: false },
      { text: 'False', isCorrect: true }
    ],
    explanation: 'This is a logical fallacy. We cannot conclude that some roses fade quickly based on the given information.',
    tags: ['logical-reasoning', 'critical-thinking', 'deduction'],
    points: 3,
    timeLimit: 90
  },

  // Domain-Specific - Data Science
  {
    category: 'domain-specific',
    subcategory: 'data-science',
    difficulty: 'intermediate',
    question: 'What is the difference between supervised and unsupervised learning?',
    questionType: 'open-ended',
    correctAnswer: 'Supervised learning uses labeled data to train models, while unsupervised learning finds patterns in unlabeled data.',
    explanation: 'This is a fundamental concept in machine learning and data science.',
    tags: ['machine-learning', 'supervised-learning', 'unsupervised-learning'],
    points: 4,
    timeLimit: 180
  },

  // Domain-Specific - Web Development
  {
    category: 'domain-specific',
    subcategory: 'web-development',
    difficulty: 'beginner',
    question: 'What does HTML stand for?',
    questionType: 'multiple-choice',
    options: [
      { text: 'Hyper Text Markup Language', isCorrect: true },
      { text: 'High Tech Modern Language', isCorrect: false },
      { text: 'Home Tool Markup Language', isCorrect: false },
      { text: 'Hyperlink and Text Markup Language', isCorrect: false }
    ],
    explanation: 'HTML stands for Hyper Text Markup Language and is the standard markup language for web pages.',
    tags: ['html', 'web-development', 'markup'],
    points: 1,
    timeLimit: 30
  },

  // Additional Technical Questions - React
  {
    category: 'technical',
    subcategory: 'react',
    difficulty: 'intermediate',
    question: 'What is the purpose of useEffect hook in React?',
    questionType: 'multiple-choice',
    options: [
      { text: 'To perform side effects in functional components', isCorrect: true },
      { text: 'To create state variables', isCorrect: false },
      { text: 'To handle form submissions', isCorrect: false },
      { text: 'To create component props', isCorrect: false }
    ],
    explanation: 'useEffect is used to perform side effects in functional components, such as data fetching, subscriptions, or DOM manipulation.',
    tags: ['react', 'hooks', 'useeffect'],
    points: 3,
    timeLimit: 60
  },

  // Additional Soft Skills - Time Management
  {
    category: 'soft-skills',
    subcategory: 'time-management',
    difficulty: 'intermediate',
    question: 'What is the most effective way to prioritize tasks?',
    questionType: 'multiple-choice',
    options: [
      { text: 'Do the easiest tasks first', isCorrect: false },
      { text: 'Use the Eisenhower Matrix (urgent/important)', isCorrect: true },
      { text: 'Work on tasks randomly', isCorrect: false },
      { text: 'Always do the longest tasks first', isCorrect: false }
    ],
    explanation: 'The Eisenhower Matrix helps categorize tasks by urgency and importance, leading to better prioritization.',
    tags: ['time-management', 'prioritization', 'productivity'],
    points: 3,
    timeLimit: 45
  },

  // Additional Behavioral - Adaptability
  {
    category: 'behavioral',
    subcategory: 'adaptability',
    difficulty: 'intermediate',
    question: 'Describe a time when you had to adapt to a significant change at work.',
    questionType: 'open-ended',
    correctAnswer: 'Should demonstrate flexibility, positive attitude, and successful adaptation using STAR method.',
    explanation: 'This question assesses adaptability and resilience in the face of change.',
    tags: ['adaptability', 'change-management', 'resilience'],
    points: 4,
    timeLimit: 240
  },

  // Additional Cognitive - Pattern Recognition
  {
    category: 'cognitive',
    subcategory: 'pattern-recognition',
    difficulty: 'advanced',
    question: 'What comes next in this sequence: 2, 6, 12, 20, 30, ?',
    questionType: 'multiple-choice',
    options: [
      { text: '40', isCorrect: false },
      { text: '42', isCorrect: true },
      { text: '36', isCorrect: false },
      { text: '45', isCorrect: false }
    ],
    explanation: 'The pattern is n(n+1) where n starts at 1: 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42.',
    tags: ['pattern-recognition', 'mathematics', 'sequences'],
    points: 5,
    timeLimit: 120
  },

  // True/False Questions
  {
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'beginner',
    question: 'JavaScript is a statically typed language.',
    questionType: 'true-false',
    options: [
      { text: 'True', isCorrect: false },
      { text: 'False', isCorrect: true }
    ],
    explanation: 'JavaScript is a dynamically typed language, not statically typed.',
    tags: ['javascript', 'typing', 'fundamentals'],
    points: 1,
    timeLimit: 30
  },

  // Coding Question
  {
    category: 'technical',
    subcategory: 'algorithms',
    difficulty: 'advanced',
    question: 'Write a function to reverse a string without using built-in reverse methods.',
    questionType: 'coding',
    correctAnswer: 'function reverseString(str) { let reversed = ""; for (let i = str.length - 1; i >= 0; i--) { reversed += str[i]; } return reversed; }',
    explanation: 'This solution iterates through the string backwards and builds a new string.',
    tags: ['algorithms', 'strings', 'coding'],
    points: 5,
    timeLimit: 600
  }
];

async function seedQuestionBank() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/udaan-ai';
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing question bank data
    await QuestionBank.deleteMany({});
    console.log('🗑️ Cleared existing question bank data');

    // Insert seed data
    const insertedQuestions = await QuestionBank.insertMany(questionBankData);
    console.log(`📝 Inserted ${insertedQuestions.length} questions into the question bank`);

    // Display statistics
    const stats = await QuestionBank.getStatistics();
    console.log('\n📊 Question Bank Statistics:');
    stats.forEach(stat => {
      console.log(`${stat._id.category} (${stat._id.difficulty}): ${stat.activeCount} active questions`);
    });

    console.log('\n✅ Seed data insertion completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding question bank:', error.message);
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

// Run the seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedQuestionBank();
}

export default seedQuestionBank;