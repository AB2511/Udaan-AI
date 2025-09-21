/**
 * Fallback Data Service
 * Provides static fallback data when AI services are unavailable
 */

class FallbackDataService {
  constructor() {
    this.fallbackData = {
      resumeAnalysis: {
        identifiedSkills: [
          'Communication',
          'Problem Solving',
          'Teamwork',
          'Time Management',
          'Critical Thinking',
          'Adaptability'
        ],
        skillGaps: [
          'Advanced Technical Skills',
          'Leadership Experience',
          'Project Management',
          'Data Analysis',
          'Digital Marketing',
          'Public Speaking'
        ],
        careerPath: [
          {
            step: 'Skill Assessment and Planning',
            description: 'Evaluate your current skills and create a development plan',
            resources: [
              {
                title: 'Free Online Skill Assessments',
                url: 'https://www.coursera.org/skills-assessment',
                type: 'assessment'
              },
              {
                title: 'Career Planning Guide',
                url: 'https://www.indeed.com/career-advice/finding-a-job/how-to-create-career-plan',
                type: 'article'
              }
            ],
            estimatedTime: '1-2 weeks',
            priority: 'high'
          },
          {
            step: 'Technical Skill Development',
            description: 'Focus on building in-demand technical skills for your field',
            resources: [
              {
                title: 'Free Programming Courses',
                url: 'https://www.freecodecamp.org',
                type: 'course'
              },
              {
                title: 'LinkedIn Learning',
                url: 'https://www.linkedin.com/learning',
                type: 'course'
              },
              {
                title: 'YouTube Educational Channels',
                url: 'https://www.youtube.com/education',
                type: 'video'
              }
            ],
            estimatedTime: '3-6 months',
            priority: 'high'
          },
          {
            step: 'Professional Experience',
            description: 'Gain practical experience through internships, projects, or volunteering',
            resources: [
              {
                title: 'Internship Search Platforms',
                url: 'https://www.internships.com',
                type: 'platform'
              },
              {
                title: 'Volunteer Opportunities',
                url: 'https://www.volunteermatch.org',
                type: 'platform'
              },
              {
                title: 'Open Source Projects',
                url: 'https://github.com/explore',
                type: 'platform'
              }
            ],
            estimatedTime: '6-12 months',
            priority: 'medium'
          },
          {
            step: 'Network Building',
            description: 'Build professional relationships and expand your network',
            resources: [
              {
                title: 'Professional Networking Guide',
                url: 'https://www.linkedin.com/pulse/networking-guide',
                type: 'article'
              },
              {
                title: 'Industry Events and Meetups',
                url: 'https://www.meetup.com',
                type: 'platform'
              }
            ],
            estimatedTime: 'Ongoing',
            priority: 'medium'
          }
        ],
        overallScore: 65,
        recommendations: 'Continue developing your skills and gaining experience. Focus on building a strong portfolio and expanding your professional network. Consider pursuing relevant certifications in your field of interest.'
      },

      assessmentQuestions: {
        technical: [
          {
            question: 'What is the primary purpose of version control systems like Git?',
            options: [
              'To track changes in code and collaborate with others',
              'To compile and run programs',
              'To design user interfaces',
              'To manage databases'
            ],
            correctAnswer: 'To track changes in code and collaborate with others',
            explanation: 'Version control systems help developers track changes, collaborate, and maintain code history.',
            difficulty: 'easy',
            category: 'software-development'
          },
          {
            question: 'Which of the following is NOT a programming paradigm?',
            options: [
              'Object-Oriented Programming',
              'Functional Programming',
              'Procedural Programming',
              'Database Programming'
            ],
            correctAnswer: 'Database Programming',
            explanation: 'Database Programming is not a programming paradigm but rather a domain of programming.',
            difficulty: 'medium',
            category: 'programming-concepts'
          },
          {
            question: 'What does API stand for?',
            options: [
              'Application Programming Interface',
              'Advanced Programming Integration',
              'Automated Program Instruction',
              'Application Process Integration'
            ],
            correctAnswer: 'Application Programming Interface',
            explanation: 'API stands for Application Programming Interface, which allows different software applications to communicate.',
            difficulty: 'easy',
            category: 'software-development'
          },
          {
            question: 'Which data structure follows the Last-In-First-Out (LIFO) principle?',
            options: [
              'Queue',
              'Stack',
              'Array',
              'Linked List'
            ],
            correctAnswer: 'Stack',
            explanation: 'A stack follows the LIFO principle where the last element added is the first one to be removed.',
            difficulty: 'medium',
            category: 'data-structures'
          },
          {
            question: 'What is the time complexity of binary search?',
            options: [
              'O(n)',
              'O(log n)',
              'O(n²)',
              'O(1)'
            ],
            correctAnswer: 'O(log n)',
            explanation: 'Binary search has O(log n) time complexity as it eliminates half of the search space in each iteration.',
            difficulty: 'medium',
            category: 'algorithms'
          }
        ],

        personality: [
          {
            question: 'How do you typically handle working under tight deadlines?',
            options: [
              'I work better under pressure and deliver my best work',
              'I plan ahead and break tasks into manageable chunks',
              'I get stressed and my performance suffers',
              'I avoid situations with tight deadlines'
            ],
            correctAnswer: 'I plan ahead and break tasks into manageable chunks',
            explanation: 'Effective planning and task management show good stress management and organizational skills.',
            difficulty: 'medium',
            category: 'stress-management'
          },
          {
            question: 'When working in a team, you prefer to:',
            options: [
              'Take the lead and direct others',
              'Contribute ideas and collaborate equally',
              'Follow instructions and support others',
              'Work independently on assigned tasks'
            ],
            correctAnswer: 'Contribute ideas and collaborate equally',
            explanation: 'Collaborative teamwork with active participation shows good interpersonal and communication skills.',
            difficulty: 'easy',
            category: 'teamwork'
          },
          {
            question: 'How do you approach learning new technologies or skills?',
            options: [
              'I dive in immediately and learn by doing',
              'I research thoroughly before starting',
              'I prefer formal training or courses',
              'I ask colleagues to teach me'
            ],
            correctAnswer: 'I research thoroughly before starting',
            explanation: 'Thorough research shows good preparation and learning methodology.',
            difficulty: 'easy',
            category: 'learning-style'
          },
          {
            question: 'What motivates you most in your work?',
            options: [
              'Financial rewards and benefits',
              'Learning and professional growth',
              'Recognition and praise from others',
              'Job security and stability'
            ],
            correctAnswer: 'Learning and professional growth',
            explanation: 'Growth motivation indicates a positive attitude toward continuous improvement and development.',
            difficulty: 'easy',
            category: 'motivation'
          },
          {
            question: 'How do you handle constructive criticism?',
            options: [
              'I take it personally and get defensive',
              'I listen carefully and use it to improve',
              'I ignore it if I disagree',
              'I ask for specific examples and clarification'
            ],
            correctAnswer: 'I listen carefully and use it to improve',
            explanation: 'Accepting and using constructive criticism shows maturity and growth mindset.',
            difficulty: 'medium',
            category: 'feedback-handling'
          }
        ],

        hr: [
          {
            question: 'Why are you interested in this position?',
            options: [
              'I need a job and this one pays well',
              'The role aligns with my career goals and interests',
              'The company is close to my home',
              'My friend recommended I apply'
            ],
            correctAnswer: 'The role aligns with my career goals and interests',
            explanation: 'Showing alignment between personal goals and the role demonstrates genuine interest and motivation.',
            difficulty: 'easy',
            category: 'motivation'
          },
          {
            question: 'How do you handle conflicts with colleagues?',
            options: [
              'I avoid confrontation and ignore the issue',
              'I address it directly and professionally',
              'I complain to my supervisor immediately',
              'I try to get others on my side'
            ],
            correctAnswer: 'I address it directly and professionally',
            explanation: 'Direct, professional communication shows maturity and conflict resolution skills.',
            difficulty: 'medium',
            category: 'conflict-resolution'
          },
          {
            question: 'What is your greatest strength?',
            options: [
              'I work well under pressure',
              'I am a quick learner and adaptable',
              'I am always punctual',
              'I follow instructions exactly'
            ],
            correctAnswer: 'I am a quick learner and adaptable',
            explanation: 'Adaptability and learning ability are highly valued in dynamic work environments.',
            difficulty: 'easy',
            category: 'strengths'
          },
          {
            question: 'Where do you see yourself in 5 years?',
            options: [
              'In the same position, comfortable and stable',
              'Having grown professionally with increased responsibilities',
              'Working for a different company',
              'I haven\'t thought about it'
            ],
            correctAnswer: 'Having grown professionally with increased responsibilities',
            explanation: 'Showing ambition for growth while staying committed demonstrates good career planning.',
            difficulty: 'medium',
            category: 'career-planning'
          },
          {
            question: 'How do you prioritize your work when you have multiple deadlines?',
            options: [
              'I work on whatever seems most urgent',
              'I assess importance and deadlines to create a priority list',
              'I ask my supervisor to prioritize for me',
              'I try to work on everything simultaneously'
            ],
            correctAnswer: 'I assess importance and deadlines to create a priority list',
            explanation: 'Strategic prioritization shows good time management and organizational skills.',
            difficulty: 'medium',
            category: 'time-management'
          }
        ]
      },

      interviewQuestions: {
        'software-developer': [
          {
            question: 'Tell me about a challenging programming project you worked on.',
            type: 'behavioral',
            difficulty: 'medium',
            category: 'problem-solving',
            expectedDuration: '3-4 minutes',
            followUpQuestions: [
              'What was the biggest technical challenge?',
              'How did you overcome it?',
              'What would you do differently next time?'
            ]
          },
          {
            question: 'How do you approach debugging a complex issue?',
            type: 'technical',
            difficulty: 'medium',
            category: 'problem-solving',
            expectedDuration: '2-3 minutes',
            followUpQuestions: [
              'What tools do you use for debugging?',
              'How do you prevent similar issues in the future?'
            ]
          },
          {
            question: 'Describe your experience with version control systems.',
            type: 'technical',
            difficulty: 'easy',
            category: 'technical-skills',
            expectedDuration: '2-3 minutes',
            followUpQuestions: [
              'What branching strategies have you used?',
              'How do you handle merge conflicts?'
            ]
          },
          {
            question: 'How do you stay updated with new technologies and programming trends?',
            type: 'behavioral',
            difficulty: 'easy',
            category: 'continuous-learning',
            expectedDuration: '2-3 minutes',
            followUpQuestions: [
              'What resources do you use?',
              'Can you give an example of a recent technology you learned?'
            ]
          },
          {
            question: 'Describe a time when you had to work with a difficult team member.',
            type: 'behavioral',
            difficulty: 'medium',
            category: 'teamwork',
            expectedDuration: '3-4 minutes',
            followUpQuestions: [
              'How did you handle the situation?',
              'What was the outcome?'
            ]
          }
        ],

        'data-scientist': [
          {
            question: 'Walk me through your approach to a data analysis project.',
            type: 'technical',
            difficulty: 'medium',
            category: 'analytical-thinking',
            expectedDuration: '4-5 minutes',
            followUpQuestions: [
              'How do you handle missing or dirty data?',
              'What validation techniques do you use?'
            ]
          },
          {
            question: 'Explain a complex data science concept to a non-technical stakeholder.',
            type: 'behavioral',
            difficulty: 'medium',
            category: 'communication',
            expectedDuration: '3-4 minutes',
            followUpQuestions: [
              'How do you ensure they understand?',
              'What analogies do you use?'
            ]
          },
          {
            question: 'Describe your experience with machine learning algorithms.',
            type: 'technical',
            difficulty: 'medium',
            category: 'technical-skills',
            expectedDuration: '3-4 minutes',
            followUpQuestions: [
              'Which algorithms have you implemented?',
              'How do you choose the right algorithm for a problem?'
            ]
          },
          {
            question: 'Tell me about a time when your analysis led to an important business decision.',
            type: 'behavioral',
            difficulty: 'medium',
            category: 'business-impact',
            expectedDuration: '4-5 minutes',
            followUpQuestions: [
              'What was the impact?',
              'How did you measure success?'
            ]
          },
          {
            question: 'How do you ensure the quality and reliability of your data models?',
            type: 'technical',
            difficulty: 'hard',
            category: 'quality-assurance',
            expectedDuration: '3-4 minutes',
            followUpQuestions: [
              'What testing methods do you use?',
              'How do you handle model drift?'
            ]
          }
        ],

        'product-manager': [
          {
            question: 'How do you prioritize features in a product roadmap?',
            type: 'behavioral',
            difficulty: 'medium',
            category: 'product-strategy',
            expectedDuration: '4-5 minutes',
            followUpQuestions: [
              'What frameworks do you use?',
              'How do you handle conflicting stakeholder requests?'
            ]
          },
          {
            question: 'Describe a time when you had to make a difficult product decision.',
            type: 'behavioral',
            difficulty: 'medium',
            category: 'decision-making',
            expectedDuration: '4-5 minutes',
            followUpQuestions: [
              'What factors did you consider?',
              'How did you communicate the decision?'
            ]
          },
          {
            question: 'How do you gather and analyze user feedback?',
            type: 'technical',
            difficulty: 'medium',
            category: 'user-research',
            expectedDuration: '3-4 minutes',
            followUpQuestions: [
              'What tools do you use?',
              'How do you validate feedback?'
            ]
          },
          {
            question: 'Tell me about a product launch you managed.',
            type: 'behavioral',
            difficulty: 'medium',
            category: 'project-management',
            expectedDuration: '4-5 minutes',
            followUpQuestions: [
              'What challenges did you face?',
              'How did you measure success?'
            ]
          },
          {
            question: 'How do you work with engineering teams to deliver products?',
            type: 'behavioral',
            difficulty: 'medium',
            category: 'cross-functional-collaboration',
            expectedDuration: '3-4 minutes',
            followUpQuestions: [
              'How do you handle technical constraints?',
              'How do you communicate requirements?'
            ]
          }
        ]
      }
    };
  }

