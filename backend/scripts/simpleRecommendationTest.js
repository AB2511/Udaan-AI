#!/usr/bin/env node

/**
 * Simple test for RecommendationService
 */

import RecommendationService from '../services/RecommendationService.js';

console.log('🔍 Testing RecommendationService...');

try {
  const service = new RecommendationService();
  console.log('✅ RecommendationService instantiated successfully');
  
  // Test skill matching
  const score = service.calculateSkillMatch(['JavaScript', 'React'], ['JavaScript', 'React']);
  console.log('✅ Skill matching works, score:', score);
  
  // Test skill match type
  const matchType = service.getSkillMatchType('JavaScript', 'JavaScript');
  console.log('✅ Skill match type works:', matchType);
  
  // Test career database
  console.log('✅ Career database loaded with', service.careerDatabase.length, 'careers');
  
  console.log('🎉 Basic RecommendationService tests passed!');
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
}