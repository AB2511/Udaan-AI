import express from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

/**
 * Get user profile
 * GET /api/profile
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        profile: user.profile || {},
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile'
    });
  }
});

/**
 * Update user profile
 * PUT /api/profile/update
 */
router.put('/update', [
  authenticate,
  body('careerGoal').optional().isIn([
    'frontend-developer',
    'backend-developer', 
    'fullstack-developer',
    'ml-engineer',
    'data-scientist',
    'devops-engineer',
    'mobile-developer',
    'ui-ux-designer',
    ''
  ]).withMessage('Invalid career goal'),
  body('experience').optional().isIn(['beginner', 'intermediate', 'advanced', '']).withMessage('Invalid experience level'),
  body('interests').optional().isArray().withMessage('Interests must be an array'),
  body('interests.*').optional().isIn([
    'web-development',
    'mobile-development',
    'machine-learning',
    'data-science',
    'cloud-computing',
    'cybersecurity',
    'blockchain',
    'game-development',
    'ui-ux-design',
    'devops',
    'artificial-intelligence',
    'database-management'
  ]).withMessage('Invalid interest')
], async (req, res) => {
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

    const { careerGoal, experience, interests, name } = req.body;
    const userId = req.user._id;

    // Build update object
    const updateData = {};
    
    if (name !== undefined) {
      updateData.name = name.trim();
    }
    
    // Update profile fields
    const profileUpdate = {};
    if (careerGoal !== undefined) profileUpdate.careerGoal = careerGoal;
    if (experience !== undefined) profileUpdate.experience = experience;
    if (interests !== undefined) profileUpdate.interests = interests;
    
    if (Object.keys(profileUpdate).length > 0) {
      updateData.profile = profileUpdate;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile: updatedUser.profile || {},
        name: updatedUser.name,
        email: updatedUser.email
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile update failed'
    });
  }
});

/**
 * Get profile completion status
 * GET /api/profile/completion
 */
router.get('/completion', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name profile');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const profile = user.profile || {};
    let completionPercentage = 0;
    
    // Calculate completion percentage
    if (user.name && user.name.trim()) completionPercentage += 25;
    if (profile.careerGoal) completionPercentage += 25;
    if (profile.experience) completionPercentage += 25;
    if (profile.interests && profile.interests.length > 0) completionPercentage += 25;

    const isComplete = completionPercentage === 100;

    res.json({
      success: true,
      data: {
        completionPercentage,
        isComplete,
        missingFields: {
          name: !user.name || !user.name.trim(),
          careerGoal: !profile.careerGoal,
          experience: !profile.experience,
          interests: !profile.interests || profile.interests.length === 0
        }
      }
    });

  } catch (error) {
    console.error('Profile completion check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check profile completion'
    });
  }
});

/**
 * Update user resume
 * PUT /api/profile/resume
 */
router.put('/resume', authenticate, [
  body('resumeText').notEmpty().withMessage('Resume text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { resumeText } = req.body;
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          'profile.resumeText': resumeText,
          'profile.lastResumeUpdate': new Date()
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Resume updated successfully',
      data: {
        resumeText: updatedUser.profile?.resumeText,
        lastResumeUpdate: updatedUser.profile?.lastResumeUpdate
      }
    });

  } catch (error) {
    console.error('Resume update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update resume'
    });
  }
});

export default router;