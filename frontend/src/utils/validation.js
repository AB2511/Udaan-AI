/**
 * Frontend validation utility functions
 * Provides consistent validation rules across all forms
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-Z\s]+$/;
const PASSWORD_PATTERNS = {
  minLength: /.{8,}/,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumbers: /\d/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
};

export const validators = {
  required: (value, fieldName = 'Field') => {
    if (value === undefined || value === null) return `${fieldName} is required`;
    if (typeof value === 'string' && !value.trim()) return `${fieldName} is required`;
    if (Array.isArray(value) && value.length === 0) return `${fieldName} is required`;
    return null;
  },

  email: (value) => {
    if (!value) return null;
    if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address';
    return null;
  },

  name: (value) => {
    if (!value) return null;
    const trimmed = String(value).trim();
    if (trimmed.length < 2) return 'Name must be at least 2 characters long';
    if (trimmed.length > 50) return 'Name cannot exceed 50 characters';
    if (!NAME_REGEX.test(trimmed)) return 'Name can only contain letters and spaces';
    return null;
  },

  password: (value) => {
    if (!value) return null;
    if (value.length < 8) return 'Password must be at least 8 characters long';
    if (value.length > 128) return 'Password cannot exceed 128 characters';
    const checks = {
      hasUpperCase: PASSWORD_PATTERNS.hasUpperCase.test(value),
      hasLowerCase: PASSWORD_PATTERNS.hasLowerCase.test(value),
      hasNumbers: PASSWORD_PATTERNS.hasNumbers.test(value)
    };
    const passedChecks = Object.values(checks).filter(Boolean).length;
    if (passedChecks < 3) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return null;
  },

  confirmPassword: (value, originalPassword) => {
    if (!value) return null;
    if (value !== originalPassword) return 'Passwords do not match';
    return null;
  },

  length: (value, min = 0, max = Infinity, fieldName = 'Field') => {
    if (!value) return null;
    const length = String(value).trim().length;
    if (length < min) return `${fieldName} must be at least ${min} characters long`;
    if (length > max) return `${fieldName} cannot exceed ${max} characters`;
    return null;
  },

  select: (value, fieldName = 'Field') => {
    if (value === undefined || value === null || value === '') {
      return `Please select a ${fieldName.toLowerCase()}`;
    }
    return null;
  },

  message: (value) => {
    if (!value) return null;
    const trimmed = String(value).trim();
    if (trimmed.length < 10) return 'Message must be at least 10 characters long';
    if (trimmed.length > 1000) return 'Message cannot exceed 1000 characters';
    return null;
  }
};

/**
 * New helper: unify profile completeness check
 * Accepts user object with optional `profile.careerGoals` that can be an Array or a String.
 */
export function getMissingProfileFields(user) {
  const missing = [];
  if (!user) {
    return ['name', 'email', 'careerGoals'];
  }

  const name = user.name;
  const email = user.email;
  const careerGoals = user?.profile?.careerGoals;

  if (!name || String(name).trim() === '') missing.push('name');
  if (!email || String(email).trim() === '') missing.push('email');

  const isCareerGoalsEmpty = (
    careerGoals === undefined ||
    careerGoals === null ||
    (Array.isArray(careerGoals) && careerGoals.length === 0) ||
    (typeof careerGoals === 'string' && careerGoals.trim() === '')
  );

  if (isCareerGoalsEmpty) missing.push('careerGoals');

  return missing;
}

/**
 * validateForm & validationRules (unchanged behavior but exported)
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  Object.keys(validationRules).forEach(fieldName => {
    const rules = validationRules[fieldName];
    const value = formData[fieldName];
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        errors[fieldName] = error;
        break;
      }
    }
  });
  return errors;
};

export const validationRules = {
  name: { required: true, minLength: 2, maxLength: 50 },
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { required: true, minLength: 8, maxLength: 50 },
  login: {
    email: [(v) => validators.required(v, 'Email'), validators.email],
    password: [(v) => validators.required(v, 'Password')]
  },
  register: {
    name: [(v) => validators.required(v, 'Name'), validators.name],
    email: [(v) => validators.required(v, 'Email'), validators.email],
    password: [(v) => validators.required(v, 'Password'), validators.password],
    confirmPassword: [(v) => validators.required(v, 'Password confirmation')]
  },
  contact: {
    name: [(v) => validators.required(v, 'Name'), validators.name],
    email: [(v) => validators.required(v, 'Email'), validators.email],
    subject: [(v) => validators.select(v, 'Subject')],
    message: [(v) => validators.required(v, 'Message'), validators.message]
  }
};

// Enhanced password strength meter with detailed checks
export function getPasswordStrength(password = '') {
  const checks = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  const lengthScore = password.length >= 12 ? 2 : password.length >= 8 ? 1 : 0;
  const varietyScore = Object.values(checks).slice(1).filter(Boolean).length; // exclude minLength
  const score = lengthScore + varietyScore; // 0..6
  
  let strength = 'weak';
  if (score >= 5) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  
  return {
    strength,
    score,
    checks
  };
}
