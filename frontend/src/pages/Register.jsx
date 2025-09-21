import { debugLog } from '../utils/debugLogger';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFormValidation } from '../hooks/useFormValidation';
import { validationRules, getPasswordStrength } from '../utils/validation';
import FormField, { PasswordField } from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const initialFormData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  const confirmPasswordValidator = (value) => {
    if (!value) return 'Password confirmation is required';
    if (value !== formData.password) return 'Passwords do not match';
    return null;
  };
  
  // Enhanced validation rules for registration
  const registerValidationRules = {
    ...validationRules.register,
    confirmPassword: [confirmPasswordValidator]
  };

  const {
    formData,
    errors,
    isValid,
    handleChange,
    validateAllFields,
    getFieldProps
  } = useFormValidation(initialFormData, registerValidationRules);



  const handleSubmit = async (e) => {
    e.preventDefault();
    debugLog({
      message: `Submitting form data: ${JSON.stringify(formData)}`,
      component: 'Register',
      func: 'handleSubmit',
      context: 'info'
    });
    // Validate all fields
    if (!validateAllFields()) {
      return;
    }

    setLoading(true);
    setSubmitError('');
    
    try {
      const result = await register(formData.name, formData.email, formData.password, formData.confirmPassword);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setSubmitError(result.message || 'Registration failed');
      }
    } catch (error) {
      setSubmitError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const getStrengthColor = (score) => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join Udaan AI
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start your career journey with personalized AI guidance
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormField
              label="Full Name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              required
              {...getFieldProps('name')}
            />

            <FormField
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email address"
              required
              {...getFieldProps('email')}
            />

            <div>
              <PasswordField
                label="Password"
                name="password"
                placeholder="Create a strong password"
                required
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                {...getFieldProps('password')}
              />
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {passwordStrength.strength}
                    </span>
                  </div>
                  
                  {/* Password Requirements */}
                  <div className="mt-2 text-xs space-y-1">
                    <div className={`flex items-center ${passwordStrength.checks.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className="mr-2">{passwordStrength.checks.minLength ? '✓' : '○'}</span>
                      At least 8 characters
                    </div>
                    <div className={`flex items-center ${passwordStrength.checks.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className="mr-2">{passwordStrength.checks.hasUpperCase ? '✓' : '○'}</span>
                      One uppercase letter
                    </div>
                    <div className={`flex items-center ${passwordStrength.checks.hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className="mr-2">{passwordStrength.checks.hasLowerCase ? '✓' : '○'}</span>
                      One lowercase letter
                    </div>
                    <div className={`flex items-center ${passwordStrength.checks.hasNumbers ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className="mr-2">{passwordStrength.checks.hasNumbers ? '✓' : '○'}</span>
                      One number
                    </div>
                  </div>
                </div>
              )}
            </div>

            <PasswordField
              label="Confirm Password"
              name="confirmPassword"
              placeholder="Confirm your password"
              required
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              {...getFieldProps('confirmPassword')}
            />

            {/* Submit Error */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {submitError}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                //disabled={loading || !isValid}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;