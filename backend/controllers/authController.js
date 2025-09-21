import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user with profile data
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    };

    // Add profile data if provided
    if (profile) {
      userData.profile = {
        careerGoal: profile.careerGoal || '',
        experience: profile.experience || '',
        interests: profile.interests || []
      };
    }

    const user = new User(userData);

    await user.save();

    // Generate tokens
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString()
    });

    // Remove password from response
    const userResponse = user.toJSON();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key error (email already exists)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: 'Validation failed' });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    const token = generateToken({ userId: user._id.toString(), email: user.email });
    const userResponse = user.toJSON();
    return res.status(200).json({ success: true, message: 'Login successful', data: { user: userResponse, token } });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
};
/**
 * Verify token handler
 * @route POST /api/auth/verify-token
 * @access Public
 */
export const verifyToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }
    // Assuming verifyJwtToken is a utility that verifies and decodes the token
    // and returns the userId if valid, or throws if invalid
    const { userId } = await import('../utils/jwt.js').then(m => m.verifyJwtToken(token));
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid token: user not found' });
    }
    return res.status(200).json({ success: true, message: 'Token verified', data: { user: user.toJSON(), token } });
  } catch (error) {
    console.error('Verify token error:', error);
    return res.status(401).json({ success: false, error: 'Token verification failed' });
  }
};

/**
 * Logout user (client-side token invalidation)
 * @route POST /api/auth/logout
 * @access Private
 */
export const logout = async (req, res) => {
  try {
    // In a JWT-based system, logout is typically handled client-side
    // by removing the token from storage. However, we can log the action
    // and potentially implement token blacklisting in the future.
    
    const userId = req.user?._id;
    
    if (userId) {
      console.log(`User ${userId} logged out at ${new Date().toISOString()}`);
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Logout failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Refresh access token
 * @route POST /api/auth/refresh
 * @access Public (requires refresh token)
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: clientRefreshToken } = req.body;

    if (!clientRefreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(clientRefreshToken);

    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token. User not found.'
      });
    }

    // Generate new tokens
    const newToken = generateToken({
      userId: user._id.toString(),
      email: user.email
    });

    const newRefreshToken = generateRefreshToken({
      userId: user._id.toString()
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    
    res.status(401).json({
      success: false,
      message: error.message || 'Token refresh failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    const user = req.user;

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
export const updateProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const { name } = req.body;

    // Build update object - only allow name updates for simplified model
    const updateData = {};
    
    if (name) {
      updateData.name = name.trim();
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser.toJSON()
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Profile update failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update user resume text
 * @route PUT /api/auth/resume
 * @access Private
 */
export const updateResume = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { resumeText } = req.body;
    if (typeof resumeText !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid resumeText' });
    }

    const user = await User.findByIdAndUpdate(
      userId, 
      { resumeText }, 
      { new: true, select: 'resumeText profile email name' }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ 
      success: true, 
      data: { resumeText: user.resumeText }
    });
  } catch (err) {
    console.error('updateResume error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};