  /**
   * Get fallback resume analysis
   */
  getResumeAnalysis(resumeText = '', userProfile = {}) {
    const analysis = { ...this.fallbackData.resumeAnalysis };
    
    // Customize based on user profile if available
    if (userProfile.interests && userProfile.interests.length > 0) {
      analysis.recommendations = `Based on your interests in ${userProfile.interests.join(', ')}, ${analysis.recommendations}`;
    }

    if (userProfile.careerGoals && userProfile.careerGoals.length > 0) {
      analysis.careerPath[0].description = `Evaluate your current skills and create a development plan aligned with your goals in ${userProfile.careerGoals.join(', ')}.`;
    }

    return {
      ...analysis,
      fallbackUsed: true,
      message: 'AI analysis temporarily unavailable. Showing general career guidance.'
    };
  }

  /**
   * Get fallback assessment questions
   */
  getAssessmentQuestions(domain = 'technical', difficulty = 'medium', questionCount = 5) {
    const domainQuestions = this.fallbackData.assessmentQuestions[domain] || 
                           this.fallbackData.assessmentQuestions.technical;
    
    // Select questions based on difficulty and count
    let selectedQuestions = domainQuestions.filter(q => q.difficulty === difficulty);
    
    // If not enough questions of the specified difficulty, include others
    if (selectedQuestions.length < questionCount) {
      selectedQuestions = domainQuestions;
    }

    // Repeat questions if needed to meet count
    const questions = [];
    for (let i = 0; i < questionCount; i++) {
      questions.push(selectedQuestions[i % selectedQuestions.length]);
    }

    return {
      questions,
      metadata: {
        domain,
        difficulty,
        totalQuestions: questionCount,
        estimatedTime: `${questionCount * 2} minutes`,
        fallbackUsed: true
      },
      message: 'AI question generation temporarily unavailable. Using practice questions.'
    };
  }

