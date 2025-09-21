import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import activitiesRouter from '../routes/activities.js';
import ActivityService from '../services/ActivityService.js';
import ActivityLog from '../models/ActivityLog.js';

dotenv.config();

// Create test app
const app = express();
app.use(express.json());

// Mock authentication middleware for testing
app.use((req, res, next) => {
  req.user = { 
    id: new mongoose.Types.ObjectId().toString(), 
    role: 'user' 
  };
  req.ip = '127.0.0.1';
  req.get = (header) => header === 'User-Agent' ? 'Test Agent' : undefined;
  req.sessionID = 'test-session';
  next();
});

app.use('/api/activities', activitiesRouter);

async function validateActivityEndpoints() {
  try {
    console.log('🔍 Validating Activity API Endpoints...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/udaan-ai');
    console.log('✅ Connected to database');

    const testUserId = new mongoose.Types.ObjectId();
    
    // Create some test activities
    console.log('\n📋 Setting up test data...');
    const testActivities = [
      {
        userId: testUserId,
        activityType: 'assessment',
        description: 'Completed JavaScript assessment',
        category: 'assessment',
        metadata: { score: 85, duration: 300 },
        points: 15,
        tags: ['javascript', 'assessment']
      },
      {
        userId: testUserId,
        activityType: 'interview',
        description: 'Mock behavioral interview',
        category: 'assessment',
        metadata: { score: 75, duration: 1800 },
        points: 20,
        tags: ['interview', 'behavioral']
      },
      {
        userId: testUserId,
        activityType: 'resume_upload',
        description: 'Uploaded resume for analysis',
        category: 'profile',
        metadata: { fileName: 'resume.pdf' },
        points: 5,
        tags: ['resume', 'upload']
      }
    ];

    await ActivityLog.insertMany(testActivities);
    console.log('✅ Test data created');

    // Start server for testing
    const server = app.listen(0, () => {
      const port = server.address().port;
      console.log(`🚀 Test server running on port ${port}`);
    });

    const baseUrl = `http://localhost:${server.address().port}`;

    // Test 1: Get activity types
    console.log('\n📋 Test 1: GET /api/activities/types');
    try {
      const response = await fetch(`${baseUrl}/api/activities/types`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Activity types endpoint working');
        console.log(`   - Activity types: ${data.data.activityTypes.length}`);
        console.log(`   - Categories: ${data.data.categories.length}`);
      } else {
        console.log('❌ Activity types endpoint failed:', data);
      }
    } catch (error) {
      console.log('❌ Activity types endpoint error:', error.message);
    }

    // Test 2: Get activity history
    console.log('\n📋 Test 2: GET /api/activities/history');
    try {
      // Override user ID for this test
      app.use((req, res, next) => {
        req.user.id = testUserId.toString();
        next();
      });

      const response = await fetch(`${baseUrl}/api/activities/history?limit=10&activityType=assessment`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Activity history endpoint working');
        console.log(`   - Activities returned: ${data.data.activities.length}`);
        console.log(`   - Total count: ${data.data.pagination.total}`);
      } else {
        console.log('❌ Activity history endpoint failed:', data);
      }
    } catch (error) {
      console.log('❌ Activity history endpoint error:', error.message);
    }

    // Test 3: Get activity stats
    console.log('\n📋 Test 3: GET /api/activities/stats');
    try {
      const response = await fetch(`${baseUrl}/api/activities/stats?timeframe=month`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Activity stats endpoint working');
        console.log(`   - Category stats: ${data.data.categoryStats.length}`);
        console.log(`   - Total points: ${data.data.totalPoints.totalPoints}`);
      } else {
        console.log('❌ Activity stats endpoint failed:', data);
      }
    } catch (error) {
      console.log('❌ Activity stats endpoint error:', error.message);
    }

    // Test 4: Get activity summary
    console.log('\n📋 Test 4: GET /api/activities/summary');
    try {
      const response = await fetch(`${baseUrl}/api/activities/summary`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Activity summary endpoint working');
        console.log(`   - This week: ${data.data.summary.thisWeek} activities`);
        console.log(`   - This month: ${data.data.summary.thisMonth} activities`);
      } else {
        console.log('❌ Activity summary endpoint failed:', data);
      }
    } catch (error) {
      console.log('❌ Activity summary endpoint error:', error.message);
    }

    // Test 5: Export activities (JSON)
    console.log('\n📋 Test 5: GET /api/activities/export (JSON)');
    try {
      const response = await fetch(`${baseUrl}/api/activities/export?format=json`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Activity export (JSON) endpoint working');
        console.log(`   - Records exported: ${data.data.totalRecords}`);
      } else {
        console.log('❌ Activity export (JSON) endpoint failed:', data);
      }
    } catch (error) {
      console.log('❌ Activity export (JSON) endpoint error:', error.message);
    }

    // Test 6: Export activities (CSV)
    console.log('\n📋 Test 6: GET /api/activities/export (CSV)');
    try {
      const response = await fetch(`${baseUrl}/api/activities/export?format=csv`);
      const csvData = await response.text();
      
      if (response.ok && csvData.includes('Date,Activity Type')) {
        console.log('✅ Activity export (CSV) endpoint working');
        console.log(`   - CSV headers present: ${csvData.split('\n')[0]}`);
        console.log(`   - CSV rows: ${csvData.split('\n').length - 1}`);
      } else {
        console.log('❌ Activity export (CSV) endpoint failed');
      }
    } catch (error) {
      console.log('❌ Activity export (CSV) endpoint error:', error.message);
    }

    // Test 7: Get achievements
    console.log('\n📋 Test 7: GET /api/activities/achievements');
    try {
      const response = await fetch(`${baseUrl}/api/activities/achievements`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Achievements endpoint working');
        console.log(`   - Achievements: ${data.data.totalAchievements}`);
      } else {
        console.log('❌ Achievements endpoint failed:', data);
      }
    } catch (error) {
      console.log('❌ Achievements endpoint error:', error.message);
    }

    // Test 8: Get activity trends
    console.log('\n📋 Test 8: GET /api/activities/trends');
    try {
      const response = await fetch(`${baseUrl}/api/activities/trends?timeframe=month`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Activity trends endpoint working');
        console.log(`   - Trend data points: ${data.data.trends.length}`);
      } else {
        console.log('❌ Activity trends endpoint failed:', data);
      }
    } catch (error) {
      console.log('❌ Activity trends endpoint error:', error.message);
    }

    // Test 9: Log activity (POST)
    console.log('\n📋 Test 9: POST /api/activities/log');
    try {
      const response = await fetch(`${baseUrl}/api/activities/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          activityType: 'profile_update',
          description: 'Updated profile skills',
          metadata: { updateType: 'skills' },
          impact: 'medium',
          tags: ['profile', 'skills']
        })
      });
      
      const data = await response.json();
      
      if (response.status === 201 && data.success) {
        console.log('✅ Log activity endpoint working');
        console.log(`   - Activity logged: ${data.data.activity.id}`);
        console.log(`   - Points earned: ${data.data.activity.points}`);
      } else {
        console.log('❌ Log activity endpoint failed:', data);
      }
    } catch (error) {
      console.log('❌ Log activity endpoint error:', error.message);
    }

    // Test 10: Validation errors
    console.log('\n📋 Test 10: Validation error handling');
    try {
      const response = await fetch(`${baseUrl}/api/activities/history?limit=invalid`);
      const data = await response.json();
      
      if (response.status === 400 && !data.success) {
        console.log('✅ Validation error handling working');
        console.log(`   - Error code: ${data.error.code}`);
      } else {
        console.log('❌ Validation error handling failed');
      }
    } catch (error) {
      console.log('❌ Validation error test error:', error.message);
    }

    // Test 11: Invalid timeframe handling
    console.log('\n📋 Test 11: Invalid timeframe handling');
    try {
      const response = await fetch(`${baseUrl}/api/activities/stats?timeframe=invalid`);
      const data = await response.json();
      
      if (response.status === 400 && data.error.code === 'INVALID_TIMEFRAME') {
        console.log('✅ Invalid timeframe handling working');
      } else {
        console.log('❌ Invalid timeframe handling failed');
      }
    } catch (error) {
      console.log('❌ Invalid timeframe test error:', error.message);
    }

    // Test 12: Search functionality
    console.log('\n📋 Test 12: Search functionality');
    try {
      const response = await fetch(`${baseUrl}/api/activities/history?search=assessment&limit=5`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Search functionality working');
        console.log(`   - Search results: ${data.data.activities.length}`);
      } else {
        console.log('❌ Search functionality failed:', data);
      }
    } catch (error) {
      console.log('❌ Search functionality error:', error.message);
    }

    console.log('\n🎉 Activity endpoints validation completed!');

    // Cleanup
    server.close();
    await ActivityLog.deleteMany({ userId: testUserId });
    console.log('🧹 Test data cleaned up');

  } catch (error) {
    console.error('❌ Activity endpoints validation failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run validation
validateActivityEndpoints();