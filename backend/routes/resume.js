// routes/resume.js

import express from 'express';
import resumeController from '../controllers/resumeController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadResume, validateFile, handleUploadError } from '../middleware/fileUpload.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateProgressUpdate = [
  body('skill')
    .trim()
    .notEmpty()
    .withMessage('Skill is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Skill must be between 1 and 100 characters'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['not-started', 'in-progress', 'completed'])
    .withMessage('Status must be one of: not-started, in-progress, completed')
];

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array()
      }
    });
  }
  next();
};

/**
 * @route POST /api/resume/upload
 * @desc Upload & analyze resume
 */
router.post(
  '/upload',
  authenticate,
  (req, res, next) => {
    uploadResume(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  // validateFile, // Temporarily disabled to fix upload issues
  async (req, res) => {
    try {
      // Handle multiple field names - pick whichever contains the file
      const fileObj = (req.files && (
        req.files.resume?.[0] || 
        req.files.file?.[0] || 
        req.files.resumeFile?.[0]
      )) || req.file;

      if (fileObj) {
        // Set req.file for controller compatibility
        req.file = fileObj;
      }

      // Call the controller method
      await resumeController.uploadResume(req, res);
    } catch (error) {
      console.error('Resume upload error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Upload failed',
        error: error.message 
      });
    }
  }
);

/**
 * @route POST /api/resume/analyze
 * @desc Analyze uploaded resume
 */
router.post(
  '/analyze',
  authenticate,
  (req, res, next) => {
    uploadResume(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  // validateFile, // Temporarily disabled to fix upload issues
  async (req, res) => {
    try {
      // Handle multiple field names - pick whichever contains the file
      const fileObj = (req.files && (
        req.files.resume?.[0] || 
        req.files.file?.[0] || 
        req.files.resumeFile?.[0]
      )) || req.file;

      if (fileObj) {
        // Set req.file for controller compatibility
        req.file = fileObj;
      }

      // Call the controller method
      await resumeController.analyzeResume(req, res);
    } catch (error) {
      console.error('Resume analysis error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Analysis failed',
        error: error.message 
      });
    }
  }
);

/**
 * @route GET /api/resume/analysis/:id?
 * @desc Get resume analysis (latest or by ID)
 */
router.get('/analysis/:id?', authenticate, async (req, res) => {
  await resumeController.getAnalysis(req, res);
});

/**
 * @route GET /api/resume/learning-path/:id?
 * @desc Get learning path (latest or by ID)
 */
router.get('/learning-path/:id?', authenticate, async (req, res) => {
  await resumeController.getLearningPath(req, res);
});

/**
 * @route PUT /api/resume/learning-path/:id/progress
 * @desc Update learning progress
 */
router.put(
  '/learning-path/:id/progress',
  authenticate,
  validateProgressUpdate,
  handleValidationErrors,
  async (req, res) => {
    await resumeController.updateLearningProgress(req, res);
  }
);



/**
 * @route GET /api/resume/history
 * @desc Get resume analysis history
 */
router.get('/history', authenticate, async (req, res) => {
  await resumeController.getAnalysisHistory(req, res);
});

/**
 * @route GET /api/resume/analysis/:id/detailed
 * @desc Get detailed analysis results by ID
 */
router.get('/analysis/:id/detailed', authenticate, async (req, res) => {
  await resumeController.getDetailedAnalysis(req, res);
});

/**
 * @route GET /api/resume/career-path/:id?
 * @desc Get AI-generated career path recommendations
 */
router.get('/career-path/:id?', authenticate, async (req, res) => {
  await resumeController.getCareerPath(req, res);
});

/**
 * @route GET /api/resume/job-status/:jobId
 * @desc Get background job status for resume analysis
 */
router.get('/job-status/:jobId', authenticate, async (req, res) => {
  await resumeController.getJobStatus(req, res);
});

/**
 * @route POST /api/resume/save-learning-path
 * @desc Save learning path recommendations
 */
router.post('/save-learning-path', authenticate, async (req, res) => {
  await resumeController.saveLearningPath(req, res);
});

/**
 * @route GET /api/resume/job/:jobId
 * @desc Get job details by ID
 */
router.get('/job/:jobId', authenticate, async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobService = await import('../services/jobService.js');
    const jobDetails = jobService.default.getJobById(jobId);
    
    if (!jobDetails) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    res.json({
      success: true,
      data: jobDetails
    });
  } catch (error) {
    console.error('Get job details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job details',
      error: error.message
    });
  }
});

/**
 * @route GET /api/resume/jobs/search
 * @desc Search jobs
 */
router.get('/jobs/search', authenticate, async (req, res) => {
  try {
    const { q: query } = req.query;
    const jobService = await import('../services/jobService.js');
    const userProfile = await import('../models/User.js').then(m => 
      m.default.findById(req.user._id).select('profile')
    );
    
    const jobs = jobService.default.searchJobs(query, userProfile?.profile);
    
    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Search jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search jobs',
      error: error.message
    });
  }
});

export default router;
