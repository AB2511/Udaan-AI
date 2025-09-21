import React, { useState, useRef } from 'react';
import { resumeService } from '../../services/resumeService';
import LoadingSpinner from '../LoadingSpinner';

const ResumeAnalyzer = ({ onClose, onAnalysisComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setAnalyzing(true);
      setError(null);

      // Analyze resume directly with file
      const analysisResult = await resumeService.analyzeResume(file);
      
      setAnalysisResult(analysisResult.data || analysisResult);
      setUploading(false);
      setAnalyzing(false);
    } catch (err) {
      setError('Failed to analyze resume. Please try again.');
      setUploading(false);
      setAnalyzing(false);
      console.error('Error analyzing resume:', err);
    }
  };

  const handleComplete = async () => {
    try {
      // Save learning path recommendations to backend
      if (analysisResult.careerAnalysis?.careerPath) {
        await resumeService.saveLearningPath(analysisResult.careerAnalysis.careerPath);
      }
      onAnalysisComplete(analysisResult);
    } catch (error) {
      console.error('Error saving learning path:', error);
      // Still complete the analysis even if saving fails
      onAnalysisComplete(analysisResult);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSkillGapColor = (gap) => {
    switch (gap.priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Resume Analyzer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!analysisResult ? (
            <div className="max-w-2xl mx-auto">
              {/* File Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : file
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {uploading || analyzing ? (
                  <div className="py-8">
                    <LoadingSpinner />
                    <p className="mt-4 text-gray-600">
                      {uploading ? 'Uploading resume...' : 'Analyzing resume...'}
                    </p>
                  </div>
                ) : file ? (
                  <div>
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">File Selected</h3>
                    <p className="text-gray-600 mb-1">{file.name}</p>
                    <p className="text-gray-500 text-sm mb-4">{formatFileSize(file.size)}</p>
                    <div className="flex space-x-3 justify-center">
                      <button
                        onClick={handleUploadAndAnalyze}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
                      >
                        Analyze Resume
                      </button>
                      <button
                        onClick={() => setFile(null)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-6 rounded-lg transition duration-300"
                      >
                        Choose Different File
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Resume</h3>
                    <p className="text-gray-600 mb-4">
                      Drag and drop your resume here, or click to browse
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
                    >
                      Choose File
                    </button>
                    <p className="text-gray-500 text-sm mt-4">
                      Supports PDF, DOC, and DOCX files up to 10MB
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-800">{error}</span>
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Skill Analysis</h4>
                  <p className="text-gray-600 text-sm">Identify your current skills and expertise areas</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Gap Identification</h4>
                  <p className="text-gray-600 text-sm">Discover skills you need for your target career</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Learning Path</h4>
                  <p className="text-gray-600 text-sm">Get personalized recommendations for skill development</p>
                </div>
              </div>
            </div>
          ) : (
            /* Analysis Results */
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Analysis Complete!</h3>
                <p className="text-gray-600">We've analyzed your resume and generated personalized recommendations</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Extracted Skills */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Identified Skills ({analysisResult.careerAnalysis?.skillAnalysis?.identifiedSkills ? 
                      Object.values(analysisResult.careerAnalysis.skillAnalysis.identifiedSkills).flat().length : 
                      analysisResult.extractedSkills?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.careerAnalysis?.skillAnalysis?.identifiedSkills ? 
                      Object.values(analysisResult.careerAnalysis.skillAnalysis.identifiedSkills).flat().map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      )) : 
                      analysisResult.extractedSkills?.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      )) || <p className="text-gray-600">No skills identified</p>}
                  </div>
                </div>

                {/* Skill Gaps */}
                <div className="bg-orange-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Skill Gaps ({analysisResult.careerAnalysis?.skillAnalysis?.skillGaps ? 
                      Object.values(analysisResult.careerAnalysis.skillAnalysis.skillGaps).flat().length : 
                      analysisResult.skillGaps?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {analysisResult.careerAnalysis?.skillAnalysis?.skillGaps ? 
                      Object.entries(analysisResult.careerAnalysis.skillAnalysis.skillGaps).map(([priority, gaps]) => 
                        gaps.map((gap, index) => (
                          <div
                            key={`${priority}-${index}`}
                            className={`p-3 rounded-lg border ${
                              priority === 'critical' ? 'border-red-200 bg-red-50' :
                              priority === 'important' ? 'border-yellow-200 bg-yellow-50' :
                              'border-green-200 bg-green-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">{gap}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                priority === 'critical' ? 'bg-red-100 text-red-800' :
                                priority === 'important' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {priority}
                              </span>
                            </div>
                          </div>
                        ))
                      ).flat() :
                      analysisResult.skillGaps?.map((gap, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${getSkillGapColor(gap)}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{gap.skill || gap}</span>
                            {gap.priority && (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                gap.priority === 'high' ? 'bg-red-100 text-red-800' :
                                gap.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {gap.priority}
                              </span>
                            )}
                          </div>
                        </div>
                      )) || <p className="text-gray-600">No skill gaps identified</p>}
                  </div>
                </div>
              </div>

              {/* Learning Path Preview */}
              {(analysisResult.careerAnalysis?.careerPath || analysisResult.learningPath) && (
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Recommended Learning Path
                  </h4>
                  <div className="space-y-3">
                    {(analysisResult.careerAnalysis?.careerPath || analysisResult.learningPath || []).slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                        <div>
                          <h5 className="font-medium text-gray-900">{item.step || item.skill}</h5>
                          <p className="text-gray-600 text-sm">{item.estimatedTime}</p>
                          {item.description && (
                            <p className="text-gray-500 text-xs mt-1">{item.description}</p>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.priority === 'high' ? 'bg-red-100 text-red-800' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          Priority: {item.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleComplete}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300"
                >
                  Apply Learning Path
                </button>
                <button
                  onClick={() => setAnalysisResult(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
                >
                  Analyze Another Resume
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;