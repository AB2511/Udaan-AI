/**
 * Fallback Data for Offline Demo Scenarios
 * Used when AI services are unavailable during demonstrations
 */

export const fallbackResumeAnalysis = {
  extractedSkills: [
    { name: 'JavaScript', category: 'technical', level: 'Advanced' },
    { name: 'React', category: 'technical', level: 'Advanced' },
    { name: 'Node.js', category: 'technical', level: 'Intermediate' },
    { name: 'Python', category: 'technical', level: 'Intermediate' },
    { name: 'SQL', category: 'technical', level: 'Intermediate' },
    { name: 'Git', category: 'tools', level: 'Advanced' },
    { name: 'AWS', category: 'tools', level: 'Beginner' },
    { name: 'Problem Solving', category: 'soft', level: 'Advanced' },
    { name: 'Team Collaboration', category: 'soft', level: 'Advanced' },
    { name: 'Communication', category: 'soft', level: 'Intermediate' }
  ],
  skillGaps: [
    {
      skill: 'TypeScript',
      priority: 'high',
      description: 'TypeScript is increasingly important for large-scale JavaScript applications',
      suggestion: 'Consider learning TypeScript to improve code quality and developer experience'
    },
    {
      skill: 'Docker & Containerization',
      priority: 'medium',
      description: 'Container technologies are essential for modern deployment practices',
      suggestion: 'Learn Docker basics and container orchestration with Kubernetes'
    },
    {
      skill: 'System Design',
      priority: 'high',
      description: 'System design skills are crucial for senior developer roles',
      suggestion: 'Study distributed systems, scalability patterns, and architecture principles'
    },
    {
      skill: 'Testing Frameworks',
      priority: 'medium',
      description: 'Automated testing is essential for reliable software development',
      suggestion: 'Learn Jest, Cypress, or similar testing frameworks for your tech stack'
    }
  ],
  learningPath: [
    {
      step: 'Master TypeScript Fundamentals',
      description: 'Learn TypeScript syntax, types, interfaces, and advanced features',
      estimatedTime: '2-3 weeks',
      priority: 'high',
      resources: [
        {
          title: 'TypeScript Official Documentation',
          type: 'tutorial',
          url: 'https://www.typescriptlang.org/docs/'
        },
        {
          title: 'TypeScript Deep Dive',
          type: 'course',
          url: 'https://basarat.gitbook.io/typescript/'
        }
      ]
    },
    {
      step: 'Learn System Design Principles',
      description: 'Understand scalability, reliability, and distributed system concepts',
      estimatedTime: '4-6 weeks',
      priority: 'high',
      resources: [
        {
          title: 'System Design Primer',
          type: 'article',
          url: 'https://github.com/donnemartin/system-design-primer'
        },
        {
          title: 'Designing Data-Intensive Applications',
          type: 'course',
          url: 'https://dataintensive.net/'
        }
      ]
    },
    {
      step: 'Containerization with Docker',
      description: 'Learn Docker basics, container orchestration, and deployment strategies',
      estimatedTime: '2-3 weeks',
      priority: 'medium',
      resources: [
        {
          title: 'Docker Official Tutorial',
          type: 'tutorial',
          url: 'https://docs.docker.com/get-started/'
        },
        {
          title: 'Kubernetes Basics',
          type: 'course',
          url: 'https://kubernetes.io/docs/tutorials/'
        }
      ]
    },
    {
      step: 'Advanced Testing Strategies',
      description: 'Implement comprehensive testing including unit, integration, and e2e tests',
      estimatedTime: '3-4 weeks',
      priority: 'medium',
      resources: [
        {
          title: 'Testing JavaScript Applications',
          type: 'course',
          url: 'https://testingjavascript.com/'
        },
        {
          title: 'Cypress Testing Framework',
          type: 'tutorial',
          url: 'https://docs.cypress.io/'
        }
      ]
    }
  ],
  recommendations: 'Based on your strong foundation in JavaScript and React, you\'re well-positioned for senior frontend or full-stack developer roles. Focus on learning TypeScript and system design to advance to senior positions. Your problem-solving skills and team collaboration experience are valuable assets. Consider contributing to open-source projects to showcase your skills and build your professional network.',
  overallScore: 78,
  analysisDate: new Date().toISOString(),
  careerPath: [
    'Senior Frontend Developer',
    'Full-Stack Developer',
    'Technical Lead',
    'Engineering Manager'
  ]
};

