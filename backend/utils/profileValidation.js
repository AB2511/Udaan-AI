/**
 * Profile validation utilities
 */

// Valid grade options
export const VALID_GRADES = [
  '9th', '10th', '11th', '12th', 
  'Undergraduate', 'Graduate', 'Other'
];

// Valid experience levels
export const VALID_EXPERIENCE_LEVELS = [
  'Beginner', 'Intermediate', 'Advanced', 'Expert'
];

// Common industries for validation
export const COMMON_INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Retail', 'Consulting', 'Media', 'Government', 'Non-profit',
  'Automotive', 'Aerospace', 'Energy', 'Real Estate', 'Hospitality'
];

/**
 * Validate profile data structure and content
 * @param {Object} profileData - Profile data to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateProfileData = (profileData) => {
  const errors = [];
  const warnings = [];

  if (!profileData || typeof profileData !== 'object') {
    return {
      isValid: false,
      errors: ['Profile data must be an object'],
      warnings: []
    };
  }

  // Validate grade
  if (profileData.grade && !VALID_GRADES.includes(profileData.grade)) {
    errors.push(`Invalid grade. Must be one of: ${VALID_GRADES.join(', ')}`);
  }

  // Validate experience
  if (profileData.experience && !VALID_EXPERIENCE_LEVELS.includes(profileData.experience)) {
    errors.push(`Invalid experience level. Must be one of: ${VALID_EXPERIENCE_LEVELS.join(', ')}`);
  }

  // Validate arrays
  if (profileData.interests) {
    if (!Array.isArray(profileData.interests)) {
      errors.push('Interests must be an array');
    } else if (profileData.interests.length > 10) {
      errors.push('Cannot have more than 10 interests');
    } else {
      profileData.interests.forEach((interest, index) => {
        if (typeof interest !== 'string' || interest.trim().length === 0) {
          errors.push(`Interest at index ${index} must be a non-empty string`);
        }
      });
    }
  }

  if (profileData.skills) {
    if (!Array.isArray(profileData.skills)) {
      errors.push('Skills must be an array');
    } else if (profileData.skills.length > 20) {
      errors.push('Cannot have more than 20 skills');
    } else {
      profileData.skills.forEach((skill, index) => {
        if (typeof skill !== 'string' || skill.trim().length === 0) {
          errors.push(`Skill at index ${index} must be a non-empty string`);
        }
      });
    }
  }

  if (profileData.careerGoals) {
    if (!Array.isArray(profileData.careerGoals)) {
      errors.push('Career goals must be an array');
    } else if (profileData.careerGoals.length > 5) {
      errors.push('Cannot have more than 5 career goals');
    } else {
      profileData.careerGoals.forEach((goal, index) => {
        if (typeof goal !== 'string' || goal.trim().length === 0) {
          errors.push(`Career goal at index ${index} must be a non-empty string`);
        }
      });
    }
  }

  if (profileData.preferredIndustries) {
    if (!Array.isArray(profileData.preferredIndustries)) {
      errors.push('Preferred industries must be an array');
    } else if (profileData.preferredIndustries.length > 10) {
      errors.push('Cannot have more than 10 preferred industries');
    }
  }

  // Validate string lengths
  if (profileData.bio && profileData.bio.length > 500) {
    errors.push('Bio cannot exceed 500 characters');
  }

  if (profileData.location && profileData.location.length > 100) {
    errors.push('Location cannot exceed 100 characters');
  }

  // Validate education
  if (profileData.education) {
    const { institution, degree, fieldOfStudy, graduationYear } = profileData.education;
    
    if (institution && institution.length > 200) {
      errors.push('Institution name cannot exceed 200 characters');
    }
    
    if (degree && degree.length > 100) {
      errors.push('Degree cannot exceed 100 characters');
    }
    
    if (fieldOfStudy && fieldOfStudy.length > 100) {
      errors.push('Field of study cannot exceed 100 characters');
    }
    
    if (graduationYear) {
      const currentYear = new Date().getFullYear();
      if (graduationYear < 1950 || graduationYear > currentYear + 10) {
        errors.push('Graduation year must be between 1950 and ' + (currentYear + 10));
      }
    }
  }

  // Validate social links
  if (profileData.socialLinks) {
    const { linkedin, github, portfolio } = profileData.socialLinks;
    
    if (linkedin && !isValidUrl(linkedin, 'linkedin.com')) {
      errors.push('Please provide a valid LinkedIn URL');
    }
    
    if (github && !isValidUrl(github, 'github.com')) {
      errors.push('Please provide a valid GitHub URL');
    }
    
    if (portfolio && !isValidUrl(portfolio)) {
      errors.push('Please provide a valid portfolio URL');
    }
  }

  // Add warnings for incomplete profile
  if (!profileData.bio || profileData.bio.trim().length === 0) {
    warnings.push('Adding a bio will help personalize your experience');
  }

  if (!profileData.location || profileData.location.trim().length === 0) {
    warnings.push('Adding your location can help with relevant opportunities');
  }

  if (!profileData.socialLinks || (!profileData.socialLinks.linkedin && !profileData.socialLinks.github)) {
    warnings.push('Adding professional social links can enhance your profile');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @param {string} domain - Optional domain to check for
 * @returns {boolean} - Whether URL is valid
 */
