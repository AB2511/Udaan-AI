import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/udaan-ai';
    console.log('📍 Connecting to:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Successfully connected to MongoDB');
    console.log('📊 Database name:', mongoose.connection.db.databaseName);
    
    // Test basic operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(c => c.name));
    
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    throw error;
  }
}

// Run the test
testConnection().catch(console.error);