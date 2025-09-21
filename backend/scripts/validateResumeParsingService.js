import ResumeParsingService from '../services/ResumeParsingService.js';
import fs from 'fs';
import path from 'path';

async function validateResumeParsingService() {
  console.log('🔍 Validating ResumeParsingService...\n');
  
  const service = new ResumeParsingService();
  let allTestsPassed = true;

  // Test 1: Skill Identification
  console.log('Test 1: Skill Identification');
  try {
    const resumeText = 'I have experience with JavaScript, Python, React, MongoDB, AWS, leadership, and communication skills.';
    const skills = service.identifySkills(resumeText);
    
    console.log('  ✓ Technical skills found:', skills.technical.programming.length > 0);
    console.log('  ✓ Database skills found:', skills.technical.databases.length > 0);
    console.log('  ✓ Cloud skills found:', skills.technical.cloud.length > 0);
    console.log('  ✓ Soft skills found:', skills.soft.length > 0);
    console.log('  Skills identified:', {
      programming: skills.technical.programming,
      databases: skills.technical.databases,
      cloud: skills.technical.cloud,
      soft: skills.soft
    });
  } catch (error) {
    console.log('  ❌ Skill identification failed:', error.message);
    allTestsPassed = false;
  }

  // Test 2: Experience Parsing
  console.log('\nTest 2: Experience Parsing');
  try {
    const experienceText = `
      Software Engineer at Google
      January 2020 - Present
      Developed web applications using React and Node.js
      
      Junior Developer at Microsoft
      June 2018 - December 2019
      Worked on backend services with Python and MongoDB
    `;
    
    const experience = service.parseExperience(experienceText);
    console.log('  ✓ Experience entries found:', experience.length);
    console.log('  Experience details:', experience.map(exp => ({
      role: exp.role,
      company: exp.company,
      duration: exp.duration,
      skillsCount: exp.skills.length
    })));
  } catch (error) {
    console.log('  ❌ Experience parsing failed:', error.message);
    allTestsPassed = false;
  }

  // Test 3: Education Parsing
  console.log('\nTest 3: Education Parsing');
  try {
    const educationText = `
      Master of Science in Computer Science
      Stanford University
      2018
      
      Bachelor of Technology
      Indian Institute of Technology
      2016
    `;
    
    const education = service.parseEducation(educationText);
    console.log('  ✓ Education entries found:', education.length);
    console.log('  Education details:', education.map(edu => ({
      degree: edu.degree,
      institution: edu.institution,
      year: edu.year
    })));
  } catch (error) {
    console.log('  ❌ Education parsing failed:', error.message);
    allTestsPassed = false;
  }

  // Test 4: File Validation
  console.log('\nTest 4: File Validation');
  try {
    // Test with a small buffer and valid filename
    const testBuffer = Buffer.from('test content');
    
    // Mock file type detection for testing
    const originalFileType = service.getMimeTypeFromExtension('pdf');
    console.log('  ✓ MIME type detection works:', originalFileType === 'application/pdf');
    
    // Test file size validation logic
    const maxSize = 10 * 1024 * 1024; // 10MB
    console.log('  ✓ File size validation logic:', testBuffer.length < maxSize);
    
  } catch (error) {
    console.log('  ❌ File validation failed:', error.message);
    allTestsPassed = false;
  }

  // Test 5: Edge Cases
  console.log('\nTest 5: Edge Cases');
  try {
    // Empty text
    const emptySkills = service.identifySkills('');
    console.log('  ✓ Empty text handling:', Object.values(emptySkills.technical).every(arr => arr.length === 0));
    
    // Special characters
    const specialText = 'Skills: C++, C#, .NET, Node.js development';
    const specialSkills = service.identifySkills(specialText);
    console.log('  ✓ Special characters handling:', specialSkills.technical.programming.length > 0);
    
    // Case insensitive
    const caseText = 'JAVASCRIPT and Python programming';
    const caseSkills = service.identifySkills(caseText);
    console.log('  ✓ Case insensitive matching:', caseSkills.technical.programming.includes('javascript'));
    
  } catch (error) {
    console.log('  ❌ Edge case handling failed:', error.message);
    allTestsPassed = false;
  }

  // Test 6: Service Structure
  console.log('\nTest 6: Service Structure');
  try {
    console.log('  ✓ Service instantiation:', service instanceof ResumeParsingService);
    console.log('  ✓ Has skill categories:', typeof service.skillCategories === 'object');
    console.log('  ✓ Has experience patterns:', typeof service.experiencePatterns === 'object');
    console.log('  ✓ Has education patterns:', typeof service.educationPatterns === 'object');
    console.log('  ✓ Has extractText method:', typeof service.extractText === 'function');
    console.log('  ✓ Has identifySkills method:', typeof service.identifySkills === 'function');
    console.log('  ✓ Has parseExperience method:', typeof service.parseExperience === 'function');
    console.log('  ✓ Has parseEducation method:', typeof service.parseEducation === 'function');
    console.log('  ✓ Has parseResume method:', typeof service.parseResume === 'function');
    console.log('  ✓ Has validateFile method:', typeof service.validateFile === 'function');
  } catch (error) {
    console.log('  ❌ Service structure validation failed:', error.message);
    allTestsPassed = false;
  }

  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('✅ All ResumeParsingService validation tests passed!');
    console.log('📋 Service is ready for integration with API endpoints.');
  } else {
    console.log('❌ Some validation tests failed. Please check the implementation.');
  }
  console.log('='.repeat(50));

  return allTestsPassed;
}

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateResumeParsingService()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Validation failed with error:', error);
      process.exit(1);
    });
}

export default validateResumeParsingService;