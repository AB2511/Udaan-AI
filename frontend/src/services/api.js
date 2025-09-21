
import axios from 'axios';
import { handleApiError } from '../utils/apiErrorHandler';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://udaan-backend-728353009440.us-central1.run.app/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Toast callback for global notifications
let _toastCallback = null;

export const registerToastCallback = (cb) => {
  _toastCallback = cb;
};

export const setGlobalToast = (message, type = 'info', duration = 5000) => {
  if (typeof _toastCallback === 'function') {
    _toastCallback({ message, type, duration });
  }
};

// Enhanced error handling with retry logic
const handleRequestError = async (error, config) => {
  const errorInfo = handleApiError(error, config.context);
  
  // Handle specific error types
  switch (errorInfo.type) {
    case 'NETWORK_ERROR':
      setGlobalToast('Network connection lost. Please check your internet connection.', 'error', 8000);
      break;
    case 'AUTH_ERROR':
      setGlobalToast('Session expired. Please log in again.', 'warning', 6000);
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/auth';
      }, 2000);
      break;
    case 'SERVER_ERROR':
      setGlobalToast('Server temporarily unavailable. Please try again in a moment.', 'error', 6000);
      break;
    case 'VALIDATION_ERROR':
      // Don't show toast for validation errors - let components handle them
      break;
    default:
      setGlobalToast(errorInfo.message, 'error', 5000);
  }

  return Promise.reject(error);
};

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    if (response.config.showSuccessToast) {
      const message = response.data?.message || response.config.successMessage || 'Operation completed successfully';
      setGlobalToast(message, 'success', 4000);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      return handleRequestError(error, originalRequest);
    }

    const { status } = error.response;

    // Handle 401 Unauthorized with token refresh attempt
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refreshToken
          });
          
          const { token } = response.data;
          localStorage.setItem('token', token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, handle as auth error
        return handleRequestError(error, originalRequest);
      }
    }

    // Handle rate limiting
    if (status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60;
      setGlobalToast(`Too many requests. Please wait ${retryAfter} seconds before trying again.`, 'warning', 8000);
      return Promise.reject(error);
    }

    // Handle other errors
    return handleRequestError(error, originalRequest);
  }
);

// Request interceptor for auth token and request context
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for timeout handling
    config.metadata = { startTime: new Date() };

    return config;
  },
  (error) => {
    setGlobalToast('Failed to send request. Please try again.', 'error');
    return Promise.reject(error);
  }
);

// Enhanced API methods with better error handling
export const apiWithFallback = {
  async get(url, options = {}) {
    try {
      const response = await api.get(url, {
        ...options,
        context: options.context || 'Data fetch'
      });
      return response;
    } catch (error) {
      if (options.fallback) {
        console.warn(`API call failed, using fallback data:`, error.message);
        setGlobalToast('Using cached data due to connection issues', 'warning', 4000);
        return { data: options.fallback };
      }
      throw error;
    }
  },

  async post(url, data, options = {}) {
    try {
      const response = await api.post(url, data, {
        ...options,
        context: options.context || 'Data submission'
      });
      return response;
    } catch (error) {
      if (options.fallback) {
        console.warn(`API call failed, using fallback response:`, error.message);
        return { data: options.fallback };
      }
      throw error;
    }
  },

  async put(url, data, options = {}) {
    return api.put(url, data, {
      ...options,
      context: options.context || 'Data update'
    });
  },

  async delete(url, options = {}) {
    return api.delete(url, {
      ...options,
      context: options.context || 'Data deletion'
    });
  }
};

// Utility function to check API health
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return { healthy: true, data: response.data };
  } catch (error) {
    return { 
      healthy: false, 
      error: error.message,
      offline: !navigator.onLine
    };
  }
};

// Utility function for retrying failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except 408, 429
      if (error.response?.status >= 400 && error.response?.status < 500) {
        if (![408, 429].includes(error.response.status)) {
          throw error;
        }
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};

// Resume update API function
export const updateResumeAPI = async (resumeText) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await api.put('/profile/resume', 
      { resumeText },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      setGlobalToast('Resume updated successfully!', 'success');
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to update resume');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update resume';
    setGlobalToast(errorMessage, 'error');
    throw error;
  }
};

export default api;
