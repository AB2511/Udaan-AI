import { useState } from 'react';
import StatusIndicator from '../common/StatusIndicator';

const ProfileSetupForm = ({ onComplete, loading = false, error = '' }) => {
  const [profileData, setProfileData] = useState({
    careerGoal: '',
    experience: '',
    interests: []
  });

  const careerGoals = [
    { value: 'frontend-developer', label: 'Frontend Developer' },
    { value: 'backend-developer', label: 'Backend Developer' },
    { value: 'fullstack-developer', label: 'Full Stack Developer' },
    { value: 'ml-engineer', label: 'ML Engineer' },
    { value: 'data-scientist', label: 'Data Scientist' },
    { value: 'devops-engineer', label: 'DevOps Engineer' },
    { value: 'mobile-developer', label: 'Mobile Developer' },
    { value: 'ui-ux-designer', label: 'UI/UX Designer' }
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner (0-1 years)' },
    { value: 'intermediate', label: 'Intermediate (2-4 years)' },
    { value: 'advanced', label: 'Advanced (5+ years)' }
  ];

  const interestOptions = [
    { value: 'web-development', label: 'Web Development' },
    { value: 'mobile-development', label: 'Mobile Development' },
    { value: 'machine-learning', label: 'Machine Learning' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'cloud-computing', label: 'Cloud Computing' },
    { value: 'cybersecurity', label: 'Cybersecurity' },
    { value: 'blockchain', label: 'Blockchain' },
    { value: 'game-development', label: 'Game Development' },
    { value: 'ui-ux-design', label: 'UI/UX Design' },
    { value: 'devops', label: 'DevOps' },
    { value: 'artificial-intelligence', label: 'Artificial Intelligence' },
    { value: 'database-management', label: 'Database Management' }
  ];

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterestToggle = (interest) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!profileData.careerGoal) {
      return;
    }
    if (!profileData.experience) {
      return;
    }
    if (profileData.interests.length === 0) {
      return;
    }

    onComplete(profileData);
  };

  const isFormValid = profileData.careerGoal && profileData.experience && profileData.interests.length > 0;

  return (
    <div className="max-w-md w-full space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Complete Your Profile
        </h2>
        <p className="text-gray-600">
          Help us personalize your learning journey
        </p>
      </div>

      <div className="card shadow-xl border-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Career Goal */}
          <div>
            <label htmlFor="careerGoal" className="block text-sm font-medium text-gray-700 mb-2">
              Career Goal <span className="text-red-500">*</span>
            </label>
            <select
              id="careerGoal"
              value={profileData.careerGoal}
              onChange={(e) => handleInputChange('careerGoal', e.target.value)}
              className="input-field"
              required
            >
              <option value="">Select your career goal</option>
              {careerGoals.map(goal => (
                <option key={goal.value} value={goal.value}>
                  {goal.label}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Level */}
          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level <span className="text-red-500">*</span>
            </label>
            <select
              id="experience"
              value={profileData.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              className="input-field"
              required
            >
              <option value="">Select your experience level</option>
              {experienceLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Interests <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-2">(Select at least one)</span>
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {interestOptions.map(interest => (
                <label
                  key={interest.value}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    profileData.interests.includes(interest.value)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={profileData.interests.includes(interest.value)}
                    onChange={() => handleInterestToggle(interest.value)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center ${
                    profileData.interests.includes(interest.value)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {profileData.interests.includes(interest.value) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium">{interest.label}</span>
                </label>
              ))}
            </div>
            {profileData.interests.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Selected: {profileData.interests.length} interest{profileData.interests.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <StatusIndicator 
              status="error"
              message={error}
              variant="minimal"
              size="small"
            />
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="btn-primary w-full mobile-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Setting up your profile...
              </div>
            ) : (
              <>
                <span className="mr-2">🚀</span>
                Complete Setup
              </>
            )}
          </button>

          {/* Form validation hint */}
          {!isFormValid && (
            <p className="text-xs text-gray-500 text-center">
              Please fill in all required fields to continue
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupForm;