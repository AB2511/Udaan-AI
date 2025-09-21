/**
 * Database indexing configuration for performance optimization
 */
export const indexConfigurations = {
  users: [
    { key: { email: 1 }, name: 'email_1', unique: true }, // Unique index for email
    { key: { 'profile.grade': 1 }, name: 'profile_grade' }, // Single-field index for grade
    { key: { 'profile.skills': 1 }, name: 'profile_skills' }, // Multikey index for skills
    { key: { 'profile.careerGoals': 1 }, name: 'profile_careerGoals' }, // Multikey index for careerGoals
    { key: { createdAt: -1 }, name: 'createdAt_desc' }, // Index for sorting by creation date
    {
      name: 'users_text_index',
      key: {
        email: 'text',
        'profile.interests': 'text',
        'profile.skills': 'text'
      }
    } // Text index for search
  ],

  careerrecommendations: [
    { key: { userId: 1 }, name: 'userId_1' },
    { key: { userId: 1, lastUpdated: -1 }, name: 'userId_1_lastUpdated_desc' },
    { key: { 'recommendations.title': 1 }, name: 'recommendations_title_1' },
    { key: { 'recommendations.requiredSkills': 1 }, name: 'recommendations_requiredSkills_1' },
    {
      key: { 'recommendations.salaryRange.min': 1, 'recommendations.salaryRange.max': 1 },
      name: 'salaryRange_min_max'
    },
    {
      key: { userId: 1, 'recommendations.matchScore': -1, lastUpdated: -1 },
      name: 'career_rec_user_score_idx'
    }, // Moved from createCompoundIndexes
    {
      name: 'careerrecommendations_text_index',
      key: {
        'recommendations.title': 'text',
        'recommendations.description': 'text',
        'recommendations.requiredSkills': 'text'
      }
    }
  ],

  assessments: [
    { key: { userId: 1 }, name: 'userId_1' },
    { key: { assessmentType: 1 }, name: 'assessmentType_1' },
    {
      key: { userId: 1, assessmentType: 1, status: 1, createdAt: -1 },
      name: 'assessment_user_type_status_idx'
    }, // Moved from createCompoundIndexes
    { key: { score: -1 }, name: 'score_desc' },
    { key: { completedAt: -1 }, name: 'completedAt_desc' },
    { key: { 'questions.questionId': 1 }, name: 'questions_questionId_1' },
    { key: { timeSpent: 1 }, name: 'timeSpent_1' }
  ],

  questionbanks: [
    { key: { category: 1 }, name: 'category_1' },
    { key: { subcategory: 1 }, name: 'subcategory_1' },
    { key: { difficulty: 1 }, name: 'difficulty_1' },
    { key: { category: 1, difficulty: 1 }, name: 'category_1_difficulty_1' },
    { key: { isActive: 1 }, name: 'isActive_1' },
    { key: { tags: 1 }, name: 'tags_1' },
    { key: { type: 1 }, name: 'type_1' },
    {
      name: 'questionbanks_text_index',
      key: {
        question: 'text',
        tags: 'text',
        explanation: 'text'
      }
    }
  ],

  resumeanalyses: [
    { key: { userId: 1 }, name: 'userId_1' },
    { key: { analyzedAt: -1 }, name: 'analyzedAt_desc' },
    { key: { extractedSkills: 1 }, name: 'extractedSkills_1' },
    { key: { skillGaps: 1 }, name: 'skillGaps_1' },
    { key: { 'experience.company': 1 }, name: 'experience_company_1' },
    { key: { 'experience.skills': 1 }, name: 'experience_skills_1' },
    { key: { 'education.degree': 1 }, name: 'education_degree_1' },
    { key: { 'learningPath.priority': 1 }, name: 'learningPath_priority_1' },
    {
      key: { userId: 1, processingStatus: 1, 'analysisMetrics.overallScore': -1 },
      name: 'resume_user_status_score_idx'
    }, // Moved from createCompoundIndexes
    {
      name: 'resumeanalyses_text_index',
      key: {
        resumeText: 'text',
        extractedSkills: 'text',
        'experience.company': 'text',
        'experience.role': 'text'
      }
    }
  ],

  interviewsessions: [
    { key: { userId: 1 }, name: 'userId_1' },
    { key: { sessionType: 1 }, name: 'sessionType_1' },
    {
      key: { userId: 1, sessionType: 1, status: 1, overallScore: -1 },
      name: 'interview_user_type_status_score_idx'
    }, // Moved from createCompoundIndexes
    { key: { overallScore: -1 }, name: 'overallScore_desc' },
    { key: { completedAt: -1 }, name: 'completedAt_desc' },
    { key: { duration: 1 }, name: 'duration_1' },
    { key: { 'questions.category': 1 }, name: 'questions_category_1' },
    { key: { 'feedback.communication': 1 }, name: 'feedback_communication_1' },
    { key: { 'feedback.technicalAccuracy': 1 }, name: 'feedback_technicalAccuracy_1' },
    { key: { 'feedback.confidence': 1 }, name: 'feedback_confidence_1' }
  ],

  activitylogs: [
    { key: { userId: 1 }, name: 'userId_1' },
    { key: { activityType: 1 }, name: 'activityType_1' },
    { key: { userId: 1, activityType: 1 }, name: 'userId_1_activityType_1' },
    { key: { timestamp: -1 }, name: 'timestamp_desc' },
    { key: { userId: 1, timestamp: -1 }, name: 'userId_1_timestamp_desc' },
    { key: { userId: 1, category: 1, timestamp: -1 }, name: 'activity_user_category_time_idx' }, // Moved from createCompoundIndexes
    { key: { activityType: 1, timestamp: -1, points: -1 }, name: 'activity_type_time_points_idx' }, // Moved from createCompoundIndexes
    {
      key: { timestamp: 1 },
      name: 'timestamp_1_ttl',
      expireAfterSeconds: 365 * 24 * 60 * 60
    },
    {
      name: 'activitylogs_text_index',
      key: {
        description: 'text',
        activityType: 'text'
      }
    }
  ]
};

