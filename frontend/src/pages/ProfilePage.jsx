import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StatusIndicator from '../components/common/StatusIndicator';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        careerGoal: '',
        experience: '',
        interests: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                careerGoal: user.profile?.careerGoal || '',
                experience: user.profile?.experience || '',
                interests: user.profile?.interests || []
            });
        }
    }, [user]);

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear messages when user starts editing
        if (error) setError('');
        if (success) setSuccess('');
    };

    const handleInterestToggle = (interest) => {
        setProfileData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Make API call to update profile
            const token = localStorage.getItem('token');
            const response = await fetch('/api/profile/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: profileData.name,
                    careerGoal: profileData.careerGoal,
                    experience: profileData.experience,
                    interests: profileData.interests
                })
            });

            const result = await response.json();

            if (result.success) {
                // Update local user state
                const updatedUser = {
                    ...user,
                    name: result.data.name,
                    profile: result.data.profile
                };

                updateUser(updatedUser);
                setSuccess('Profile updated successfully!');
                
                // Redirect back to resume analysis after a short delay
                setTimeout(() => {
                    navigate('/resume-analysis');
                }, 2000);
            } else {
                setError(result.message || 'Failed to update profile');
            }

        } catch (err) {
            console.error('Profile update error:', err);
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = profileData.name.trim() &&
        profileData.careerGoal &&
        profileData.experience &&
        profileData.interests.length > 0;

    const getCompletionPercentage = () => {
        let completed = 0;
        if (profileData.name.trim()) completed += 25;
        if (profileData.careerGoal) completed += 25;
        if (profileData.experience) completed += 25;
        if (profileData.interests.length > 0) completed += 25;
        return completed;
    };

    return (
        <div className="min-h-screen gradient-bg py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Update Your Profile
                    </h1>
                    <p className="text-gray-600">
                        Complete your profile to unlock personalized learning recommendations
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Profile Completion</span>
                            <span className="text-sm font-medium text-blue-600">{getCompletionPercentage()}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${getCompletionPercentage()}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="card shadow-xl border-0">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={profileData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="input-field"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        {/* Email (read-only) */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={profileData.email}
                                className="input-field bg-gray-50 cursor-not-allowed"
                                disabled
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>

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
                                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${profileData.interests.includes(interest.value)
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
                                        <div className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center ${profileData.interests.includes(interest.value)
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

                        {/* Messages */}
                        {error && (
                            <StatusIndicator
                                status="error"
                                message={error}
                                variant="minimal"
                                size="small"
                            />
                        )}

                        {success && (
                            <StatusIndicator
                                status="success"
                                message={success}
                                variant="minimal"
                                size="small"
                            />
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                type="submit"
                                disabled={loading || !isFormValid}
                                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Updating Profile...
                                    </div>
                                ) : (
                                    <>
                                        <span className="mr-2">💾</span>
                                        Update Profile
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/resume-analysis')}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Form validation hint */}
                        {!isFormValid && (
                            <p className="text-xs text-gray-500 text-center">
                                Please complete all required fields to save your profile
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;