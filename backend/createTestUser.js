import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js'; // adjust path if needed

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdbname';

async function createTestUser() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');

    const newUser = new User({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'hashedpassword123', // hash it properly if your schema requires
      profile: {
        grade: 'Other',
        interests: [],
        skills: [],
        careerGoals: []
      }
    });

    await newUser.save();
    console.log('Test user created:', newUser);

    mongoose.disconnect();
  } catch (err) {
    console.error('Error creating test user:', err);
  }
}

createTestUser();