  /**
   * Get fallback interview questions
   */
  getInterviewQuestions(role = 'software-developer', experience = 'entry', questionCount = 5) {
    const roleQuestions = this.fallbackData.interviewQuestions[role] || 
                         this.fallbackData.interviewQuestions['software-developer'];
    
    // Select questions based on count
    const questions = [];
    for (let i = 0; i < questionCount; i++) {
      questions.push(roleQuestions[i % roleQuestions.length]);
    }

    return {
      questions,
      metadata: {
        role,
        experience,
        totalQuestions: questionCount,
        estimatedDuration: `${questionCount * 3} minutes`,
        focusAreas: ['problem-solving', 'communication', 'technical-skills'],
        fallbackUsed: true
      },
      message: 'AI question generation temporarily unavailable. Using standard interview questions.'
    };
  }

  /**
   * Get fallback interview evaluation
   */
  getInterviewEvaluation(questionsAndAnswers = [], role = 'software-developer', experience = 'entry') {
    const questionCount = questionsAndAnswers.length;
    const baseScore = 70; // Base score for fallback evaluation
    
    return {
      overallScore: baseScore,
      individualScores: questionsAndAnswers.map((qa, index) => ({
        questionIndex: index,
        score: baseScore + Math.floor(Math.random() * 20) - 10, // ±10 variation
        feedback: 'Your answer demonstrates good understanding. Consider providing more specific examples to strengthen your response.',
        strengths: ['Clear communication', 'Relevant experience'],
        improvements: ['Add more details', 'Provide specific examples']
      })),
      summary: {
        strengths: [
          'Good communication skills',
          'Relevant background for the role',
          'Positive attitude and enthusiasm'
        ],
        areasForImprovement: [
          'Provide more specific examples from your experience',
          'Demonstrate deeper technical knowledge',
          'Show more confidence in your abilities'
        ],
        recommendations: [
          'Practice with more technical questions',
          'Prepare specific examples from your projects',
          'Research the company and role more thoroughly'
        ],
        nextSteps: [
          'Continue practicing interview skills',
          'Build a portfolio of your work',
          'Network with professionals in your field'
        ]
      },
      competencyAssessment: {
        technical: baseScore,
        communication: baseScore + 10,
        problemSolving: baseScore - 5,
        leadership: baseScore - 10
      },
      fallbackUsed: true,
      message: 'AI evaluation temporarily unavailable. Showing general feedback.'
    };
  }

  /**
   * Check if fallback data is available for a specific operation
   */
  isFallbackAvailable(operationType) {
    const availableOperations = [
      'resume_analysis',
      'assessment_generation',
      'interview_generation',
      'interview_evaluation'
    ];
    
    return availableOperations.includes(operationType);
  }

  /**
   * Get user-friendly fallback message
   */
  getFallbackMessage(operationType) {
    const messages = {
      'resume_analysis': 'AI resume analysis is temporarily unavailable. We\'re showing general career guidance instead.',
      'assessment_generation': 'AI question generation is temporarily unavailable. You can practice with our standard questions.',
      'interview_generation': 'AI interview questions are temporarily unavailable. We\'ve provided common interview questions for practice.',
      'interview_evaluation': 'AI evaluation is temporarily unavailable. We\'ve provided general feedback based on common patterns.'
    };

    return messages[operationType] || 'AI service is temporarily unavailable. Using backup functionality.';
  }
}

// Export singleton instance
const fallbackDataService = new FallbackDataService();

export default fallbackDataService;