/**
 * Create indexes for a specific collection
 */
export const createCollectionIndexes = async (db, collectionName) => {
  try {
    const collection = db.collection(collectionName);
    const indexes = indexConfigurations[collectionName];

    if (!indexes) {
      console.log(`No indexes configured for collection: ${collectionName}`);
      return;
    }

    console.log(`Creating indexes for collection: ${collectionName}`);

    for (const indexSpec of indexes) {
      try {
        const options = {
          background: true,
          name: indexSpec.name
        };

        if (indexSpec.expireAfterSeconds) {
          options.expireAfterSeconds = indexSpec.expireAfterSeconds;
        }

        await collection.createIndex(indexSpec.key || indexSpec, options);
        console.log(`✓ Created index ${indexSpec.name} for ${collectionName}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`Index already exists for ${collectionName}: ${indexSpec.name}`);
        } else {
          console.error(`Failed to create index for ${collectionName}:`, error.message);
          throw error;
        }
      }
    }
  } catch (error) {
    console.error(`Error creating indexes for ${collectionName}:`, error.message);
    throw error;
  }
};

/**
 * Create all indexes
 */
export const createAllIndexes = async (db) => {
  console.log('🔧 Creating database indexes for performance optimization...');

  const collections = Object.keys(indexConfigurations);

  for (const collectionName of collections) {
    await createCollectionIndexes(db, collectionName);
  }

  console.log('✅ Database indexing completed');
};

/**
 * Drop all indexes (for testing/reset)
 */
export const dropAllIndexes = async (db) => {
  console.log('🗑️ Dropping all custom indexes...');

  const collections = Object.keys(indexConfigurations);

  for (const collectionName of collections) {
    try {
      const collection = db.collection(collectionName);
      const indexes = await collection.indexes();

      for (const index of indexes) {
        if (index.name !== '_id_') {
          try {
            await collection.dropIndex(index.name);
            console.log(`✓ Dropped index ${index.name} from ${collectionName}`);
          } catch (error) {
            console.error(`Failed to drop index ${index.name}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error(`Error dropping indexes for ${collectionName}:`, error.message);
    }
  }

  console.log('✅ Index cleanup completed');
};

/**
 * Analyze index usage
 */
export const analyzeIndexUsage = async (db) => {
  console.log('📊 Analyzing index usage...');

  const collections = Object.keys(indexConfigurations);
  const usage = {};

  for (const collectionName of collections) {
    try {
      const collection = db.collection(collectionName);
      const stats = await collection.aggregate([{ $indexStats: {} }]).toArray();

      usage[collectionName] = stats.map(stat => ({
        name: stat.name,
        usageCount: stat.accesses?.ops || 0,
        since: stat.accesses?.since || null
      }));
    } catch (error) {
      console.error(`Error analyzing indexes for ${collectionName}:`, error.message);
      usage[collectionName] = [];
    }
  }

  return usage;
};

/**
 * Get collection statistics
 */
export const getCollectionStats = async (db) => {
  console.log('📈 Gathering collection statistics...');

  const collections = Object.keys(indexConfigurations);
  const stats = {};

  for (const collectionName of collections) {
    try {
      const collection = db.collection(collectionName);
      const collStats = await db.command({ collStats: collectionName });

      stats[collectionName] = {
        count: collStats.count,
        size: collStats.size,
        avgObjSize: collStats.avgObjSize,
        indexCount: collStats.nindexes,
        totalIndexSize: collStats.totalIndexSize,
        storageSize: collStats.storageSize
      };
    } catch (error) {
      console.error(`Error getting stats for ${collectionName}:`, error.message);
      stats[collectionName] = null;
    }
  }

  return stats;
};

export default {
  indexConfigurations,
  createCollectionIndexes,
  createAllIndexes,
  dropAllIndexes,
  analyzeIndexUsage,
  getCollectionStats
};