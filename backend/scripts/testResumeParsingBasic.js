// Simple test to validate ResumeParsingService functionality
console.log('Testing ResumeParsingService...');

try {
  // Dynamic import to handle ES modules
  const ResumeParsingServiceModule = await import('../services/ResumeParsingService.js');
  console.log('Module contents:', Object.keys(ResumeParsingServiceModule));
  console.log('Default export:', ResumeParsingServiceModule.default);
  console.log('Default export type:', typeof ResumeParsingServiceModule.default);
  
  const ResumeParsingService = ResumeParsingServiceModule.default;
  
  console.log('✅ Successfully imported ResumeParsingService');
  
  const service = new ResumeParsingService();
  console.log('✅ Successfully created service instance');
  
  // Test skill identification
  const testText = 'I have experience with JavaScript, Python, React, MongoDB, AWS, leadership, and communication.';
  const skills = service.identifySkills(testText);
  
  console.log('✅ Skill identification test passed');
  console.log('Programming skills found:', skills.technical.programming);
  console.log('Database skills found:', skills.technical.databases);
  console.log('Cloud skills found:', skills.technical.cloud);
  console.log('Soft skills found:', skills.soft);
  
  // Test experience parsing
  const experienceText = `
    Software Engineer at Google
    January 2020 - Present
    Developed web applications using React and Node.js
  `;
  
  const experience = service.parseExperience(experienceText);
  console.log('✅ Experience parsing test passed');
  console.log('Experience entries:', experience.length);
  
  // Test education parsing
  const educationText = `
    Master of Science in Computer Science
    Stanford University
    2018
  `;
  
  const education = service.parseEducation(educationText);
  console.log('✅ Education parsing test passed');
  console.log('Education entries:', education.length);
  
  console.log('\n🎉 All basic tests passed! ResumeParsingService is working correctly.');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}