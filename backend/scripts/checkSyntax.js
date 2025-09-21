try {
  console.log('Checking syntax...');
  const controller = await import('../controllers/assessmentController.js');
  console.log('✅ Syntax is valid');
  console.log('Available exports:', Object.keys(controller));
} catch (error) {
  console.error('❌ Syntax error:', error.message);
  console.error(error.stack);
}