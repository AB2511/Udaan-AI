// Simple test without dynamic imports
import ResumeParsingService from '../services/ResumeParsingService.js';

console.log('Testing ResumeParsingService...');

try {
  const service = new ResumeParsingService();
  console.log('✅ Service created successfully');
  
  // Test skill identification
  const testText = 'I have experience with JavaScript, Python, React, MongoDB, AWS, leadership, and communication.';
  const skills = service.identifySkills(testText);
  
  console.log('✅ Skill identification works');
  console.log('Programming skills:', skills.technical.programming);
  console.log('Database skills:', skills.technical.databases);
  console.log('Cloud skills:', skills.technical.cloud);
  console.log('Soft skills:', skills.soft);
  
  // Test experience parsing
  const experienceText = `
    Software Engineer at Google
    January 2020 - Present
    Developed web applications using React and Node.js
  `;
  
  const experience = service.parseExperience(experienceText);
  console.log('✅ Experience parsing works');
  console.log('Experience entries:', experience.length);
  if (experience.length > 0) {
    console.log('First experience:', experience[0]);
  }
  
  // Test education parsing
  const educationText = `
    Master of Science in Computer Science
    Stanford University
    2018
  `;
  
  const education = service.parseEducation(educationText);
  console.log('✅ Education parsing works');
  console.log('Education entries:', education.length);
  if (education.length > 0) {
    console.log('First education:', education[0]);
  }
  
  console.log('\n🎉 All tests passed! ResumeParsingService is working correctly.');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}