const isValidUrl = (url, domain = null) => {
  try {
    const urlObj = new URL(url);
    if (domain) {
      return urlObj.hostname.includes(domain);
    }
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Sanitize and normalize profile data
 * @param {Object} profileData - Raw profile data
 * @returns {Object} - Sanitized profile data
 */
export const sanitizeProfileData = (profileData) => {
  if (!profileData || typeof profileData !== 'object') {
    return {};
  }

  const sanitized = {};

  // Sanitize strings
  if (profileData.grade) sanitized.grade = profileData.grade.trim();
  if (profileData.bio) sanitized.bio = profileData.bio.trim().substring(0, 500);
  if (profileData.location) sanitized.location = profileData.location.trim().substring(0, 100);
  if (profileData.experience) sanitized.experience = profileData.experience.trim();

  // Sanitize arrays
  if (profileData.interests && Array.isArray(profileData.interests)) {
    sanitized.interests = profileData.interests
      .filter(item => item && typeof item === 'string')
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .slice(0, 10);
  }

  if (profileData.skills && Array.isArray(profileData.skills)) {
    sanitized.skills = profileData.skills
      .filter(item => item && typeof item === 'string')
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .slice(0, 20);
  }

  if (profileData.careerGoals && Array.isArray(profileData.careerGoals)) {
    sanitized.careerGoals = profileData.careerGoals
      .filter(item => item && typeof item === 'string')
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .slice(0, 5);
  }

  if (profileData.preferredIndustries && Array.isArray(profileData.preferredIndustries)) {
    sanitized.preferredIndustries = profileData.preferredIndustries
      .filter(item => item && typeof item === 'string')
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .slice(0, 10);
  }

  // Sanitize education
  if (profileData.education && typeof profileData.education === 'object') {
    sanitized.education = {};
    
    if (profileData.education.institution) {
      sanitized.education.institution = profileData.education.institution.trim().substring(0, 200);
    }
    
    if (profileData.education.degree) {
      sanitized.education.degree = profileData.education.degree.trim().substring(0, 100);
    }
    
    if (profileData.education.fieldOfStudy) {
      sanitized.education.fieldOfStudy = profileData.education.fieldOfStudy.trim().substring(0, 100);
    }
    
    if (profileData.education.graduationYear) {
      const year = parseInt(profileData.education.graduationYear);
      if (!isNaN(year)) {
        sanitized.education.graduationYear = year;
      }
    }
  }

  // Sanitize social links
  if (profileData.socialLinks && typeof profileData.socialLinks === 'object') {
    sanitized.socialLinks = {};
    
    ['linkedin', 'github', 'portfolio'].forEach(platform => {
      if (profileData.socialLinks[platform]) {
        const url = profileData.socialLinks[platform].trim();
        if (url) {
          sanitized.socialLinks[platform] = url;
        }
      }
    });
  }

  return sanitized;
};

/**
 * Calculate profile completion score
 * @param {Object} user - User object with profile
 * @returns {number} - Completion percentage (0-100)
 */
export const calculateProfileCompletion = (user) => {
  if (!user || !user.profile) return 0;

  const fields = [
    { field: 'name', weight: 10, value: user.name },
    { field: 'email', weight: 10, value: user.email },
    { field: 'grade', weight: 8, value: user.profile.grade },
    { field: 'interests', weight: 8, value: user.profile.interests?.length > 0 },
    { field: 'skills', weight: 10, value: user.profile.skills?.length > 0 },
    { field: 'careerGoals', weight: 10, value: user.profile.careerGoals?.length > 0 },
    { field: 'bio', weight: 8, value: user.profile.bio?.trim() },
    { field: 'location', weight: 5, value: user.profile.location?.trim() },
    { field: 'experience', weight: 8, value: user.profile.experience },
    { field: 'preferredIndustries', weight: 5, value: user.profile.preferredIndustries?.length > 0 },
    { field: 'education.institution', weight: 6, value: user.profile.education?.institution?.trim() },
    { field: 'education.degree', weight: 6, value: user.profile.education?.degree?.trim() },
    { field: 'socialLinks', weight: 6, value: user.profile.socialLinks?.linkedin || user.profile.socialLinks?.github || user.profile.socialLinks?.portfolio }
  ];

  let totalWeight = 0;
  let completedWeight = 0;

  fields.forEach(({ weight, value }) => {
    totalWeight += weight;
    if (value && value !== '' && value !== 'Other') {
      completedWeight += weight;
    }
  });

  return Math.round((completedWeight / totalWeight) * 100);
};