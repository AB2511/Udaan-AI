import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusIndicator from '../components/common/StatusIndicator';
import ProfileSetupForm from '../components/auth/ProfileSetupForm';

const AuthPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login flow
        const result = await login({ 
          email: formData.email, 
          password: formData.password 
        });
        
        if (result && result.success) {
          // Redirect to resume upload page after successful login
          navigate('/resume-analysis');
        } else {
          setError(result?.message || 'Login failed');
        }
      } else {
        // Register flow - basic validation
        if (!formData.name.trim()) {
          setError('Name is required');
          return;
        }
        if (!formData.email.trim()) {
          setError('Email is required');
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        // Store registration data and show profile setup
        setRegistrationData({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        });
        setShowProfileSetup(true);
        setError('');
      }
    } catch (err) {
      console.error('Auth error:', err);
      const message = err?.response?.data?.message || err?.message || 'Something went wrong';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileComplete = async (profileData) => {
    setLoading(true);
    setError('');

    try {
      // Register user with profile data
      const result = await register(
        registrationData.name,
        registrationData.email,
        registrationData.password,
        registrationData.confirmPassword,
        profileData
      );
      
      if (result && result.success) {
        // Redirect to resume upload page after successful registration
        navigate('/resume-analysis');
      } else {
        setError(result?.message || 'Registration failed');
        // Go back to registration form
        setShowProfileSetup(false);
      }
    } catch (err) {
      console.error('Registration error:', err);
      const message = err?.response?.data?.message || err?.message || 'Registration failed';
      setError(message);
      setShowProfileSetup(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setShowProfileSetup(false);
    setRegistrationData(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  // Show profile setup form for new registrations
  if (showProfileSetup) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center py-12 px-4">
        <div className="animate-fade-in-up">
          <ProfileSetupForm 
            onComplete={handleProfileComplete}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8 animate-fade-in-up">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Join Udaan AI'}
          </h2>
          <p className="text-gray-600 text-lg">
            {isLogin 
              ? 'Sign in to analyze your resume with AI' 
              : 'Start your career journey with AI-powered insights'
            }
          </p>
        </div>

        <div className="card shadow-xl border-0">
          {/* Toggle Buttons */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => !isLogin && toggleMode()}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isLogin
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => isLogin && toggleMode()}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field - only for registration */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="input-field"
                placeholder={isLogin ? "Enter your password" : "Create a password (min 6 characters)"}
                required
              />
            </div>

            {/* Confirm Password field - only for registration */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Confirm your password"
                  required={!isLogin}
                />
              </div>
            )}

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
              disabled={loading}
              className="btn-primary w-full mobile-full"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                <>
                  <span className="mr-2">{isLogin ? '🔐' : '🚀'}</span>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          {/* Additional info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              {isLogin 
                ? 'New to Udaan AI? Click "Sign Up" above to get started.'
                : 'Already have an account? Click "Sign In" above to continue.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;