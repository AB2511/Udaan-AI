import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { resumeService } from '../services/resumeService';
import ResumeUpload from '../components/resume/ResumeUpload';
import ResumeAnalysisResults from '../components/resume/ResumeAnalysisResults';
import JobRecommendations from '../components/resume/JobRecommendations';
import { AIProcessingLoader } from '../components/common/ProfessionalLoader';
import StatusIndicator from '../components/common/StatusIndicator';
import SimplifiedInterviewPage from './SimplifiedInterviewPage';

const ResumeAnalysisPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  // Consolidated state for single page experience
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);
  const [jobRecommendations, setJobRecommendations] = useState([]);
  const [jobRecommendationsError, setJobRecommendationsError] = useState(null);
  const [showInterview, setShowInterview] = useState(false);
  const [resumeText, setResumeText] = useState('');
  
  const showToast = useCallback((message, type) => {
    addToast(message, type);
  }, [addToast]);

  const handleUploadSuccess = useCallback(async (uploadResult, file) => {
    try {
      setIsAnalyzing(true);
      setUploadedFile(file);
      setError(null);

      // Analyze the uploaded resume
      const analysisResult = await resumeService.analyzeResume(file);
      
      setAnalysisData(analysisResult.data);
      
      // Store resume text for interview feature
      if (analysisResult.data?.resumeText) {
        setResumeText(analysisResult.data.resumeText);
      }
      
      // Extract job recommendations from analysis data if available
      if (analysisResult.data?.jobRecommendations && Array.isArray(analysisResult.data.jobRecommendations)) {
        setJobRecommendations(analysisResult.data.jobRecommendations);
        setJobRecommendationsError(null);
      } else {
        // Set empty array if no recommendations available
        setJobRecommendations([]);
        if (analysisResult.data && !analysisResult.data.jobRecommendations) {
          setJobRecommendationsError('Job recommendations are temporarily unavailable');
        }
      }
      
      setIsAnalyzing(false);
      showToast('Resume analysis completed successfully!', 'success');
      
    } catch (err) {
      setError('Failed to analyze resume. Please try again.');
      setIsAnalyzing(false);
      showToast('Analysis failed. Please try again.', 'error');
      console.error('Analysis error:', err);
    }
  }, [showToast]);

  const handleUploadError = useCallback((error) => {
    setError('Upload failed. Please try again.');
    setIsAnalyzing(false);
  }, []);

  const handleAnalyzeAnother = useCallback(() => {
    setAnalysisData(null);
    setUploadedFile(null);
    setError(null);
    setJobRecommendations([]);
    setJobRecommendationsError(null);
    setIsAnalyzing(false);
    setShowInterview(false);
    setResumeText('');
  }, []);

  const handleStartInterview = useCallback(() => {
    setShowInterview(true);
  }, []);

  const handleCloseInterview = useCallback(() => {
    setShowInterview(false);
  }, []);

  const handleStartLearning = useCallback((data) => {
    showToast('Learning journey started! Check your dashboard for progress.', 'success');
    navigate('/dashboard');
  }, [showToast, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simplified Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Resume Analysis</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Upload your resume to get instant AI-powered insights, skill analysis, and personalized job recommendations.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <StatusIndicator 
              status="error"
              title="Analysis Failed"
              message={error}
              action="Try Again"
              onAction={() => setError(null)}
              variant="card"
            />
          </div>
        )}

        {/* Main Content - Single Page Layout */}
        <div className="max-w-6xl mx-auto">
          {/* Upload Section - Always Visible */}
          <div className="mb-8">
            <ResumeUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>

          {/* AI Processing Section - Visible During Analysis */}
          {isAnalyzing && (
            <div className="mb-8">
              <AIProcessingLoader 
                currentStep={1}
                className="max-w-2xl mx-auto"
              />
              {uploadedFile && (
                <div className="mt-6 max-w-md mx-auto">
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-blue-600">Processing with Vertex AI</p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Section - Visible After Analysis */}
          {analysisData && !isAnalyzing && !showInterview && (
            <div className="space-y-6">
              {/* Job Recommendations Section - Displayed First */}
              <JobRecommendations 
                recommendations={jobRecommendations}
                isLoading={false}
                error={jobRecommendationsError}
              />

              {/* Resume Analysis Results */}
              <ResumeAnalysisResults
                analysisData={analysisData}
                onStartLearning={handleStartLearning}
                onAnalyzeAnother={handleAnalyzeAnother}
              />

              {/* Optional Mock Interview Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <div className="mb-4">
                    <span className="text-4xl">🎤</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Optional: Practice Mock Interview
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Want to practice your interview skills? Our AI can generate personalized interview questions 
                    based on your resume and provide feedback on your answers.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleStartInterview}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <span>🎤</span>
                      <span>Start AI Mock Interview (Beta)</span>
                    </button>
                    <button
                      onClick={handleAnalyzeAnother}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Analyze Another Resume
                    </button>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>• 3-5 personalized questions • AI-powered feedback • Optional feature</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interview Section - Visible When Interview is Active */}
          {showInterview && (
            <SimplifiedInterviewPage
              resumeContent={resumeText}
              onClose={handleCloseInterview}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysisPage;