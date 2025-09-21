import React, { useState, useRef, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../LoadingSpinner';
import { handleApiError, extractValidationDetails, getContextualErrorMessage, ERROR_MESSAGES } from '../../utils/apiErrorHandler';

const ResumeUpload = ({ onUploadSuccess, onUploadError }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();
  
  const showToast = useCallback((message, type) => {
    addToast(message, type);
  }, [addToast]);

  // File validation constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

  const validateFile = useCallback((file) => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return 'Please upload a PDF or Word document (.pdf, .doc, .docx)';
      }
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }

    // Check if file is empty
    if (file.size === 0) {
      return 'File appears to be empty';
    }

    return null;
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((selectedFile) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      showToast(validationError, 'error');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setUploadProgress(0);
  }, [validateFile, showToast]);

  const handleFileInputChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  const simulateUploadProgress = useCallback(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 95) {
        setUploadProgress(95);
        clearInterval(interval);
      } else {
        setUploadProgress(Math.floor(progress));
      }
    }, 200);
    return interval;
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      
      const progressInterval = simulateUploadProgress();

      // Import resume service dynamically to avoid circular dependencies
      const { resumeService } = await import('../../services/resumeService');
      
      const result = await resumeService.uploadResume(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploading(false);
        showToast('Resume uploaded successfully!', 'success');
        onUploadSuccess?.(result, file);
      }, 500);

    } catch (err) {
      setUploading(false);
      setUploadProgress(0);
      
      const errorInfo = handleApiError(err, "Resume upload");
      const validationDetails = extractValidationDetails(errorInfo);
      
      let displayError = errorInfo.message;
      
      // Handle specific resume upload errors
      if (validationDetails.hasFieldErrors) {
        const fieldErrors = validationDetails.fieldErrors;
        
        if (fieldErrors.resumeFile) {
          displayError = getContextualErrorMessage('RESUME_UPLOAD', 'INVALID_FORMAT');
        } else if (fieldErrors.userId) {
          displayError = getContextualErrorMessage('RESUME_UPLOAD', 'USER_ID_MISSING');
        } else {
          displayError = errorInfo.message;
        }
      } else if (err.response?.status === 413) {
        displayError = getContextualErrorMessage('RESUME_UPLOAD', 'FILE_TOO_LARGE');
      } else if (err.response?.status === 415) {
        displayError = getContextualErrorMessage('RESUME_UPLOAD', 'INVALID_FORMAT');
      }
      
      setError(displayError);
      showToast(displayError, 'error');
      onUploadError?.(err);
      console.error('Resume upload error:', err);
    }
  }, [file, simulateUploadProgress, showToast, onUploadSuccess, onUploadError]);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const getFileIcon = useCallback((fileName) => {
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    switch (extension) {
      case '.pdf':
        return (
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
      case '.doc':
      case '.docx':
        return (
          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
    }
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-blue-400 bg-blue-50 scale-105'
            : file
            ? 'border-green-400 bg-green-50'
            : error
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
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
          disabled={uploading}
        />

        {uploading ? (
          <div className="py-8">
            <LoadingSpinner size="lg" />
            <div className="mt-4">
              <p className="text-gray-700 font-medium mb-2">Uploading resume...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">{uploadProgress}%</p>
            </div>
          </div>
        ) : file ? (
          <div className="py-4">
            <div className="flex items-center justify-center mb-4">
              {getFileIcon(file.name)}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">File Ready</h3>
            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
              <p className="font-medium text-gray-900 mb-1">{file.name}</p>
              <p className="text-gray-500 text-sm">{formatFileSize(file.size)}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleUpload}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload & Analyze
              </button>
              <button
                onClick={handleRemoveFile}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-6 rounded-lg transition duration-300"
              >
                Choose Different File
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Your Resume</h3>
            <p className="text-gray-600 mb-6">
              Drag and drop your resume here, or click to browse files
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300 inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Choose File
            </button>
            <p className="text-gray-500 text-sm mt-4">
              Supports PDF, DOC, and DOCX files up to 10MB
            </p>
          </div>
        )}

        {/* Drag overlay */}
        {dragActive && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-75 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-blue-700 font-medium">Drop your resume here</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Benefits Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">AI-Powered Analysis</h4>
          <p className="text-gray-600 text-sm">Advanced AI identifies your skills and expertise areas</p>
        </div>
        
        <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Gap Identification</h4>
          <p className="text-gray-600 text-sm">Discover missing skills for your target career path</p>
        </div>
        
        <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Personalized Learning</h4>
          <p className="text-gray-600 text-sm">Get customized learning paths with actionable resources</p>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;