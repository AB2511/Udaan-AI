import { debugLog } from '../utils/debugLogger';
import api from './api';

/**
 * Auth service helper functions
 * - Exports named functions (login, register, logout, verifyToken, refreshToken)
 * - Also exports a default object `authService` for code that expects that shape.
 */

export const register = async (userData) => {
  try {
    debugLog({ message: `authService.register payload: ${JSON.stringify(userData)}`, component: 'authService', func: 'register', context: 'info' });
    const { data } = await api.post('/auth/register', userData);
    debugLog({ message: `authService.register response: ${JSON.stringify(data)}`, component: 'authService', func: 'register', context: 'success' });
    if (data?.token) localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    debugLog({ message: 'authService.register error', component: 'authService', func: 'register', context: 'error' });
    console.error('❌ Register failed:', error?.response?.data || error?.message || error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    debugLog({ message: `authService.login payload: ${JSON.stringify(credentials)}`, component: 'authService', func: 'login', context: 'info' });
    const { data } = await api.post('/auth/login', credentials);
    debugLog({ message: `authService.login response: ${JSON.stringify(data)}`, component: 'authService', func: 'login', context: 'success' });
    if (data?.token) localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    debugLog({ message: 'authService.login error', component: 'authService', func: 'login', context: 'error' });
    console.error('❌ Login failed:', error?.response?.data || error?.message || error);
    throw error;
  }
};

export const logout = async () => {
  try {
    debugLog({ message: 'authService.logout called', component: 'authService', func: 'logout', context: 'info' });
    const { data } = await api.post('/auth/logout');
    localStorage.removeItem('token');
    return data;
  } catch (error) {
    debugLog({ message: 'authService.logout error', component: 'authService', func: 'logout', context: 'error' });
    console.error('❌ Logout failed:', error?.response?.data || error?.message || error);
    throw error;
  }
};

export const verifyToken = async () => {
  try {
    debugLog({ message: 'authService.verifyToken called', component: 'authService', func: 'verifyToken', context: 'info' });
    const { data } = await api.get('/auth/verify');
    debugLog({ message: `authService.verifyToken response: ${JSON.stringify(data)}`, component: 'authService', func: 'verifyToken', context: 'success' });
    return data;
  } catch (error) {
    debugLog({ message: 'authService.verifyToken error', component: 'authService', func: 'verifyToken', context: 'error' });
    console.error('❌ Token verification failed:', error?.response?.data || error?.message || error);
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    debugLog({ message: 'authService.refreshToken called', component: 'authService', func: 'refreshToken', context: 'info' });
    const { data } = await api.post('/auth/refresh');
    if (data?.token) localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    debugLog({ message: 'authService.refreshToken error', component: 'authService', func: 'refreshToken', context: 'error' });
    console.error('❌ Refresh token failed:', error?.response?.data || error?.message || error);
    throw error;
  }
};

// Default export object to support `import * as authService` and `import authService from ...`
export const authService = { register, login, logout, verifyToken, refreshToken };
export default authService;
