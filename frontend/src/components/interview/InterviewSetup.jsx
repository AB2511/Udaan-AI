import { useState } from 'react';
import { interviewService } from '../../services/interviewService';
import { handleApiError, extractValidationDetails } from '../../utils/apiErrorHandler';
import { useFormValidation, usePreSubmissionValidation } from '../../hooks/useFormValidation';
import ValidationErrorDisplay, { FieldError } from '../common/ValidationErrorDisplay';
import { useAuth } from '../../context/AuthContext';

const InterviewSetup = ({ onInterviewStart, onClose }) => {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form validation hooks
  const formData = {
    sessionType: selectedType,
    role: selectedRole,
    experienceLevel: selectedExperience,
    difficulty: 'medium' // Default difficulty
  };

  const {
    validationResult,
    validateOnDataChange,
    hasFieldError,
    getFieldError
  } = useFormValidation('interview', formData, {
    validateOnChange: true,
    validateOnBlur: true,
    showWarnings: true
  });

  const {
    validateBeforeSubmit,
    validationResult: preSubmissionResult,
    isValidating: isPreValidating
  } = usePreSubmissionValidation('interview');

  const interviewTypes = [
    {
      type: 'technical',
      title: 'Technical Interview',
      description: 'Test your technical skills and problem-solving abilities',
      icon: '💻',
      duration: '30-45 minutes',
      questions: '8-12 questions'
    },
    {
      type: 'behavioral',
      title: 'Behavioral Interview',
      description: 'Improve your responses to behavioral and situational questions',
      icon: '🧠',
      duration: '25-35 minutes',
      questions: '5-8 questions'
    },
    {
      type: 'mixed',
      title: 'Mixed Interview',
      description: 'Combination of technical and behavioral questions',
      icon: '🔄',
      duration: '35-50 minutes',
      questions: '10-15 questions'
    }
  ];

  const roles = [
    'software-developer',
    'frontend-developer',
    'backend-developer',
    'fullstack-developer',
    'data-scientist',
    'product-manager',
    'mobile-developer',
    'devops-engineer'
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (2-5 years)' },
    { value: 'senior', label: 'Senior Level (5+ years)' },
    { value: 'lead', label: 'Lead/Principal (8+ years)' }
  ];

  const handleStartInterview = async () => {
    // Pre-submission validation
    const isValid = await validateBeforeSubmit(formData);
    if (!isValid) {
      setError('Please fix all validation errors before starting the interview');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await interviewService.startInterview({
        sessionType: selectedType,
        role: selectedRole,
        experienceLevel: selectedExperience,
        difficulty: 'medium',
        careerGoal: user?.profile?.careerGoal // Pass career goal from user profile
      });

      onInterviewStart(response);
    } catch (err) {
      console.error('Error starting interview:', err);
      
      const errorInfo = handleApiError(err, "Interview start");
      const validationDetails = extractValidationDetails(errorInfo);
      
      if (validationDetails.isEnumError) {
        // Show specific enum validation error with allowed values
        setError(`${errorInfo.message}. Please check your selections and try again.`);
      } else if (validationDetails.hasFieldErrors) {
        // Show field-specific errors
        const fieldErrors = Object.entries(validationDetails.fieldErrors);
        if (fieldErrors.length === 1) {
          const [field, error] = fieldErrors[0];
          if (error.allowedValues) {
            setError(`Invalid ${field}. Please select from: ${error.allowedValues.join(', ')}`);
          } else {
            setError(error.message);
          }
        } else {
          setError('Multiple validation errors. Please check your selections.');
        }
      } else {
        setError(errorInfo.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Mock Interview Setup</h2>
        <p className="text-gray-600">Configure your interview preferences to get started</p>
      </div>

      {/* Validation Error Display */}
      {preSubmissionResult && !preSubmissionResult.isValid && (
        <ValidationErrorDisplay 
          error={preSubmissionResult} 
          className="mb-6"
          showAllowedValues={true}
        />
      )}

      {/* Interview Type Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Choose Interview Type
          <span className="text-red-500 ml-1">*</span>
        </h3>
        
        {/* Session type field error */}
        <FieldError error={getFieldError('sessionType')} field="sessionType" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {interviewTypes.map((type) => (
            <div
              key={type.type}
              className={`border rounded-lg p-6 cursor-pointer transition-all ${
                selectedType === type.type
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : hasFieldError('sessionType')
                    ? 'border-red-300 bg-red-50 hover:border-red-400'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
              }`}
              onClick={() => {
                setSelectedType(type.type);
                const newFormData = { ...formData, sessionType: type.type };
                validateOnDataChange(newFormData);
              }}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{type.icon}</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{type.title}</h4>
                <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <p>Duration: {type.duration}</p>
                  <p>Questions: {type.questions}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Select Target Role
          <span className="text-red-500 ml-1">*</span>
        </h3>
        
        {/* Role field error */}
        <FieldError error={getFieldError('role')} field="role" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => {
                setSelectedRole(role);
                const newFormData = { ...formData, role: role };
                validateOnDataChange(newFormData);
              }}
              className={`p-3 text-sm rounded-lg border transition-all ${
                selectedRole === role
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : hasFieldError('role')
                    ? 'border-red-300 bg-red-50 text-red-700 hover:border-red-400'
                    : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {role.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Level Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Experience Level
          <span className="text-red-500 ml-1">*</span>
        </h3>
        
        {/* Experience level field error */}
        <FieldError error={getFieldError('experienceLevel')} field="experienceLevel" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {experienceLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => {
                setSelectedExperience(level.value);
                const newFormData = { ...formData, experienceLevel: level.value };
                validateOnDataChange(newFormData);
              }}
              className={`p-4 text-left rounded-lg border transition-all ${
                selectedExperience === level.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : hasFieldError('experienceLevel')
                    ? 'border-red-300 bg-red-50 text-red-700 hover:border-red-400'
                    : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="font-medium">{level.label.split(' (')[0]}</div>
              <div className="text-sm text-gray-500">({level.label.split(' (')[1]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={onClose}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        
        <button
          onClick={handleStartInterview}
          disabled={loading || isPreValidating || !validationResult.isValid}
          className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Starting Interview...</span>
            </>
          ) : isPreValidating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Validating...</span>
            </>
          ) : (
            <>
              <span>🎤</span>
              <span>Start Interview</span>
            </>
          )}
        </button>
      </div>

      {/* Selection Summary */}
      {(selectedType || selectedRole || selectedExperience) && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Interview Configuration:</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {selectedType && <p>Type: {interviewTypes.find(t => t.type === selectedType)?.title}</p>}
            {selectedRole && <p>Role: {selectedRole}</p>}
            {selectedExperience && <p>Experience: {experienceLevels.find(e => e.value === selectedExperience)?.label}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSetup;