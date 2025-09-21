/**
 * AI Service - Simplified for Hackathon Prototype
 * Handles core AI functionality using Google Cloud Vertex AI
 */

import { VertexAI } from '@google-cloud/vertexai';
import aiConfig, { validateAIConfig } from '../config/ai.js';

// Simple logger
const logger = {
  info: (message, data) => console.log(`[INFO] ${message}`, data || ''),
  error: (message, data) => console.error(`[ERROR] ${message}`, data || ''),
  warn: (message, data) => console.warn(`[WARN] ${message}`, data || '')
};

// AI Service Error class
export class AIServiceError extends Error {
  constructor(message, type = 'unknown', originalError = null) {
    super(message);
    this.name = 'AIServiceError';
    this.type = type;
    this.originalError = originalError;
  }
}

class AIService {
  constructor() {
    this.vertexAI = null;
    this.model = null;
    this.isInitialized = false;
    this.logger = logger;
    this.responseCache = new Map();
  }

  /**
   * Initialize Vertex AI client and model
   */
  async initialize() {
    try {
      validateAIConfig();

      this.vertexAI = new VertexAI({
        project: aiConfig.googleCloud.projectId,
        location: aiConfig.googleCloud.location,
        googleAuthOptions: {
          keyFilename: aiConfig.googleCloud.credentials
        }
      });

      this.model = this.vertexAI.getGenerativeModel({
        model: aiConfig.vertexAI.model,
        generationConfig: {
          maxOutputTokens: aiConfig.vertexAI.maxTokens,
          temperature: aiConfig.vertexAI.temperature,
          topP: aiConfig.vertexAI.topP,
          topK: aiConfig.vertexAI.topK
        }
      });

      this.isInitialized = true;
      this.logger.info('AI Service initialized successfully', {
        model: aiConfig.vertexAI.model,
        project: aiConfig.googleCloud.projectId,
        location: aiConfig.googleCloud.location
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to initialize AI Service', {
        error: error.message,
        stack: error.stack
      });
      throw new AIServiceError('Failed to initialize AI Service', 'initialization_error', error);
    }
  }

  /**
   * Check if the service is ready
   */
  isReady() {
    return this.isInitialized && this.model !== null;
  }

