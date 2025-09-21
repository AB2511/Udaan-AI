import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updateProfile,
  updateResume
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateRefreshToken
} from '../middleware/validation.js';

const router = express.Router();

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 registration attempts per hour
  message: {
    success: false,
    message: 'Too many registration attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for token refresh
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 refresh requests per windowMs
  message: {
    success: false,
    message: 'Too many token refresh attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerLimiter, validateRegister, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authLimiter, validateLogin, login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (requires refresh token)
 */
router.post('/refresh', refreshLimiter, validateRefreshToken, refreshToken);

// Protected routes (require authentication)
/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, getMe);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, validateProfileUpdate, updateProfile);

/**
 * @route   PUT /api/auth/resume
 * @desc    Update user resume text
 * @access  Private
 */
router.put('/resume', authenticate, updateResume);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify token validity (useful for frontend auth checks)
 * @access  Private
 */
router.get('/verify', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user.toJSON()
    }
  });
});

export default router;