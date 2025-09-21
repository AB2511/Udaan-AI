import mongoose from 'mongoose';
import {
  User,
  ResumeAnalysis,
  InterviewSession
} from '../models/index.js';

/**
 * Initialize database with proper indexes and constraints
 */
const initializeDatabase = async () => {
  try {
    console.log('🔧 Initializing database indexes...');

    // Create additional compound indexes for complex queries
    await createCompoundIndexes();

    // Validate schemas
    await validateSchemas();

    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

/**
 * Create additional compound indexes for performance optimization
 */
const createCompoundIndexes = async () => {
  try {
    // Resume analysis optimization
    await ResumeAnalysis.collection.createIndex(
      { userId: 1, processingStatus: 1, 'analysisMetrics.overallScore': -1 },
      { name: 'resume_user_status_score_idx', background: true }
    );

    // Interview session optimization
    await InterviewSession.collection.createIndex(
      { userId: 1, sessionType: 1, status: 1, overallScore: -1 },
      { name: 'interview_user_type_status_score_idx', background: true }
    );

    console.log('✅ Compound indexes created successfully');
  } catch (error) {
    console.error('❌ Failed to create compound indexes:', error.message);
    throw error;
  }
};

/**
 * Drop all indexes (useful for development/testing)
 */
const dropAllIndexes = async () => {
  try {
    console.log('🗑️ Dropping all custom indexes...');

    const collections = [
      User,
      ResumeAnalysis,
      InterviewSession
    ];

    for (const collection of collections) {
      try {
        await collection.collection.dropIndexes();
        console.log(`✅ Dropped indexes for ${collection.modelName}`);
      } catch (error) {
        if (error.code !== 26) { // NamespaceNotFound
          console.warn(`⚠️ Could not drop indexes for ${collection.modelName}:`, error.message);
        }
      }
    }

    console.log('✅ All custom indexes dropped');
  } catch (error) {
    console.error('❌ Failed to drop indexes:', error.message);
    throw error;
  }
};

/**
 * Get database statistics and index information
 */
const getDatabaseStats = async () => {
  try {
    const stats = {};
    const collections = [
      { model: User, name: 'users' },
      { model: ResumeAnalysis, name: 'resumeanalyses' },
      { model: InterviewSession, name: 'interviewsessions' }
    ];

    for (const { model, name } of collections) {
      try {
        const collectionStats = await model.collection.stats();
        const indexes = await model.collection.indexes();

        stats[name] = {
          documentCount: collectionStats.count || 0,
          storageSize: collectionStats.storageSize || 0,
          indexCount: indexes.length,
          indexes: indexes.map(index => index.name)
        };
      } catch (error) {
        stats[name] = {
          documentCount: 0,
          storageSize: 0,
          indexCount: 0,
          indexes: [],
          error: error.message
        };
      }
    }

    return stats;
  } catch (error) {
    console.error('❌ Failed to get database stats:', error.message);
    throw error;
  }
};

/**
 * Validate model schemas and constraints
 */
const validateSchemas = async () => {
  try {
    console.log('🔍 Validating model schemas...');

    const validationTests = [
      {
        model: User,
        sampleData: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'testpassword123'
        }
      }
    ];

    for (const { model, sampleData } of validationTests) {
      try {
        const testDoc = new model(sampleData);
        await testDoc.validate();
        console.log(`✅ ${model.modelName} schema validation passed`);
      } catch (error) {
        console.error(`❌ ${model.modelName} schema validation failed:`, error.message);
      }
    }

    console.log('✅ Schema validation completed');
  } catch (error) {
    console.error('❌ Schema validation failed:', error.message);
    throw error;
  }
};

export {
  initializeDatabase,
  createCompoundIndexes,
  dropAllIndexes,
  getDatabaseStats,
  validateSchemas
};

export default initializeDatabase;