  /**
   * Test connection to Vertex AI
   */
  async testConnection() {
    const diagnostics = {
      configurationValid: false,
      clientInitialized: false,
      modelAccessible: false,
      responseGenerated: false,
      overallHealth: 'unhealthy'
    };

    try {
      // Test configuration
      try {
        validateAIConfig();
        diagnostics.configurationValid = true;
      } catch (configError) {
        return {
          success: false,
          error: 'Configuration validation failed: ' + configError.message,
          diagnostics,
          timestamp: new Date().toISOString()
        };
      }

      // Test initialization
      if (!this.isReady()) {
        await this.initialize();
      }
      diagnostics.clientInitialized = true;
      diagnostics.modelAccessible = true;

      // Test response generation
      const testPrompt = 'Respond with exactly "Connection successful" if you can read this message.';
      const result = await this.generateContent(testPrompt, { 
        operation: 'connection_test',
        maxRetries: 1 
      });
      
      diagnostics.responseGenerated = true;
      const isSuccessful = result && result.toLowerCase().includes('connection successful');
      
      if (isSuccessful) {
        diagnostics.overallHealth = 'healthy';
        return {
          success: true,
          message: 'AI service is fully operational',
          response: result,
          diagnostics,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          error: 'AI service responding but with unexpected content',
          response: result,
          diagnostics,
          timestamp: new Date().toISOString()
        };
      }

    } catch (error) {
      return {
        success: false,
        error: error.message,
        diagnostics,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate content using the AI model with enhanced error handling
   */
  async generateContent(prompt, options = {}) {
    if (!this.isReady()) {
      // Attempt to reinitialize if not ready
      try {
        await this.initialize();
      } catch (initError) {
        throw new AIServiceError('AI Service not available and cannot be initialized', 'not_initialized', initError);
      }
    }

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new AIServiceError('Invalid prompt provided', 'invalid_input');
    }

    const maxRetries = options.maxRetries || aiConfig.service.maxRetries;
    const operation = options.operation || 'general';
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        
        // Create timeout promise with proper cleanup
        let timeoutId;
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Request timeout after ' + aiConfig.service.timeout + 'ms'));
          }, aiConfig.service.timeout);
        });

        // Make the request
        const requestPromise = this.model.generateContent(prompt);
        
        let result;
        try {
          result = await Promise.race([requestPromise, timeoutPromise]);
        } finally {
          // Clear timeout to prevent memory leaks
          if (timeoutId) clearTimeout(timeoutId);
        }

        const endTime = Date.now();

        // Validate response structure
        if (!result || !result.response) {
          throw new Error('Invalid response structure from AI model');
        }

        const candidates = result.response.candidates;
        if (!candidates || candidates.length === 0) {
          throw new Error('No candidates in AI response');
        }

        const candidate = candidates[0];
        
        // Check for safety or other blocking reasons
        if (candidate.finishReason && candidate.finishReason !== 'STOP') {
          const reason = candidate.finishReason;
          if (reason === 'SAFETY') {
            throw new Error('Content blocked due to safety filters');
          } else if (reason === 'MAX_TOKENS') {
            this.logger.warn('Response truncated due to max tokens limit');
          } else {
            throw new Error(`Response incomplete: ${reason}`);
          }
        }

        if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
          throw new Error('No content parts in AI response');
        }

        const responseText = candidate.content.parts[0].text;
        
        if (!responseText || responseText.trim().length === 0) {
          throw new Error('Empty response text from AI model');
        }

        this.logger.info('AI content generated successfully', {
          operation,
          attempt: attempt + 1,
          duration: endTime - startTime,
          promptLength: prompt.length,
          responseLength: responseText.length,
          finishReason: candidate.finishReason
        });

        return responseText;
      } catch (error) {
        lastError = error;
        
        this.logger.warn(`AI content generation attempt ${attempt + 1} failed`, {
          operation,
          error: error.message,
          attempt: attempt + 1,
          maxRetries: maxRetries + 1
        });
        
        if (attempt < maxRetries && this.isRetryableError(error)) {
          const delay = Math.min(
            aiConfig.service.retryDelay * Math.pow(2, attempt),
            aiConfig.service.maxRetryDelay || 10000
          );
          
          this.logger.info(`Retrying in ${delay}ms...`, { operation, attempt: attempt + 1 });
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }

    const finalError = new AIServiceError(
      `Failed to generate content after ${maxRetries + 1} attempts: ${lastError.message}`,
      this.categorizeError(lastError),
      lastError
    );

    this.logger.error('AI content generation failed completely', {
      operation,
      attempts: maxRetries + 1,
      finalError: finalError.message,
      errorType: finalError.type
    });

    throw finalError;
  }

  /**
   * Analyze resume and provide structured feedback
   */
  async analyzeResume(resumeText, userProfile = {}) {
    const startTime = Date.now();
    
    try {
      // Get the target role from user profile or default to Software Engineer
      const targetRole = this.getTargetRoleFromProfile(userProfile);
      
      // Extract skills first for context
      const identifiedSkills = this.fallbackSkillExtractor(resumeText);
      
      // Use the enhanced learning prompt
      const prompt = this.learningPrompt(resumeText, identifiedSkills, targetRole);

      const response = await this.generateContent(prompt, { operation: 'resume_analysis' });
      
      try {
        const cleanedResponse = response.trim();
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : cleanedResponse;
        
        const parsedResponse = JSON.parse(jsonString);
        
        // Handle new learning-focused format
        const skillGaps = parsedResponse.skillGaps || [];
        const learningPath = parsedResponse.learningPath || [];
        const recommendations = parsedResponse.recommendations || '';
        
        // Transform to expected format for backward compatibility
        const transformedResponse = {
          skills: identifiedSkills,
          identifiedSkills: identifiedSkills,
          skillGaps: skillGaps.map(gap => gap.name || gap),
          skillGapsDetailed: skillGaps.map(gap => ({
            skill: gap.name || gap,
            priority: gap.priority?.toLowerCase() || 'medium'
          })),
          learningPath: learningPath.map(step => ({
            title: step.title,
            duration: step.duration,
            priority: step.priority?.toLowerCase() || 'medium',
            resources: step.resources || []
          })),
          overallScore: Math.min(Math.max(identifiedSkills.length * 8 + 40, 60), 95),
          recommendations: recommendations || `Great resume! You have ${identifiedSkills.length} identified skills. Focus on the recommended learning path to advance your ${targetRole} career.`
        };

        this.logger.info('Resume analysis completed successfully', {
          skillsFound: transformedResponse.identifiedSkills?.length || 0,
          gapsIdentified: transformedResponse.skillGaps?.length || 0,
          learningSteps: transformedResponse.learningPath?.length || 0,
          score: transformedResponse.overallScore
        });

        return transformedResponse;
      } catch (parseError) {
        this.logger.warn('Failed to parse resume analysis JSON, using fallback');
        
        // Use fallback skill extraction
        const fallbackSkills = this.fallbackSkillExtractor(resumeText);
        
        // Generate role-specific fallback analysis
        const fallbackAnalysis = this.getRoleSpecificFallbackAnalysis(targetRole, identifiedSkills);
        return fallbackAnalysis;
      }
    } catch (error) {
      this.logger.error('Resume analysis failed', { error: error.message });
      throw new AIServiceError(`Resume analysis failed: ${error.message}`, 'analysis_failed', error);
    } finally {
      const duration = Date.now() - startTime;
      this.logger.info('Resume analysis completed', { 
        duration, 
        resumeLength: resumeText.length,
        userId: userProfile.userId 
      });
    }
  }

  /**
   * Generate recommendations text from learning path
   */
  generateRecommendationsFromLearningPath(learningPath) {
    if (!learningPath || learningPath.length === 0) {
      return 'Focus on continuous learning and skill development to advance your career.';
    }
    
    const recommendations = learningPath.map((step, index) => 
      `${index + 1}. ${step.title} (${step.duration}): Start with ${step.resources?.[0] || 'relevant resources'}.`
    ).join(' ');
    
    return recommendations;
  }

  /**
   * Enhanced learning-focused prompt for resume analysis
   */
  learningPrompt(resumeText, identifiedSkills, targetRole) {
    return `You are analyzing a candidate resume for the role of ${targetRole}.

Resume text: ${resumeText.substring(0, 5000)}

Identified technical skills from resume: ${JSON.stringify(identifiedSkills)}

Now perform these tasks:
1. List *only* the top 3–5 **missing or weak skills** critical for ${targetRole}, given the skills already identified. Avoid generic items unless absolutely missing in resume.
2. For each skill gap, recommend a concrete **learning path** with:
   - Specific resources (official docs, well-known courses, GitHub repos, videos).
   - Estimated completion time (realistic).
   - Priority (High, Medium, Low).
3. Make recommendations actionable, role-specific, and avoid repeating generic terms like "leadership" unless explicitly relevant to the resume.

Respond in strict JSON with structure:
{
  "skillGaps": [
    {"name": "Docker & Kubernetes", "priority": "High"},
    {"name": "Advanced SQL Optimization", "priority": "Medium"}
  ],
  "learningPath": [
    {
      "title": "Docker & Kubernetes Fundamentals",
      "priority": "High",
      "duration": "3-4 weeks",
      "resources": [
        {"title": "Kubernetes Official Tutorial", "url": "https://kubernetes.io/docs/tutorials/"},
        {"title": "Docker Mastery Course", "url": "https://www.udemy.com/course/docker-mastery/"}
      ]
    }
  ],
  "recommendations": "Highlight your strengths in Python ML but add deployment skills for ML Engineer roles."
}`;
  }

  /**
   * Get target role from user profile
   */
  getTargetRoleFromProfile(userProfile) {
    const careerGoal = userProfile?.profile?.careerGoal || userProfile?.careerGoal;
    
    // Map career goals to readable role names
    const roleMapping = {
      'frontend-developer': 'Frontend Developer',
      'backend-developer': 'Backend Developer',
      'fullstack-developer': 'Full Stack Developer',
      'ml-engineer': 'ML Engineer',
      'data-scientist': 'Data Scientist',
      'devops-engineer': 'DevOps Engineer',
      'mobile-developer': 'Mobile Developer',
      'ui-ux-designer': 'UI/UX Designer'
    };
    
    return roleMapping[careerGoal] || 'Software Engineer';
  }

  /**
   * Generate role-specific fallback analysis when AI parsing fails
   */
  getRoleSpecificFallbackAnalysis(targetRole, identifiedSkills) {
    const roleSpecificGaps = {
      'ML Engineer': [
        { name: 'TensorFlow Serving', priority: 'High' },
        { name: 'Feature Stores', priority: 'Medium' },
        { name: 'Data Drift Monitoring', priority: 'Medium' }
      ],
      'DevOps Engineer': [
        { name: 'Terraform', priority: 'High' },
        { name: 'Prometheus', priority: 'High' },
        { name: 'Helm', priority: 'Medium' }
      ],
      'Frontend Developer': [
        { name: 'TypeScript', priority: 'High' },
        { name: 'Testing (Jest/Cypress)', priority: 'High' },
        { name: 'Performance Optimization', priority: 'Medium' }
      ],
      'Backend Developer': [
        { name: 'Microservices Architecture', priority: 'High' },
        { name: 'Database Optimization', priority: 'High' },
        { name: 'API Security', priority: 'Medium' }
      ],
      'Data Scientist': [
        { name: 'MLOps', priority: 'High' },
        { name: 'Statistical Analysis', priority: 'High' },
        { name: 'Data Visualization', priority: 'Medium' }
      ]
    };

    const roleSpecificLearning = {
      'ML Engineer': [
        {
          title: 'TensorFlow Serving & Deployment',
          duration: '3-4 weeks',
          priority: 'High',
          resources: [
            { title: 'TensorFlow Serving Guide', url: 'https://www.tensorflow.org/tfx/guide/serving' },
            { title: 'ML Model Deployment Course', url: 'https://www.coursera.org/learn/machine-learning-deployment' }
          ]
        }
      ],
      'DevOps Engineer': [
        {
          title: 'Infrastructure as Code with Terraform',
          duration: '4-5 weeks',
          priority: 'High',
          resources: [
            { title: 'Terraform Documentation', url: 'https://www.terraform.io/docs' },
            { title: 'HashiCorp Learn', url: 'https://learn.hashicorp.com/terraform' }
          ]
        }
      ],
      'Frontend Developer': [
        {
          title: 'TypeScript Fundamentals',
          duration: '2-3 weeks',
          priority: 'High',
          resources: [
            { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/' },
            { title: 'TypeScript Course', url: 'https://www.udemy.com/course/understanding-typescript/' }
          ]
        }
      ]
    };

    const gaps = roleSpecificGaps[targetRole] || [
      { name: 'System Design', priority: 'High' },
      { name: 'Leadership', priority: 'Medium' },
      { name: 'Advanced Algorithms', priority: 'Medium' }
    ];

    const learning = roleSpecificLearning[targetRole] || [
      {
        title: 'System Design Fundamentals',
        duration: '4-6 weeks',
        priority: 'High',
        resources: [
          { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' },
          { title: 'Designing Data-Intensive Applications', url: 'https://dataintensive.net/' }
        ]
      }
    ];

    return {
      identifiedSkills: identifiedSkills.length > 0 ? identifiedSkills : ['Communication', 'Problem Solving', 'Teamwork'],
      skillGaps: gaps.map(gap => gap.name),
      skillGapsDetailed: gaps.map(gap => ({
        skill: gap.name,
        priority: gap.priority.toLowerCase()
      })),
      learningPath: learning,
      overallScore: Math.min(Math.max(identifiedSkills.length * 8 + 40, 60), 95),
      recommendations: `Focus on developing ${targetRole}-specific skills. Your current skills provide a good foundation - now add the specialized knowledge needed for ${targetRole} roles.`
    };
  }

  /**
   * Fallback skill extractor when AI fails
   */
  fallbackSkillExtractor(resumeText) {
    const SKILL_KEYWORDS = [
      'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'Rust',
      'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask',
      'Spring', 'Laravel', 'Ruby on Rails', 'ASP.NET',
      'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'Elasticsearch', 'SQLite',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins',
      'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence',
      'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy',
      'HTML', 'CSS', 'SASS', 'LESS', 'Bootstrap', 'Tailwind CSS',
      'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'DevOps',
      'Linux', 'Ubuntu', 'CentOS', 'Windows Server', 'macOS',
      'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator'
    ];
    
    const text = resumeText.toLowerCase();
    const foundSkills = SKILL_KEYWORDS.filter(skill => 
      text.includes(skill.toLowerCase())
    );
    
    // Remove duplicates and return
    return [...new Set(foundSkills)];
  }

  /**
   * Generate job recommendations based on resume analysis
   */
  async generateJobRecommendations(analysisResult, userProfile = {}) {
    const startTime = Date.now();
    
    try {
      const skillsText = Array.isArray(analysisResult.identifiedSkills) 
        ? analysisResult.identifiedSkills.join(', ') 
        : 'No specific skills identified';
      
      const prompt = `You are an AI career advisor generating personalized job recommendations for Indian tech professionals. Create exactly 3 highly relevant job suggestions for the Indian job market.

CANDIDATE PROFILE:
- Key Skills: ${skillsText}
- Resume Score: ${analysisResult.overallScore || 75}/100
- Career Interests: ${Array.isArray(userProfile.careerGoals) ? userProfile.careerGoals.join(', ') : 'Professional Growth'}
- Experience Level: ${userProfile.experienceLevel || 'Mid-level'}

REQUIREMENTS:
1. Generate exactly 3 distinct job recommendations for Indian companies
2. Each job should directly match the candidate's skills
3. Include realistic Indian salary ranges in INR (LPA format)
4. Focus on Indian tech hubs: Bangalore, Hyderabad, Pune, Mumbai, Delhi NCR
5. Show progression from current level to next career step

REQUIRED JSON FORMAT (respond with ONLY this JSON array, no other text):
[
  {
    "title": "Specific Job Title",
    "company": "Indian Company Name",
    "description": "Compelling 2-sentence job description highlighting growth opportunities and impact in Indian context",
    "matchReason": "Specific explanation of why this role matches their [skill] and [skill] background, with clear career progression path",
    "requiredSkills": ["Primary Skill", "Secondary Skill", "Growth Skill"],
    "salaryRange": "₹XX,00,000 - ₹XX,00,000 per year (XX-XX LPA)",
    "location": "Indian City / Remote",
    "experienceLevel": "Mid-Level",
    "matchScore": 85
  }
]

IMPORTANT: 
- Use Indian Rupees (₹) and LPA format for salaries
- Reference Indian companies like Flipkart, Zomato, Paytm, Swiggy, etc.
- Include Indian tech hubs as locations
- Make recommendations specific to Indian job market context`;

      const response = await this.generateContent(prompt, { operation: 'job_recommendations' });
      
      try {
        const cleanedResponse = response.trim();
        const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
        const jsonString = jsonMatch ? jsonMatch[0] : cleanedResponse;
        
        const recommendations = JSON.parse(jsonString);
        
        if (!Array.isArray(recommendations)) {
          throw new Error('Response is not an array');
        }

        const validatedRecommendations = recommendations.slice(0, 2).map((rec, index) => ({
          title: rec.title || `Career Opportunity ${index + 1}`,
          description: rec.description || 'Exciting opportunity to grow your career.',
          matchReason: rec.matchReason || 'Your skills align well with this role.',
          requiredSkills: Array.isArray(rec.requiredSkills) ? rec.requiredSkills.slice(0, 5) : [],
          salaryRange: rec.salaryRange || 'Competitive salary',
          experienceLevel: rec.experienceLevel || 'Entry to Mid Level',
          matchScore: Math.floor(Math.random() * 20) + 75
        }));

        this.logger.info('Job recommendations generated successfully', {
          recommendationsCount: validatedRecommendations.length
        });

        return validatedRecommendations;
      } catch (parseError) {
        this.logger.warn('Failed to parse job recommendations JSON, using fallback');
        
        return [
          {
            title: 'Software Developer',
            company: 'Flipkart',
            description: 'Start your career in software development with mentorship and growth opportunities at India\'s leading e-commerce platform.',
            matchReason: 'Perfect for building foundational skills and gaining experience in a fast-paced Indian tech environment.',
            requiredSkills: ['Programming', 'Problem Solving', 'Learning Agility'],
            salaryRange: '₹6,00,000 - ₹12,00,000 per year (6-12 LPA)',
            location: 'Bangalore / Hybrid',
            experienceLevel: 'Entry Level',
            matchScore: 78
          },
          {
            title: 'Business Analyst',
            company: 'Paytm',
            description: 'Analyze business requirements and provide data-driven insights for India\'s leading fintech platform.',
            matchReason: 'Your analytical thinking skills are valuable for business analysis in the growing Indian fintech sector.',
            requiredSkills: ['Data Analysis', 'Communication', 'Documentation'],
            salaryRange: '₹8,00,000 - ₹15,00,000 per year (8-15 LPA)',
            location: 'Noida / Remote',
            experienceLevel: 'Entry to Mid Level',
            matchScore: 82
          },
          {
            title: 'Frontend Developer',
            company: 'Zomato',
            description: 'Build user interfaces for food delivery platform serving millions of Indian customers.',
            matchReason: 'Your technical skills and user-focused approach align with our product development needs.',
            requiredSkills: ['React.js', 'JavaScript', 'UI/UX'],
            salaryRange: '₹10,00,000 - ₹18,00,000 per year (10-18 LPA)',
            location: 'Gurgaon / Hybrid',
            experienceLevel: 'Mid Level',
            matchScore: 85
          }
        ];
      }
    } catch (error) {
      this.logger.error('Job recommendations generation failed', { error: error.message });
      throw new AIServiceError(`Job recommendations failed: ${error.message}`, 'generation_failed', error);
    } finally {
      const duration = Date.now() - startTime;
      this.logger.info('Job recommendations completed', { 
        duration, 
        userProfile: userProfile?.careerGoals || []
      });
    }
  }

  /**
   * Generate interview questions (simplified for hackathon)
   */
  async generateInterviewQuestions(resumeContent = '', role = 'software-developer', questionCount = 5, careerGoal = null) {
    try {
      // Determine the career goal to use for job-specific questions
      const targetCareer = careerGoal || role;
      
      // Extract skills from resume for context
      const resumeSkills = this.fallbackSkillExtractor(resumeContent).join(', ') || 'General technical skills';
      
      const prompt = `You are an AI interview generator. Create ${questionCount} role-specific interview questions.

Job Role: ${targetCareer}
Resume Skills: ${resumeSkills}

MANDATORY RULES:
- At least 2 technical deep-dive questions based on resume skills
- 1 system design/architecture question relevant to the role
- 1 behavioral (STAR method) question
- 1 troubleshooting/debugging question specific to the role

ROLE-SPECIFIC REQUIREMENTS:
- DevOps Engineer: CI/CD pipelines, Docker, Kubernetes, Terraform, AWS monitoring, infrastructure automation
- Frontend Developer: React/Angular performance, JavaScript optimization, responsive design, browser compatibility
- Data Scientist: ML model evaluation, feature engineering, Python/R, statistical analysis, data pipeline design
- Backend Developer: API design, database optimization, system scalability, microservices architecture
- Full Stack Developer: End-to-end system design, frontend-backend integration, performance optimization

Return JSON format:
{
  "questions": [
    {
      "q": "How would you implement a CI/CD pipeline for microservices with zero-downtime deployment?",
      "type": "technical",
      "tip": "Focus on deployment strategies, testing stages, and rollback mechanisms"
    },
    {
      "q": "Describe a time when you had to debug a production issue under pressure.",
      "type": "behavioral", 
      "tip": "Use STAR method: Situation, Task, Action, Result"
    }
  ]
}

Resume Context:
\`\`\`${resumeContent.substring(0, 1000)}\`\`\``;

      const response = await this.generateContent(prompt, { operation: 'interview_questions' });
      
      try {
        const cleanedResponse = response.trim();
        // Try to match the new format first
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : cleanedResponse;
        
        const parsedResponse = JSON.parse(jsonString);
        
        // Handle new format with "questions" array
        if (parsedResponse.questions && Array.isArray(parsedResponse.questions)) {
          return parsedResponse.questions.map((q, index) => ({
            question: q.q || q.question,
            type: q.type || 'behavioral',
            difficulty: 'medium',
            category: q.type === 'technical' ? 'technical' : 'behavioral',
            tip: q.tip || 'Take your time to think through your answer and provide specific examples.'
          }));
        }
        
        // Handle old format (array of questions)
        if (Array.isArray(parsedResponse)) {
          return parsedResponse;
        }
        
        // If neither format, throw error to use fallback
        throw new Error('Unexpected response format');
      } catch (parseError) {
        // Generate career-specific fallback questions
        return this.getCareerSpecificFallbackQuestions(targetCareer, questionCount);
      }
    } catch (error) {
      this.logger.error('Interview questions generation failed', { error: error.message });
      throw new AIServiceError(`Interview questions failed: ${error.message}`, 'generation_failed', error);
    }
  }

  /**
   * Get career-specific fallback questions when AI fails
   */
  getCareerSpecificFallbackQuestions(careerGoal, questionCount = 5) {
    const careerQuestions = {
      'devops-engineer': [
        {
          question: 'Explain how you would implement a CI/CD pipeline for a microservices architecture.',
          type: 'technical',
          difficulty: 'medium',
          category: 'technical',
          tip: 'Focus on automation, testing stages, and deployment strategies'
        },
        {
          question: 'How would you monitor and troubleshoot a Kubernetes cluster in production?',
          type: 'technical',
          difficulty: 'medium',
          category: 'technical',
          tip: 'Discuss monitoring tools, logging, and debugging approaches'
        },
        {
          question: 'Describe your experience with Infrastructure as Code tools like Terraform.',
          type: 'technical',
          difficulty: 'medium',
          category: 'technical',
          tip: 'Explain benefits and provide specific examples'
        },
        {
          question: 'How do you ensure security in your DevOps practices?',
          type: 'technical',
          difficulty: 'medium',
          category: 'technical',
          tip: 'Cover security scanning, secrets management, and compliance'
        },
        {
          question: 'Tell me about a time when you had to optimize system performance.',
          type: 'behavioral',
          difficulty: 'medium',
          category: 'problem-solving',
          tip: 'Use STAR method and focus on measurable improvements'
        }
      ],
      'frontend-developer': [
        {
          question: 'How do you optimize React application performance?',
          type: 'technical',
          difficulty: 'medium',
          category: 'technical',
          tip: 'Discuss memoization, lazy loading, and bundle optimization'
        },
        {
          question: 'Explain the difference between controlled and uncontrolled components in React.',
          type: 'technical',
          difficulty: 'medium',
          category: 'technical',
          tip: 'Provide examples and explain when to use each'
        },
        {
          question: 'How do you ensure cross-browser compatibility in your applications?',
          type: 'technical',
          difficulty: 'medium',
          category: 'technical',
          tip: 'Mention testing tools, polyfills, and progressive enhancement'
        },
        {
          question: 'Describe your approach to responsive web design.',
          type: 'technical',
          difficulty: 'medium',
          category: 'technical',
          tip: 'Cover mobile-first design, CSS Grid, and Flexbox'
        },
        {
          question: 'Tell me about a challenging UI/UX problem you solved.',
          type: 'behavioral',
          difficulty: 'medium',
          category: 'problem-solving',
          tip: 'Focus on user research, iteration, and measurable outcomes'
        }
      ],
      'data-scientist': [
        {
          question: 'How do you handle missing data in your machine learning models?',
          type: 'technical',
          difficulty: 'medium',
          category: 'technical',
          tip: 'Discuss imputation techniques and their trade-offs'
        },
        {
          question: 'Explain the bias-variance tradeoff in machine learning.',
          type: 'technical',
          difficulty: 'medium',
          category: 'technical',
          tip: 'Use examples and explain how to balance both'
        },
        {
          question: 'How do you evaluate the performance of a classification model?',
          type: 'technical',
          difficulty: 'medium',
          category: 'technical',
          tip: 'Cover accuracy, precision, recall, F1-score, and ROC curves'
        },
        {
          question: 'Describe your experience with feature engineering.',
          type: 'technical',
          difficulty: 'medium',
          category: 'technical',
          tip: 'Provide specific examples and explain the impact'
        },
        {
          question: 'Tell me about a data science project where you had to communicate findings to non-technical stakeholders.',
          type: 'behavioral',
          difficulty: 'medium',
          category: 'communication',
          tip: 'Focus on visualization and storytelling techniques'
        }
      ],
      'backend-developer': [
        {
          question: 'How do you design RESTful APIs for scalability?',
          type: 'technical',
          difficulty: 'medium',
          category: 'technical',
          tip: 'Discuss versioning, pagination, and caching strategies'
        },
        {
          question: 'Explain database indexing and when you would use different types.',
          type: 'technical',
          difficulty: 'medium',
          category: 'technical',
          tip: 'Cover B-tree, hash, and composite indexes with examples'
        },
        {
          question: 'How do you handle authentication and authorization in your applications?',
          type: 'technical',
          difficulty: 'medium',
          category: 'technical',
          tip: 'Discuss JWT, OAuth, and role-based access control'
        },
        {
          question: 'Describe your approach to error handling and logging.',
          type: 'technical',
          difficulty: 'medium',
          category: 'technical',
          tip: 'Cover structured logging, error monitoring, and debugging'
        },
        {
          question: 'Tell me about a time when you had to optimize database performance.',
          type: 'behavioral',
          difficulty: 'medium',
          category: 'problem-solving',
          tip: 'Use STAR method and include specific metrics'
        }
      ]
    };

    // Get career-specific questions or default to general questions
    const questions = careerQuestions[careerGoal.toLowerCase()] || careerQuestions['backend-developer'];
    
    // Return the requested number of questions
    return questions.slice(0, Math.min(questionCount, questions.length));
  }

  /**
   * Evaluate interview answers and provide feedback
   */
  async evaluateInterviewAnswers(questionsAndAnswers, candidateProfile = {}) {
    const startTime = Date.now();
    
    try {
      const qaText = questionsAndAnswers.map((qa, index) => 
        `Q${index + 1}: ${qa.question}\nA${index + 1}: ${qa.answer || 'No answer provided'}`
      ).join('\n\n');

      // Extract career goal and resume skills from candidate profile
      const careerGoal = candidateProfile.careerGoal || candidateProfile.targetRole || 'General position';
      const resumeSkills = candidateProfile.skills || candidateProfile.identifiedSkills || [];
      const skillsText = Array.isArray(resumeSkills) ? resumeSkills.join(', ') : 'General skills';

      const prompt = `You are an AI interview evaluator for Indian students. Evaluate the candidate's responses with strict, realistic scoring.

CANDIDATE PROFILE:
- Job Role: ${careerGoal}
- Resume Skills: ${skillsText}
- Background: ${candidateProfile.background || 'Professional candidate'}

INTERVIEW Q&A:
${qaText}

SCORING RULES:
1. Score 0–100 for each answer. Be strict and realistic.
2. Very weak, vague, or irrelevant answers = 0–40
   - One-word answers, completely off-topic, no substance
3. Answers with some relevance but lack structure or depth = 41–60
   - Basic understanding shown but missing examples, details, or structure
4. Strong answers with examples, reasoning, or technical accuracy = 61–80
   - Good structure, relevant examples, demonstrates competency
5. Excellent, comprehensive answers with structured approach, examples, trade-offs, and quantifiable impact = 81–100
   - STAR method, specific metrics, deep understanding, leadership insights

EVALUATION CRITERIA:
- Technical accuracy for the specific role (${careerGoal})
- Use of specific examples and quantifiable results
- Structured approach (STAR method for behavioral questions)
- Depth of understanding and practical experience
- Communication clarity and professionalism

REQUIRED JSON FORMAT (respond with ONLY this JSON, no other text):
{
  "overallScore": 65,
  "overallFeedback": "Mixed performance with room for improvement. Some answers lacked depth and specific examples.",
  "individualFeedback": [
    {
      "questionIndex": 0,
      "score": 45,
      "feedback": "Answer was too generic and lacked specific examples. For a ${careerGoal} role, expected more technical depth.",
      "strengths": ["Attempted to answer the question"],
      "improvements": ["Provide specific project examples", "Use STAR method", "Include quantifiable results", "Show technical depth for ${careerGoal} role"]
    }
  ],
  "keyStrengths": ["Communication attempt", "Basic understanding"],
  "areasForImprovement": ["Lack of specific examples", "Missing quantifiable results", "Need more technical depth"],
  "nextSteps": "Practice STAR method, prepare specific examples with metrics, study ${careerGoal} best practices."
}

BE STRICT: Penalize short, vague, or generic answers. Reward detailed, structured responses with specific examples and measurable outcomes.`;

      const response = await this.generateContent(prompt, { operation: 'interview_evaluation' });
      
      try {
        const cleanedResponse = response.trim();
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : cleanedResponse;
        
        const evaluation = JSON.parse(jsonString);
        
        // Apply forced distribution logic to prevent safe scoring
        if (evaluation.individualFeedback && Array.isArray(evaluation.individualFeedback)) {
          evaluation.individualFeedback = evaluation.individualFeedback.map((feedback, index) => {
            const qa = questionsAndAnswers[index];
            let score = feedback.score || 70;
            
            // STRICT PENALTY: Very short answers (less than 15 words)
            if (qa && qa.answer) {
              const wordCount = qa.answer.trim().split(' ').length;
              
              if (wordCount < 10 || qa.answer.trim().length < 15) {
                score = Math.min(score, 20); // Maximum 20/100 for very short answers
                feedback.feedback = 'Answer too short. Provide detailed responses with examples.';
                feedback.improvements = ['Provide longer, more detailed answers', 'Include specific examples', 'Explain your reasoning'];
              }
              
              // STRICT PENALTY: "I don't know" responses
              const lowerAnswer = qa.answer.toLowerCase();
              if (lowerAnswer.includes("don't know") || lowerAnswer.includes("not sure") || lowerAnswer.includes("no idea")) {
                score = Math.min(score, 30); // Maximum 30/100 for uncertain responses
                feedback.improvements.unshift('Avoid "I don\'t know" responses - try to provide partial answers');
              }
              
              // PENALTY: Generic answers without examples
              const genericPhrases = ['good', 'nice', 'okay', 'fine', 'important', 'useful', 'helpful'];
              const answerWords = lowerAnswer.split(' ');
              const genericWordCount = answerWords.filter(word => genericPhrases.includes(word)).length;
              const hasExamples = lowerAnswer.includes('example') || lowerAnswer.includes('instance') || 
                                lowerAnswer.includes('time when') || lowerAnswer.includes('project');
              
              if (genericWordCount > 2 && !hasExamples && wordCount < 30) {
                score = Math.min(score, 50); // Maximum 50/100 for generic responses
                feedback.improvements.unshift('Provide specific examples instead of generic statements');
              }
            }
            
            // Reward structured answers with examples
            if (qa && qa.answer) {
              const hasStructure = qa.answer.includes('First') || qa.answer.includes('Second') || 
                                 qa.answer.includes('For example') || qa.answer.includes('In my experience');
              const hasMetrics = /\d+/.test(qa.answer) && (qa.answer.includes('%') || qa.answer.includes('increase') || 
                               qa.answer.includes('decrease') || qa.answer.includes('improved'));
              
              if (hasStructure && hasMetrics && qa.answer.length > 100) {
                score = Math.max(score, 75);
              }
            }
            
            return {
              ...feedback,
              score: Math.max(0, Math.min(100, Math.round(score)))
            };
          });
          
          // Recalculate overall score based on individual scores
          const avgScore = evaluation.individualFeedback.reduce((sum, f) => sum + f.score, 0) / evaluation.individualFeedback.length;
          evaluation.overallScore = Math.round(avgScore);
        }
        
        return evaluation;
      } catch (parseError) {
        this.logger.warn('Failed to parse interview evaluation JSON, using fallback');
        
        // Fallback evaluation with realistic scoring
        const fallbackScores = questionsAndAnswers.map((qa, index) => {
          const answerLength = qa.answer ? qa.answer.trim().length : 0;
          let score = 50; // Start with neutral score
          
          // Score based on answer length and quality indicators
          if (answerLength < 10) {
            score = Math.random() * 30 + 10; // 10-40 for very short answers
          } else if (answerLength < 50) {
            score = Math.random() * 20 + 40; // 40-60 for short answers
          } else if (answerLength < 150) {
            score = Math.random() * 20 + 60; // 60-80 for medium answers
          } else {
            score = Math.random() * 15 + 70; // 70-85 for longer answers
          }
          
          // Check for quality indicators
          const hasExample = qa.answer && (qa.answer.includes('example') || qa.answer.includes('experience'));
          const hasNumbers = qa.answer && /\d+/.test(qa.answer);
          const hasStructure = qa.answer && (qa.answer.includes('.') && qa.answer.split('.').length > 2);
          
          if (hasExample) score += 5;
          if (hasNumbers) score += 5;
          if (hasStructure) score += 5;
          
          return {
            questionIndex: index,
            score: Math.max(15, Math.min(85, Math.round(score))),
            feedback: answerLength < 20 ? 
              'Answer is too brief. Provide more detailed explanations with specific examples.' :
              'Consider adding more specific examples and quantifiable results to strengthen your answer.',
            strengths: answerLength > 50 ? ['Provided detailed response'] : ['Attempted to answer'],
            improvements: [
              answerLength < 50 ? 'Provide more detailed responses' : 'Add specific metrics',
              'Use STAR method for behavioral questions',
              'Include measurable outcomes'
            ]
          };
        });
        
        const avgScore = fallbackScores.reduce((sum, s) => sum + s.score, 0) / fallbackScores.length;
        
        return {
          overallScore: Math.round(avgScore),
          overallFeedback: avgScore >= 70 ? 
            'Good interview performance with room for improvement in providing specific examples.' :
            avgScore >= 50 ?
            'Average performance. Focus on providing more detailed, structured answers with specific examples.' :
            'Interview responses need significant improvement. Practice providing detailed, structured answers.',
          individualFeedback: fallbackScores,
          keyStrengths: avgScore >= 60 ? 
            ['Communication attempt', 'Basic understanding'] : 
            ['Completed the interview'],
          areasForImprovement: [
            'Provide more specific examples',
            'Use structured approach (STAR method)',
            'Include quantifiable results',
            'Demonstrate deeper technical knowledge'
          ],
          nextSteps: avgScore >= 60 ?
            'Practice STAR method and prepare specific examples with measurable outcomes.' :
            'Focus on fundamentals: provide detailed answers, use specific examples, and practice structured responses.'
        };
      }
    } catch (error) {
      this.logger.error('Interview evaluation failed', { error: error.message });
      throw new AIServiceError(`Interview evaluation failed: ${error.message}`, 'evaluation_failed', error);
    } finally {
      const duration = Date.now() - startTime;
      this.logger.info('Interview evaluation completed', { 
        duration, 
        questionsCount: questionsAndAnswers.length
      });
    }
  }

  /**
   * Determine if an error is retryable
   */
  isRetryableError(error) {
    const message = error.message.toLowerCase();
    
    // Non-retryable errors
    if (message.includes('safety') || 
        message.includes('content blocked') ||
        message.includes('invalid prompt') || 
        message.includes('authentication') ||
        message.includes('permission denied') ||
        message.includes('quota exceeded') ||
        message.includes('invalid input')) {
      return false;
    }
    
    // Retryable errors
    if (message.includes('timeout') || 
        message.includes('network') || 
        message.includes('connection') ||
        message.includes('rate limit') ||
        message.includes('service unavailable') ||
        message.includes('internal error') ||
        message.includes('temporary') ||
        message.includes('503') ||
        message.includes('502') ||
        message.includes('500')) {
      return true;
    }
    
    // Default to non-retryable for unknown errors
    return false;
  }

  /**
   * Categorize error for better error handling and user messaging
   */
  categorizeError(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout') || message.includes('request timeout')) {
      return 'timeout_error';
    }
    if (message.includes('rate limit') || message.includes('quota')) {
      return 'rate_limit_error';
    }
    if (message.includes('safety') || message.includes('content blocked')) {
      return 'safety_error';
    }
    if (message.includes('authentication') || message.includes('permission denied')) {
      return 'auth_error';
    }
    if (message.includes('network') || message.includes('connection') || 
        message.includes('503') || message.includes('502')) {
      return 'network_error';
    }
    if (message.includes('invalid') || message.includes('bad request')) {
      return 'invalid_input';
    }
    if (message.includes('not initialized') || message.includes('not ready')) {
      return 'not_initialized';
    }
    if (message.includes('500') || message.includes('internal error')) {
      return 'server_error';
    }
    
    return 'generation_failed';
  }

  /**
   * Get user-friendly error message based on error type
   */
  getUserFriendlyErrorMessage(errorType, operation = 'general') {
    const messages = {
      timeout_error: {
        title: 'Request Timed Out',
        message: 'The AI service is taking longer than expected. Please try again.',
        action: 'Try Again'
      },
      rate_limit_error: {
        title: 'Service Busy',
        message: 'Our AI service is experiencing high demand. Please wait a moment and try again.',
        action: 'Wait and Retry'
      },
      safety_error: {
        title: 'Content Filtered',
        message: 'Your request was filtered for safety reasons. Please try rephrasing your content.',
        action: 'Modify Content'
      },
      auth_error: {
        title: 'Service Authentication Issue',
        message: 'There\'s a temporary authentication issue with our AI service. Please try again later.',
        action: 'Try Later'
      },
      network_error: {
        title: 'Connection Issue',
        message: 'Unable to connect to the AI service. Please check your connection and try again.',
        action: 'Check Connection'
      },
      invalid_input: {
        title: 'Invalid Input',
        message: 'The provided input is not valid. Please check your content and try again.',
        action: 'Check Input'
      },
      not_initialized: {
        title: 'Service Initializing',
        message: 'The AI service is starting up. Please wait a moment and try again.',
        action: 'Wait and Retry'
      },
      server_error: {
        title: 'Service Error',
        message: 'The AI service encountered an internal error. Please try again.',
        action: 'Try Again'
      },
      generation_failed: {
        title: 'Processing Failed',
        message: 'Unable to process your request at this time. Please try again later.',
        action: 'Try Later'
      }
    };

    return messages[errorType] || messages.generation_failed;
  }
}

// Export singleton instance
const aiService = new AIService();

export default aiService;