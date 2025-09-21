// controllers/resumeController.js - Streamlined for hackathon prototype
import aiService from '../services/aiService.js';
import User from '../models/User.js';

class ResumeController {
  constructor() {
    // Simplified constructor - removed complex analysis service
  }

  async uploadResume(req, res) {
    try {
      // Simplified validation
      const userId = req.body.userId || req.user?.id;
      const resumeFile = req.file;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_USER_ID',
          message: 'User authentication required'
        });
      }

      if (!resumeFile) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_FILE',
          message: 'Resume file is required'
        });
      }

      // Basic file validation
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(resumeFile.mimetype)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_FILE_TYPE',
          message: 'Only PDF and Word documents are supported'
        });
      }

      // Extract text from file
      let resumeText = '';
      try {
        resumeText = await this.extractTextFromFile(resumeFile);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'TEXT_EXTRACTION_FAILED',
          message: 'Failed to extract text from resume file'
        });
      }

      // Simple response for upload success
      res.status(201).json({
        success: true,
        message: 'Resume uploaded successfully',
        data: {
          file: {
            originalname: resumeFile.originalname,
            size: resumeFile.size,
            type: resumeFile.mimetype
          },
          textLength: resumeText.length
        }
      });
    } catch (err) {
      console.error('Error uploading resume:', err);
      res.status(500).json({
        success: false,
        error: 'UPLOAD_FAILED',
        message: 'Failed to upload resume'
      });
    }
  }

  async analyzeResume(req, res) {
    try {
      // Simplified validation
      const userId = req.body.userId || req.user?.id;
      const resumeFile = req.file;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_USER_ID',
          message: 'User authentication required'
        });
      }

      if (!resumeFile) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_FILE',
          message: 'Resume file is required'
        });
      }

      // Extract text from file
      let resumeText = '';
      try {
        resumeText = await this.extractTextFromFile(resumeFile);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'TEXT_EXTRACTION_FAILED',
          message: 'Failed to extract text from resume file'
        });
      }

      // Save resumeText to user profile
      if (userId && resumeText) {
        await User.findByIdAndUpdate(userId, { resumeText }, { new: false }).catch(e => console.warn('failed saving resumeText', e));
      }

      // Core AI analysis using Vertex AI
      try {
        // Get user profile for role-aware analysis
        const userProfile = await User.findById(userId).select('profile');
        const analysisResult = await aiService.analyzeResume(resumeText, userProfile);
        
        // Generate job recommendations using mock service for demo
        const jobService = await import('../services/jobService.js');
        const jobRecommendations = jobService.default.getJobRecommendations(
          userProfile?.profile || { careerGoal: 'fullstack-developer', experience: 'intermediate', interests: [] },
          analysisResult
        );

        // Format response for frontend
        const response = {
          extractedSkills: analysisResult.skills || [],
          skillGaps: analysisResult.skillGaps || [],
          overallScore: analysisResult.overallScore || 75,
          recommendations: analysisResult.recommendations || 'Great resume! Consider adding more specific achievements.',
          learningPath: analysisResult.learningPath || [],
          jobRecommendations: jobRecommendations || [],
          rawText: resumeText,
          analysisDate: new Date().toISOString(),
          fileName: resumeFile.originalname
        };

        res.status(200).json({
          success: true,
          data: response,
          message: 'Resume analysis completed successfully'
        });

      } catch (aiError) {
        console.error('AI analysis failed:', aiError);
        
        // Fallback response for demo stability
        const fallbackResponse = {
          extractedSkills: this.quickExtractSkills(resumeText),
          skillGaps: ['Cloud Computing', 'DevOps', 'System Design'],
          overallScore: 78,
          recommendations: 'Your resume shows strong technical skills. Consider adding more quantified achievements and cloud computing experience.',
          learningPath: [
            { step: 'Learn AWS fundamentals', estimatedTime: '2-3 weeks', priority: 'high' },
            { step: 'Practice system design', estimatedTime: '1-2 months', priority: 'medium' }
          ],
          jobRecommendations: [
            {
              title: 'Full Stack Developer',
              description: 'Build responsive web applications using modern JavaScript frameworks and backend technologies.',
              matchReason: 'Your JavaScript and React skills align well with full-stack development roles.',
              requiredSkills: ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS'],
              salaryRange: '$60,000 - $85,000',
              experienceLevel: 'Mid Level',
              matchScore: 85
            },
            {
              title: 'Software Engineer',
              description: 'Develop scalable software solutions and work on challenging technical problems.',
              matchReason: 'Your technical background and problem-solving skills match software engineering requirements.',
              requiredSkills: ['Programming', 'Problem Solving', 'Git', 'Testing', 'Debugging'],
              salaryRange: '$55,000 - $80,000',
              experienceLevel: 'Entry to Mid Level',
              matchScore: 82
            }
          ],
          rawText: resumeText,
          analysisDate: new Date().toISOString(),
          fileName: resumeFile.originalname
        };

        res.status(200).json({
          success: true,
          data: fallbackResponse,
          message: 'Resume analysis completed using backup system',
          source: 'fallback'
        });
      }

    } catch (error) {
      console.error('Error analyzing resume:', error);
      res.status(500).json({
        success: false,
        error: 'ANALYSIS_FAILED',
        message: 'Failed to analyze resume. Please try again.'
      });
    }
  }

  // Simplified method for basic analysis retrieval (optional for hackathon)
  async getAnalysis(req, res) {
    try {
      res.json({ 
        success: true, 
        message: 'Use the analyze endpoint for real-time analysis',
        data: null 
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: 'FETCH_FAILED',
        message: 'Failed to fetch analysis'
      });
    }
  }

  // Helper method to extract file extension
  getFileExtension(filename) {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  // Helper method to extract text from different file types
  async extractTextFromFile(file) {
    const fileExtension = this.getFileExtension(file.originalname);

    try {
      switch (fileExtension) {
        case 'pdf':
          return await this.extractTextFromPDF(file.buffer);
        case 'doc':
        case 'docx':
          return await this.extractTextFromWord(file.buffer);
        case 'txt':
          return file.buffer.toString('utf-8');
        default:
          throw new Error(`Unsupported file type: ${fileExtension}`);
      }
    } catch (error) {
      console.error(`Text extraction failed for ${fileExtension}:`, error);
      throw new Error(`Failed to extract text from ${fileExtension} file: ${error.message}`);
    }
  }

  // Extract text from PDF files
  async extractTextFromPDF(buffer) {
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const pdfData = await pdfParse(buffer);
      return pdfData.text || '';
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  // Extract text from Word documents
  async extractTextFromWord(buffer) {
    try {
      const mammoth = (await import('mammoth')).default;
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    } catch (error) {
      console.error('Word extraction error:', error);
      throw new Error('Failed to extract text from Word document');
    }
  }

  // Quick skill extraction fallback
  quickExtractSkills(text) {
    const skillSeed = ['python','java','javascript','node','react','tensorflow','keras','pandas','numpy','docker','kubernetes','aws','gcp','azure','sql','mongodb','postgres','git','html','css','angular','vue','express','django','flask','spring','laravel','php','ruby','rails','c++','c#','swift','kotlin','flutter','dart','typescript','redux','graphql','rest','api','microservices','agile','scrum','jenkins','ci/cd','linux','bash','powershell','elasticsearch','redis','firebase','heroku','netlify','vercel'];
    const found = new Set();
    const lower = text.toLowerCase();
    for (const s of skillSeed) {
      if (lower.includes(s)) found.add(s.charAt(0).toUpperCase() + s.slice(1));
    }
    return Array.from(found);
  }
}

export default new ResumeController();