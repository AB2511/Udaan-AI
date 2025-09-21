#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script initializes the database with proper indexes and validates schemas.
 * Can be run independently or as part of the application startup.
 * 
 * Usage:
 *   node scripts/setupDatabase.js [options]
 * 
 * Options:
 *   --init     Initialize database with indexes
 *   --drop     Drop all custom indexes
 *   --stats    Show database statistics
 *   --validate Validate model schemas
 *   --help     Show this help message
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import {
  initializeDatabase,
  dropAllIndexes,
  getDatabaseStats,
  validateSchemas
} from '../config/initializeDatabase.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/udaan-ai';

/**
 * Connect to MongoDB
 */
const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectFromDatabase = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Failed to disconnect from MongoDB:', error.message);
  }
};

/**
 * Show help message
 */
const showHelp = () => {
  console.log(`
Database Setup Script for Udaan AI

Usage: node scripts/setupDatabase.js [options]

Options:
  --init      Initialize database with indexes and constraints
  --drop      Drop all custom indexes (use with caution)
  --stats     Show database statistics and index information
  --validate  Validate all model schemas
  --help      Show this help message

Examples:
  node scripts/setupDatabase.js --init
  node scripts/setupDatabase.js --stats
  node scripts/setupDatabase.js --validate
  node scripts/setupDatabase.js --drop --init
`);
};

/**
 * Main execution function
 */
const main = async () => {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    return;
  }

  try {
    await connectToDatabase();

    // Process command line arguments
    if (args.includes('--drop')) {
      console.log('🗑️ Dropping all custom indexes...');
      await dropAllIndexes();
    }

    if (args.includes('--init')) {
      console.log('🔧 Initializing database...');
      await initializeDatabase();
    }

    if (args.includes('--validate')) {
      console.log('🔍 Validating schemas...');
      await validateSchemas();
    }

    if (args.includes('--stats')) {
      console.log('📊 Getting database statistics...');
      const stats = await getDatabaseStats();
      console.log('\n📈 Database Statistics:');
      console.table(stats);
    }

    console.log('\n✅ Database setup completed successfully');

  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await disconnectFromDatabase();
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, closing database connection...');
  await disconnectFromDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, closing database connection...');
  await disconnectFromDatabase();
  process.exit(0);
});

// Run the script
main().catch(async (error) => {
  console.error('❌ Unhandled error:', error.message);
  await disconnectFromDatabase();
  process.exit(1);
});