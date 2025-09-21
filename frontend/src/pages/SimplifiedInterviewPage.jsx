import React, { useState } from 'react';
import SimplifiedInterviewInterface from '../components/interview/SimplifiedInterviewInterface';
import SimplifiedInterviewResults from '../components/interview/SimplifiedInterviewResults';

const SimplifiedInterviewPage = ({ resumeContent, onClose }) => {
  const [currentStep, setCurrentStep] = useState('interview'); // interview, results
  const [interviewResults, setInterviewResults] = useState(null);

  const handleInterviewComplete = (results) => {
    setInterviewResults(results);
    setCurrentStep('results');
  };

  const handleRestart = () => {
    setCurrentStep('interview');
    setInterviewResults(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {currentStep === 'interview' && (
          <SimplifiedInterviewInterface
            resumeContent={resumeContent}
            onComplete={handleInterviewComplete}
            onClose={onClose}
          />
        )}

        {currentStep === 'results' && interviewResults && (
          <SimplifiedInterviewResults
            interviewData={interviewResults}
            onRestart={handleRestart}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default SimplifiedInterviewPage;