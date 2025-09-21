/**
 * Resume Analysis Service
 * Integrates resume parsing with AI-powered career analysis
 */

import ResumeParsingService from './ResumeParsingService.js';
import aiService from './aiService.js';
import { VertexAI } from '@google-cloud/vertexai';

class ResumeAnalysisService {
  constructor() {
    this.resumeParser = new ResumeParsingService();
    this.aiService = aiService;
    
    // Initialize Vertex AI
    this.vertexAI = null;
    this.initializeVertexAI();
    
    // Enhanced career-focused prompt template
    this.careerAnalysisPrompt = `
Analyze the following resume data and provide comprehensive career guidance focused on skill development and career progression.

RESUME DATA:
Text: {resumeText}
Identified Skills: {identifiedSkills}
Experience: {experience}
Education: {education}
Contact Info: {contactInfo}
Text Quality Score: {qualityScore}

USER PROFILE:
Grade: {grade}
Interests: {interests}
Career Goals: {careerGoals}
Current Skills: {currentSkills}

ANALYSIS REQUIREMENTS:
1. Identify all technical and soft skills from the resume
2. Compare with current market demands for the user's career goals
3. Identify specific skill gaps that need to be addressed
4. Create a personalized learning path with actionable steps
5. Provide realistic timeline estimates for skill development
6. Include specific resource recommendations (courses, certifications, projects)
7. Assess career readiness and provide next steps

Please provide your analysis in the following JSON structure:
{
  "skillAnalysis": {
    "identifiedSkills": {
      "technical": ["skill1", "skill2"],
      "soft": ["skill1", "skill2"],
      "domain": ["skill1", "skill2"]
    },
    "skillStrengths": ["strength1", "strength2"],
    "skillGaps": {
      "critical": ["gap1", "gap2"],
      "important": ["gap1", "gap2"],
      "nice-to-have": ["gap1", "gap2"]
    },
    "marketAlignment": {
      "score": 75,
      "analysis": "Detailed analysis of how skills align with market demands"
    }
  },
  "careerPath": [
    {
      "step": "Step title",
      "description": "Detailed description of what to do",
      "skills": ["skill1", "skill2"],
      "resources": [
        {
          "title": "Resource title",
          "url": "https://example.com",
          "type": "course|certification|project|book|tutorial",
          "duration": "2-3 weeks",
          "difficulty": "beginner|intermediate|advanced",
          "cost": "free|paid"
        }
      ],
      "estimatedTime": "2-3 months",
      "priority": "high|medium|low",
      "prerequisites": ["prereq1", "prereq2"],
      "outcomes": ["outcome1", "outcome2"]
    }
  ],
  "careerReadiness": {
    "overallScore": 75,
    "breakdown": {
      "technical": 80,
      "experience": 70,
      "education": 85,
      "soft_skills": 65
    },
    "readinessLevel": "entry|junior|mid|senior",
    "timeToReadiness": "3-6 months"
  },
  "recommendations": {
    "immediate": ["action1", "action2"],
    "shortTerm": ["action1", "action2"],
    "longTerm": ["action1", "action2"]
  },
  "industryInsights": {
    "trendingSkills": ["skill1", "skill2"],
    "growingFields": ["field1", "field2"],
    "salaryExpectations": {
      "entry": "$50,000 - $70,000",
      "mid": "$70,000 - $100,000",
      "senior": "$100,000+"
    }
  }
}

Focus on actionable, career-oriented guidance that helps the user progress toward their goals.`;
  }

