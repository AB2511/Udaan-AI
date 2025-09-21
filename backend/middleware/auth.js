import { verifyToken, verifyRefreshToken, extractTokenFromHeader } from '../utils/jwt.js';
import User from '../models/User.js';

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user to request object
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Find user by ID from token
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found.'
      });
    }

    // Attach user to request object
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    return res.status(401).json({
      success: false,
      message: error.message || 'Access denied. Invalid token.'
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't block request if not
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user) {
        req.user = user;
        req.token = token;
      }
    }

    next();
  } catch (error) {
    // Don't block request for optional auth, just log the error
    console.warn('Optional authentication failed:', error.message);
    next();
  }
};

/**
 * Authorization middleware to check user roles/permissions
 * @param {Array} allowedRoles - Array of allowed roles
 */
export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    // If no roles specified, just check if user is authenticated
    if (allowedRoles.length === 0) {
      return next();
    }

    // Check if user has required role
    const userRole = req.user.role || 'user';
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

/**
 * Middleware to validate token refresh requests
 */
export const validateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required.'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user by ID from refresh token
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token. User not found.'
      });
    }

    // Attach user and decoded token to request
    req.user = user;
    req.refreshTokenData = decoded;

    next();
  } catch (error) {
    console.error('Refresh token validation error:', error.message);
    
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid refresh token.'
    });
  }
};