export const fallbackJobRecommendations = [
  {
    title: 'Senior Frontend Developer',
    description: 'Lead frontend development for a growing SaaS platform using React and modern JavaScript frameworks.',
    matchReason: 'Your advanced React and JavaScript skills align perfectly with this role. The position values problem-solving abilities and team collaboration, which are your key strengths.',
    requirements: ['React', 'JavaScript', 'Team Leadership', 'Problem Solving'],
    salaryRange: '$90,000 - $130,000',
    location: 'Remote / San Francisco',
    company: 'TechFlow Solutions',
    matchPercentage: 92
  },
  {
    title: 'Full-Stack JavaScript Developer',
    description: 'Build end-to-end web applications using Node.js, React, and cloud technologies in an agile environment.',
    matchReason: 'Your combination of React frontend skills and Node.js backend experience makes you an ideal candidate. The role emphasizes collaborative development, matching your team skills.',
    requirements: ['React', 'Node.js', 'JavaScript', 'SQL', 'Git'],
    salaryRange: '$80,000 - $120,000',
    location: 'Austin, TX / Remote',
    company: 'InnovateLabs',
    matchPercentage: 88
  }
];

export const fallbackInterviewQuestions = [
  {
    question: 'Can you explain the difference between React functional components and class components, and when you would use each?',
    category: 'Technical',
    difficulty: 'Intermediate',
    expectedAnswer: 'Functional components are simpler and use hooks for state management, while class components use lifecycle methods. Functional components are preferred in modern React development.'
  },
  {
    question: 'Describe a challenging problem you solved in a recent project and walk me through your approach.',
    category: 'Problem Solving',
    difficulty: 'Behavioral',
    expectedAnswer: 'Should demonstrate systematic problem-solving approach, consideration of alternatives, and learning from the experience.'
  },
  {
    question: 'How do you handle asynchronous operations in JavaScript, and what are the pros and cons of different approaches?',
    category: 'Technical',
    difficulty: 'Advanced',
    expectedAnswer: 'Should cover callbacks, promises, and async/await, discussing error handling and performance considerations.'
  },
  {
    question: 'Tell me about a time when you had to collaborate with team members who had different technical opinions. How did you handle it?',
    category: 'Teamwork',
    difficulty: 'Behavioral',
    expectedAnswer: 'Should demonstrate communication skills, compromise, and focus on project goals over personal preferences.'
  },
  {
    question: 'What strategies do you use to ensure your code is maintainable and scalable?',
    category: 'Best Practices',
    difficulty: 'Intermediate',
    expectedAnswer: 'Should mention code organization, documentation, testing, design patterns, and consideration for future requirements.'
  }
];

export const fallbackInterviewFeedback = {
  overallScore: 82,
  strengths: [
    'Strong technical knowledge of React and JavaScript fundamentals',
    'Clear communication and structured thinking',
    'Good understanding of best practices and code quality',
    'Demonstrates collaborative mindset and team-first approach'
  ],
  improvements: [
    'Could provide more specific examples from real projects',
    'Consider discussing performance optimization techniques',
    'Expand on system design and scalability considerations',
    'Practice explaining complex technical concepts more concisely'
  ],
  recommendations: [
    'Review system design principles for senior-level interviews',
    'Prepare specific STAR method examples for behavioral questions',
    'Practice whiteboarding and live coding exercises',
    'Research the company and role-specific technologies before interviews'
  ],
  nextSteps: [
    'Schedule mock interviews with peers or mentors',
    'Build a portfolio showcasing your best projects',
    'Contribute to open-source projects to demonstrate collaboration skills',
    'Consider obtaining relevant certifications (AWS, React, etc.)'
  ]
};

export const demoUserProfile = {
  name: 'Demo User',
  email: 'demo@udaanai.com',
  joinDate: new Date().toISOString(),
  analysisCount: 1,
  lastAnalysis: new Date().toISOString()
};

// Utility function to simulate AI processing delay
export const simulateAIProcessing = (minDelay = 2000, maxDelay = 5000) => {
  const delay = Math.random() * (maxDelay - minDelay) + minDelay;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Function to get fallback data based on context
export const getFallbackData = (type, context = {}) => {
  switch (type) {
    case 'resume-analysis':
      return {
        ...fallbackResumeAnalysis,
        analysisDate: new Date().toISOString()
      };
    
    case 'job-recommendations':
      return fallbackJobRecommendations;
    
    case 'interview-questions':
      return fallbackInterviewQuestions.slice(0, context.count || 5);
    
    case 'interview-feedback':
      return fallbackInterviewFeedback;
    
    case 'user-profile':
      return demoUserProfile;
    
    default:
      return null;
  }
};

export default {
  fallbackResumeAnalysis,
  fallbackJobRecommendations,
  fallbackInterviewQuestions,
  fallbackInterviewFeedback,
  demoUserProfile,
  simulateAIProcessing,
  getFallbackData
};