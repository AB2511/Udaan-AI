// Test the service by requiring it directly
import fs from 'fs';

// Read the service file and evaluate it
const serviceCode = fs.readFileSync('./services/ResumeParsingService.js', 'utf8');
console.log('Service file size:', serviceCode.length);
console.log('Contains export default:', serviceCode.includes('export default'));
console.log('Contains class:', serviceCode.includes('class ResumeParsingService'));

// Try to import it
try {
  const module = await import('./services/ResumeParsingService.js');
  console.log('Module keys:', Object.keys(module));
  console.log('Default export:', module.default);
  console.log('Default export type:', typeof module.default);
} catch (error) {
  console.error('Import error:', error.message);
}