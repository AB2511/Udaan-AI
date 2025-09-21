import React, { useState } from 'react';
import InterviewSetup from '../components/interview/InterviewSetup';
import InterviewQuestionInterface from '../components/interview/InterviewQuestionInterface';
import InterviewResults from '../components/interview/InterviewResults';

const InterviewPage = () => {
  const [currentStep, setCurrentStep] = useState('setup'); // setup, interview, results
  const [sessionData, setSessionData] = useState(null);
  const [interviewResults, setInterviewResults] = useState(null);

  const handleInterviewStart = (session) => {
    setSessionData(session);
    setCurrentStep('interview');
  };

  const handleInterviewComplete = (results) => {
    setInterviewResults(results);
    setCurrentStep('results');
  };

  const handleClose = () => {
    // Navigate back to dashboard or previous page
    window.history.back();
  };

  const handleRestart = () => {
    setCurrentStep('setup');
    setSessionData(null);
    setInterviewResults(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {currentStep === 'setup' && (
          <InterviewSetup
            onInterviewStart={handleInterviewStart}
            onClose={handleClose}
          />
        )}

        {currentStep === 'interview' && sessionData && (
          <InterviewQuestionInterface
            sessionData={sessionData}
            onInterviewComplete={handleInterviewComplete}
            onClose={handleClose}
          />
        )}

        {currentStep === 'results' && interviewResults && (
          <InterviewResults
            results={interviewResults}
            sessionData={sessionData}
            onRestart={handleRestart}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
};

export default InterviewPage;