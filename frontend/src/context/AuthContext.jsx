import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import * as authService from '../services/authService'; // using namespace import is now safe because authService has named exports

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: false,
  login: async () => { },
  logout: () => { }
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Handles auth responses (login/verify)
  const handleAuthResponse = useCallback((resp) => {
    try {
      if (resp && resp.success && resp.data && resp.data.user) {
        const u = resp.data.user;
        setUser(u);
        setIsAuthenticated(true);
        // token may come in resp.data.token or resp.token — handle both
        const token = resp.data?.token || resp.token || null;
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          localStorage.setItem('token', token);
        }
        
        // Fixed: Store user data including ID for authHelpers to access
        if (u) {
          localStorage.setItem('user', JSON.stringify(u));
          // Also store userId directly for easier access
          if (u._id) {
            localStorage.setItem('userId', u._id);
          } else if (u.id) {
            localStorage.setItem('userId', u.id);
          }
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('handleAuthResponse error', err);
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Verify token on mount
  const verifyToken = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const resp = await authService.verifyToken();
      // authService.verifyToken throws on non-2xx; only call handleAuthResponse when resp is present
      handleAuthResponse(resp);
    } catch (err) {
      console.error('❌ Verify token error:', err);
      setUser(null);
      setIsAuthenticated(false);
      // remove invalid token to avoid repeated 401s
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  }, [handleAuthResponse]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const login = async (credentials) => {
    try {
      const resp = await authService.login(credentials);
      handleAuthResponse(resp);
      return resp;
    } catch (err) {
      console.error('login error', err);
      throw err;
    }
  };

  const register = async (name, email, password, confirmPassword, profileData = null) => {
    try {
      const registrationData = {
        name,
        email,
        password,
        confirmPassword
      };

      // Add profile data if provided
      if (profileData) {
        registrationData.profile = {
          careerGoal: profileData.careerGoal,
          experience: profileData.experience,
          interests: profileData.interests
        };
      }

      const resp = await authService.register(registrationData);
      handleAuthResponse(resp);
      return resp;
    } catch (err) {
      console.error('register error', err);
      throw err;
    }
  };

  const logout = () => {
    // Fixed: Clear all auth-related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('auth'); // Clear any legacy auth data
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }));
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = { children: PropTypes.node };

// Convenience hook to access auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;