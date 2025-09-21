import React, { useState, useCallback } from 'react';
import { resumeService } from '../../services/resumeService';
import { useToast } from '../../context/ToastContext';
import ResumeUpload from './ResumeUpload';
import ResumeAnalysisResults from './ResumeAnalysisResults';
import LoadingSpinner from '../LoadingSpinner';

const ResumeAnalysisInterface = ({ onClose, onAnalysisComplete }) => {
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload', 'analyzing', 'results'
  const [analysisData, setAnalysisData] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);
  const { addToast } = useToast();
  
  const showToast = useCallback((message, type) => {
    addToast(message, type);
  }, [addToast]);

  const handleUploadSuccess = useCallback(async (uploadResult, file) => {
    try {
      setCurrentStep('analyzing');
      setUploadedFile(file);
      setError(null);

      // Analyze the uploaded resume
      const analysisResult = await resumeService.analyzeResume(uploadResult.file?.originalname || file.name);
      
      setAnalysisData(analysisResult.data);
      setCurrentStep('results');
      
      showToast('Resume analysis completed successfully!', 'success');
      onAnalysisComplete?.(analysisResult.data);
      
    } catch (err) {
      setError('Failed to analyze resume. Please try again.');
      setCurrentStep('upload');
      showToast('Analysis failed. Please try again.', 'error');
      console.error('Analysis error:', err);
    }
  }, [showToast, onAnalysisComplete]);

  const handleUploadError = useCallback((error) => {
    setError('Upload failed. Please try again.');
    setCurrentStep('upload');
  }, []);

  const handleStartLearning = useCallback((data) => {
    showToast('Learning journey started! Check your dashboard for progress.', 'success');
    onClose?.();
  }, [showToast, onClose]);

  const handleAnalyzeAnother = useCallback(() => {
    setCurrentStep('upload');
    setAnalysisData(null);
    setUploadedFile(null);
    setError(null);
  }, []);

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {/* Step 1: Upload */}
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 'upload' ? 'bg-blue-600 text-white' : 
            currentStep === 'analyzing' || currentStep === 'results' ? 'bg-green-600 text-white' : 
            'bg-gray-300 text-gray-600'
          }`}>
            {currentStep === 'analyzing' || currentStep === 'results' ? '✓' : '1'}
          </div>
          <span className={`ml-2 text-sm font-medium ${
            currentStep === 'upload' ? 'text-blue-600' : 
            currentStep === 'analyzing' || currentStep === 'results' ? 'text-green-600' : 
            'text-gray-500'
          }`}>
            Upload
          </span>
        </div>

        {/* Connector */}
        <div className={`w-12 h-0.5 ${
          currentStep === 'analyzing' || currentStep === 'results' ? 'bg-green-600' : 'bg-gray-300'
        }`}></div>

        {/* Step 2: Analyze */}
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 'analyzing' ? 'bg-blue-600 text-white' : 
            currentStep === 'results' ? 'bg-green-600 text-white' : 
            'bg-gray-300 text-gray-600'
          }`}>
            {currentStep === 'results' ? '✓' : currentStep === 'analyzing' ? '⟳' : '2'}
          </div>
          <span className={`ml-2 text-sm font-medium ${
            currentStep === 'analyzing' ? 'text-blue-600' : 
            currentStep === 'results' ? 'text-green-600' : 
            'text-gray-500'
          }`}>
            Analyze
          </span>
        </div>

        {/* Connector */}
        <div className={`w-12 h-0.5 ${
          currentStep === 'results' ? 'bg-green-600' : 'bg-gray-300'
        }`}></div>

        {/* Step 3: Results */}
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 'results' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {currentStep === 'results' ? '✓' : '3'}
          </div>
          <span className={`ml-2 text-sm font-medium ${
            currentStep === 'results' ? 'text-green-600' : 'text-gray-500'
          }`}>
            Results
          </span>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <ResumeUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        );

      case 'analyzing':
        return (
          <div className="text-center py-16">
            <LoadingSpinner size="xl" />
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Resume</h3>
              <p className="text-gray-600 mb-4">
                Our AI is carefully reviewing your resume to identify skills, gaps, and opportunities...
              </p>
              {uploadedFile && (
                <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-blue-800 font-medium">{uploadedFile.name}</p>
                  <p className="text-blue-600 text-sm">Processing with advanced AI analysis</p>
                </div>
              )}
            </div>
            
            {/* Analysis Steps Animation */}
            <div className="mt-8 max-w-md mx-auto">
              <div className="space-y-3">
                <div className="flex items-center text-left">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Extracting text content</span>
                </div>
                <div className="flex items-center text-left">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Identifying skills and experience</span>
                </div>
                <div className="flex items-center text-left">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  </div>
                  <span className="text-gray-500">Generating learning recommendations</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'results':
        return (
          <ResumeAnalysisResults
            analysisData={analysisData}
            onStartLearning={handleStartLearning}
            onAnalyzeAnother={handleAnalyzeAnother}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Resume Analysis</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your resume to get personalized insights, skill gap analysis, and learning recommendations powered by advanced AI.
          </p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>

        {/* Close Button (if provided) */}
        {onClose && currentStep !== 'analyzing' && (
          <div className="text-center mt-8">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm">Close</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalysisInterface;