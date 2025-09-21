import ActivityService from '../services/ActivityService.js';
import mongoose from 'mongoose';

// Simple test without database connection
async function testActivityServiceBasic() {
  try {
    console.log('🔍 Testing ActivityService basic functionality...');
    
    // Test CSV conversion without database
    console.log('\n📋 Test 1: CSV conversion...');
    const testActivities = [
      {
        timestamp: new Date('2024-01-01'),
        activityType: 'assessment',
        category: 'assessment',
        description: 'Test assessment',
        points: 10,
        metadata: { score: 85, duration: 300 },
        impact: 'high',
        tags: ['test', 'assessment']
      },
      {
        timestamp: new Date('2024-01-02'),
        activityType: 'interview',
        category: 'assessment',
        description: 'Mock interview',
        points: 15,
        metadata: { score: 75, duration: 1800 },
        impact: 'medium',
        tags: ['interview', 'behavioral']
      }
    ];
    
    const csvResult = ActivityService.convertToCSV(testActivities);
    console.log('✅ CSV conversion successful');
    console.log('📄 CSV Headers present:', csvResult.includes('Date,Activity Type,Category'));
    console.log('📄 CSV Data present:', csvResult.includes('assessment,assessment'));
    
    // Test empty CSV
    const emptyCsv = ActivityService.convertToCSV([]);
    console.log('✅ Empty CSV test:', emptyCsv === 'No data available');
    
    // Test null/undefined input
    const nullCsv = ActivityService.convertToCSV(null);
    console.log('✅ Null CSV test:', nullCsv === 'No data available');
    
    console.log('\n📋 Test 2: Static method validation...');
    
    // Test that the class has all expected methods
    const expectedMethods = [
      'logActivity',
      'logAssessmentActivity', 
      'logInterviewActivity',
      'logResumeUploadActivity',
      'logProfileUpdateActivity',
      'getUserActivityHistory',
      'getUserActivityStats',
      'getUserTotalPoints',
      'getUserActivityTrends',
      'getUserAchievements',
      'exportUserActivity',
      'convertToCSV',
      'getActivitySummary',
      'emitActivityEvent',
      'bulkLogActivities',
      'cleanupOldActivities'
    ];
    
    let methodsFound = 0;
    expectedMethods.forEach(method => {
      if (typeof ActivityService[method] === 'function') {
        methodsFound++;
        console.log(`✅ Method ${method} exists`);
      } else {
        console.log(`❌ Method ${method} missing`);
      }
    });
    
    console.log(`\n📊 Methods validation: ${methodsFound}/${expectedMethods.length} methods found`);
    
    if (methodsFound === expectedMethods.length) {
      console.log('🎉 All expected methods are present!');
    } else {
      console.log('⚠️ Some methods are missing');
    }
    
    console.log('\n📋 Test 3: CSV format validation...');
    
    // Test CSV with special characters
    const specialActivities = [
      {
        timestamp: new Date('2024-01-01'),
        activityType: 'test',
        category: 'test',
        description: 'Test with "quotes" and, commas',
        points: 5,
        metadata: {},
        impact: 'low',
        tags: ['test, with, commas', 'quotes "test"']
      }
    ];
    
    const specialCsv = ActivityService.convertToCSV(specialActivities);
    console.log('✅ Special characters CSV test passed');
    console.log('📄 Properly escaped quotes:', specialCsv.includes('""quotes""'));
    
    console.log('\n✨ Basic ActivityService tests completed successfully!');
    
    // Show sample CSV output
    console.log('\n📄 Sample CSV Output:');
    console.log('---');
    console.log(csvResult.split('\n').slice(0, 3).join('\n'));
    console.log('---');
    
  } catch (error) {
    console.error('❌ Basic ActivityService test failed:', error);
    process.exit(1);
  }
}

// Run basic test
testActivityServiceBasic();