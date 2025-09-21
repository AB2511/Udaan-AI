import ResumeParsingService from '../services/ResumeParsingServiceMinimal.js';

console.log('Testing minimal service...');
const service = new ResumeParsingService();
const result = service.identifySkills('javascript python');
console.log('Result:', result);
console.log('✅ Minimal service works!');