  /**
   * Initialize Vertex AI with environment variables
   */
  async initializeVertexAI() {
    try {
      // Set up Vertex AI configuration
      const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'udaan-ai';
      const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
      
      // Set credentials path if provided
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      }

      this.vertexAI = new VertexAI({
        project: projectId,
        location: location
      });

      console.log('Vertex AI initialized successfully');
    } catch (error) {
      console.warn('Vertex AI initialization failed, falling back to basic AI service:', error.message);
      this.vertexAI = null;
    }
  }

  /**
   * Perform comprehensive resume analysis with AI integration
   */
  async analyzeResume(fileBuffer, fileName, userProfile = {}) {
    try {
      // Step 1: Validate and parse the resume file
      const fileValidation = await this.resumeParser.validateFile(fileBuffer, fileName);
      if (!fileValidation.isValid) {
        throw new Error(`File validation failed: ${fileValidation.error}`);
      }

      // Step 2: Parse resume content
      const parseResult = await this.resumeParser.parseResume(fileBuffer, fileValidation.mimeType);
      
      // Step 3: Prepare data for AI analysis
      const analysisData = this.prepareAnalysisData(parseResult, userProfile);
      
      // Step 4: Get AI-powered career analysis
      const aiAnalysis = await this.getAIAnalysis(analysisData, userProfile);
      
      // Step 5: Combine and enhance results
      const finalAnalysis = this.combineResults(parseResult, aiAnalysis, fileValidation);
      
      return finalAnalysis;
    } catch (error) {
      throw new Error(`Resume analysis failed: ${error.message}`);
    }
  }

  /**
   * Prepare data for AI analysis
   */
  prepareAnalysisData(parseResult, userProfile) {
    return {
      resumeText: parseResult.resumeText,
      identifiedSkills: parseResult.extractedSkills.join(', '),
      experience: this.formatExperience(parseResult.experience),
      education: this.formatEducation(parseResult.education),
      contactInfo: this.formatContactInfo(parseResult.contactInfo),
      qualityScore: parseResult.textQuality.score,
      grade: userProfile.grade || 'Not specified',
      interests: Array.isArray(userProfile.interests) ? userProfile.interests.join(', ') : 'Not specified',
      careerGoals: Array.isArray(userProfile.careerGoals) ? userProfile.careerGoals.join(', ') : 'Not specified',
      currentSkills: Array.isArray(userProfile.skills) ? userProfile.skills.join(', ') : 'Not specified'
    };
  }

  /**
   * Get AI-powered analysis using enhanced prompt
   */
  async getAIAnalysis(analysisData, userProfile = {}) {
    try {
      // Build the enhanced prompt
      let prompt = this.careerAnalysisPrompt;
      Object.keys(analysisData).forEach(key => {
        const placeholder = `{${key}}`;
        prompt = prompt.replace(new RegExp(placeholder, 'g'), analysisData[key]);
      });

      let response;

      // Try Vertex AI first if available
      if (this.vertexAI) {
        try {
          const model = this.vertexAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
              maxOutputTokens: 8192,
              temperature: 0.3,
              topP: 0.8,
            },
          });

          const result = await model.generateContent(prompt);
          response = result.response.candidates[0].content.parts[0].text;
        } catch (vertexError) {
          console.warn('Vertex AI failed, falling back to aiService:', vertexError.message);
          throw vertexError;
        }
      } else {
        // Fallback to existing AI service
        if (!this.aiService.isReady()) {
          await this.aiService.initialize();
        }

        // Pass user profile to AI service for role-aware analysis
        response = await this.aiService.analyzeResume(analysisData.resumeText, userProfile);
      }

      // Parse and validate response
      return this.parseAIResponse(response);
    } catch (error) {
      // Fallback to basic analysis if AI fails
      console.warn('AI analysis failed, using fallback:', error.message);
      return this.getFallbackAnalysis(analysisData);
    }
  }

  /**
   * Parse AI response with enhanced validation
   */
  parseAIResponse(response) {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required structure
      const requiredFields = ['skillAnalysis', 'careerPath', 'careerReadiness', 'recommendations'];
      for (const field of requiredFields) {
        if (!parsed[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate skill analysis structure
      if (!parsed.skillAnalysis.identifiedSkills || !parsed.skillAnalysis.skillGaps) {
        throw new Error('Invalid skill analysis structure');
      }

      // Validate career path structure
      if (!Array.isArray(parsed.careerPath) || parsed.careerPath.length === 0) {
        throw new Error('Invalid career path structure');
      }

      return parsed;
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  /**
   * Provide fallback analysis when AI is unavailable
   */
  getFallbackAnalysis(analysisData) {
    const skills = analysisData.identifiedSkills ? 
      analysisData.identifiedSkills.split(', ').filter(s => s.trim()) : 
      ['JavaScript', 'React', 'Node.js', 'CSS', 'HTML'];
    
    return {
      skillAnalysis: {
        identifiedSkills: {
          technical: skills.filter(s => this.isTechnicalSkill(s)).length > 0 ? 
            skills.filter(s => this.isTechnicalSkill(s)) : 
            ['JavaScript', 'React', 'CSS'],
          soft: skills.filter(s => this.isSoftSkill(s)).length > 0 ? 
            skills.filter(s => this.isSoftSkill(s)) : 
            ['Communication', 'Teamwork'],
          domain: ['Web Development', 'Frontend']
        },
        skillStrengths: skills.slice(0, 3).length > 0 ? skills.slice(0, 3) : ['JavaScript', 'React', 'CSS'],
        skillGaps: {
          critical: ['TypeScript', 'GraphQL'],
          important: ['Docker', 'AWS', 'Testing'],
          'nice-to-have': ['Redux', 'Next.js', 'MongoDB']
        },
        marketAlignment: {
          score: 65,
          analysis: 'Basic skill assessment completed. AI analysis unavailable.'
        }
      },
      careerPath: [
        {
          step: 'Learn TypeScript',
          description: 'Master TypeScript for better JavaScript development',
          skills: ['TypeScript', 'Type Safety', 'Advanced JavaScript'],
          resources: [
            {
              title: 'TypeScript Handbook',
              url: 'https://www.typescriptlang.org/docs/',
              type: 'tutorial',
              duration: '2-3 weeks',
              difficulty: 'intermediate',
              cost: 'free'
            }
          ],
          estimatedTime: '2-3 weeks',
          priority: 'high',
          prerequisites: ['JavaScript'],
          outcomes: ['Type-safe code', 'Better IDE support']
        },
        {
          step: 'Intro to GraphQL',
          description: 'Learn GraphQL for efficient API development',
          skills: ['GraphQL', 'API Design', 'Query Language'],
          resources: [
            {
              title: 'GraphQL Tutorial',
              url: 'https://graphql.org/learn/',
              type: 'tutorial',
              duration: '1-2 weeks',
              difficulty: 'intermediate',
              cost: 'free'
            }
          ],
          estimatedTime: '1-2 weeks',
          priority: 'high',
          prerequisites: ['JavaScript', 'APIs'],
          outcomes: ['Efficient data fetching', 'Modern API skills']
        }
      ],
      careerReadiness: {
        overallScore: 60,
        breakdown: {
          technical: 65,
          experience: 55,
          education: 70,
          soft_skills: 50
        },
        readinessLevel: 'entry',
        timeToReadiness: '6-12 months'
      },
      recommendations: {
        immediate: ['Update resume format', 'Complete online profile'],
        shortTerm: ['Learn in-demand skills', 'Build portfolio projects'],
        longTerm: ['Gain work experience', 'Pursue advanced certifications']
      },
      industryInsights: {
        trendingSkills: ['AI/ML', 'Cloud Computing', 'Data Analysis'],
        growingFields: ['Technology', 'Healthcare', 'Renewable Energy'],
        salaryExpectations: {
          entry: '$40,000 - $60,000',
          mid: '$60,000 - $90,000',
          senior: '$90,000+'
        }
      }
    };
  }

  /**
   * Combine parsing results with AI analysis
   */
  combineResults(parseResult, aiAnalysis, fileValidation) {
    return {
      // File and parsing metadata
      fileInfo: {
        fileName: fileValidation.fileName || 'resume',
        fileSize: fileValidation.sizeInMB,
        fileType: fileValidation.mimeType,
        processingTime: new Date().toISOString()
      },
      
      // Text extraction results
      textAnalysis: {
        extractedText: parseResult.resumeText,
        fullTextLength: parseResult.fullTextLength,
        textQuality: parseResult.textQuality,
        contactInfo: parseResult.contactInfo,
        rawSkills: parseResult.extractedSkills,
        experience: parseResult.experience,
        education: parseResult.education
      },
      
      // AI-powered career analysis
      careerAnalysis: aiAnalysis,
      
      // Processing metadata
      metadata: {
        ...parseResult.metadata,
        aiAnalysisVersion: '2.0',
        analysisTimestamp: new Date().toISOString(),
        processingSteps: [
          'File validation',
          'Text extraction',
          'Content parsing',
          'AI analysis',
          'Result combination'
        ]
      }
    };
  }

  /**
   * Format experience data for AI analysis
   */
  formatExperience(experience) {
    if (!Array.isArray(experience) || experience.length === 0) {
      return 'No work experience found';
    }

    return experience.map(exp => 
      `${exp.role} at ${exp.company} (${exp.duration}): ${exp.skills.join(', ')}`
    ).join('; ');
  }

  /**
   * Format education data for AI analysis
   */
  formatEducation(education) {
    if (!Array.isArray(education) || education.length === 0) {
      return 'No education information found';
    }

    return education.map(edu => 
      `${edu.degree} from ${edu.institution} (${edu.year || 'Year not specified'})`
    ).join('; ');
  }

  /**
   * Format contact info for AI analysis
   */
  formatContactInfo(contactInfo) {
    if (!contactInfo) return 'No contact information found';
    
    const parts = [];
    if (contactInfo.emails && contactInfo.emails.length > 0) {
      parts.push(`Email: ${contactInfo.emails[0]}`);
    }
    if (contactInfo.linkedIn) {
      parts.push(`LinkedIn: ${contactInfo.linkedIn}`);
    }
    if (contactInfo.github) {
      parts.push(`GitHub: ${contactInfo.github}`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'No contact information found';
  }

  /**
   * Helper method to identify technical skills
   */
  isTechnicalSkill(skill) {
    const technicalKeywords = [
      'javascript', 'python', 'java', 'react', 'node', 'html', 'css',
      'sql', 'mongodb', 'mysql', 'postgresql', 'aws', 'azure', 'docker',
      'kubernetes', 'git', 'github', 'jenkins', 'ci/cd'
    ];
    return technicalKeywords.some(keyword => 
      skill.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Helper method to identify soft skills
   */
  isSoftSkill(skill) {
    const softKeywords = [
      'leadership', 'communication', 'teamwork', 'problem solving',
      'management', 'collaboration', 'presentation', 'negotiation'
    ];
    return softKeywords.some(keyword => 
      skill.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      resumeParser: 'ready',
      aiService: this.aiService.isReady() ? 'ready' : 'not_initialized',
      version: '2.0',
      features: [
        'File validation',
        'Text extraction',
        'Content parsing',
        'AI-powered analysis',
        'Career guidance',
        'Fallback analysis'
      ]
    };
  }
}

export default ResumeAnalysisService;