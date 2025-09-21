/**
 * Auth Helper Functions
 * Centralized token and user ID extraction
 */

/**
 * Get authentication token from localStorage
 * @returns {string|null} Token string or null
 */
export function getToken() {
  try {
    // Try auth object first
    const authRaw = localStorage.getItem('auth');
    if (authRaw) {
      const auth = JSON.parse(authRaw);
      if (auth.token) return auth.token;
      if (auth.data?.token) return auth.data.token;
    }
    
    // Fallback to direct token
    return localStorage.getItem('token') || null;
  } catch (e) {
    console.warn('Error parsing auth from localStorage:', e);
    return localStorage.getItem('token') || null;
  }
}

/**
 * Get user ID from localStorage
 * @returns {string|null} User ID or null
 */
export function getUserId() {
  try {
    // Try auth object first
    const authRaw = localStorage.getItem('auth');
    if (authRaw) {
      const auth = JSON.parse(authRaw);
      if (auth.user?._id) return auth.user._id;
      if (auth.data?.user?._id) return auth.data.user._id;
      if (auth.userId) return auth.userId;
    }
    
    // Try user object
    const userRaw = localStorage.getItem('user');
    if (userRaw) {
      const user = JSON.parse(userRaw);
      if (user._id) return user._id;
      if (user.id) return user.id;
    }
    
    // Fallback to direct userId
    return localStorage.getItem('userId') || localStorage.getItem('user_id') || null;
  } catch (e) {
    console.warn('Error parsing user from localStorage:', e);
    return localStorage.getItem('userId') || localStorage.getItem('user_id') || null;
  }
}

/**
 * Get both token and userId
 * @returns {Object} { token, userId }
 */
export function getAuthData() {
  return {
    token: getToken(),
    userId: getUserId()
  };
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Clear all auth data from localStorage
 */
export function clearAuthData() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('user_id');
  localStorage.removeItem('auth');
  localStorage.removeItem('user');
}