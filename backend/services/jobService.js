/**
 * Job Service - Mock Indian Job Recommendations
 * Provides realistic job data for Indian tech market
 */

// Mock job database with Indian context
const INDIAN_JOBS_DATABASE = {
  'frontend-developer': [
    {
      id: 'fe-001',
      title: 'Frontend Developer',
      company: 'Flipkart',
      match: '92%',
      description: 'Build responsive web applications using React.js and modern frontend technologies.',
      whyMatch: 'Perfect match for your React.js skills and frontend development experience.',
      skills: ['React.js', 'JavaScript', 'HTML/CSS', 'Redux', 'TypeScript'],
      salary: '₹8,00,000 - ₹15,00,000 per year (8-15 LPA)',
      location: 'Bangalore / Hybrid',
      experience: 'beginner',
      type: 'Full-time',
      posted: '2 days ago'
    },
    {
      id: 'fe-002',
      title: 'Senior Frontend Engineer',
      company: 'Zomato',
      match: '88%',
      description: 'Lead frontend development for food delivery platform serving millions of users.',
      whyMatch: 'Your React expertise and UI/UX understanding make you ideal for this role.',
      skills: ['React.js', 'Next.js', 'JavaScript', 'CSS-in-JS', 'Performance Optimization'],
      salary: '₹15,00,000 - ₹25,00,000 per year (15-25 LPA)',
      location: 'Gurgaon / Remote',
      experience: 'intermediate',
      type: 'Full-time',
      posted: '1 week ago'
    },
    {
      id: 'fe-003',
      title: 'React Developer',
      company: 'Swiggy',
      match: '85%',
      description: 'Develop and maintain customer-facing applications for food delivery ecosystem.',
      whyMatch: 'Strong React skills and component-based architecture experience.',
      skills: ['React.js', 'Redux', 'JavaScript', 'Webpack', 'Jest'],
      salary: '₹12,00,000 - ₹20,00,000 per year (12-20 LPA)',
      location: 'Bangalore / Hybrid',
      experience: 'intermediate',
      type: 'Full-time',
      posted: '3 days ago'
    }
  ],
  
  'backend-developer': [
    {
      id: 'be-001',
      title: 'Backend Developer',
      company: 'Paytm',
      match: '90%',
      description: 'Build scalable APIs and microservices for fintech platform handling millions of transactions.',
      whyMatch: 'Your Node.js and database skills align perfectly with our tech stack.',
      skills: ['Node.js', 'Express.js', 'MongoDB', 'Redis', 'AWS'],
      salary: '₹10,00,000 - ₹18,00,000 per year (10-18 LPA)',
      location: 'Noida / Remote',
      experience: 'intermediate',
      type: 'Full-time',
      posted: '1 day ago'
    },
    {
      id: 'be-002',
      title: 'Java Backend Engineer',
      company: 'PhonePe',
      match: '87%',
      description: 'Develop high-performance backend systems for digital payments platform.',
      whyMatch: 'Strong Java background and experience with distributed systems.',
      skills: ['Java', 'Spring Boot', 'MySQL', 'Kafka', 'Docker'],
      salary: '₹15,00,000 - ₹28,00,000 per year (15-28 LPA)',
      location: 'Bangalore / Hybrid',
      experience: 'advanced',
      type: 'Full-time',
      posted: '4 days ago'
    },
    {
      id: 'be-003',
      title: 'Python Backend Developer',
      company: 'Razorpay',
      match: '89%',
      description: 'Build payment processing systems and APIs using Python and Django.',
      whyMatch: 'Python expertise and API development experience make you a great fit.',
      skills: ['Python', 'Django', 'PostgreSQL', 'Celery', 'AWS'],
      salary: '₹12,00,000 - ₹22,00,000 per year (12-22 LPA)',
      location: 'Bangalore / Remote',
      experience: 'intermediate',
      type: 'Full-time',
      posted: '5 days ago'
    }
  ],

  'fullstack-developer': [
    {
      id: 'fs-001',
      title: 'Full Stack Developer',
      company: 'Byju\'s',
      match: '91%',
      description: 'Develop end-to-end solutions for EdTech platform serving millions of students.',
      whyMatch: 'Your full-stack skills and educational technology interest align perfectly.',
      skills: ['React.js', 'Node.js', 'MongoDB', 'Express.js', 'AWS'],
      salary: '₹12,00,000 - ₹20,00,000 per year (12-20 LPA)',
      location: 'Bangalore / Hybrid',
      experience: 'intermediate',
      type: 'Full-time',
      posted: '2 days ago'
    },
    {
      id: 'fs-002',
      title: 'MERN Stack Developer',
      company: 'Unacademy',
      match: '88%',
      description: 'Build interactive learning platforms using MERN stack technologies.',
      whyMatch: 'Perfect match for your MERN stack expertise and EdTech interest.',
      skills: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'TypeScript'],
      salary: '₹10,00,000 - ₹18,00,000 per year (10-18 LPA)',
      location: 'Bangalore / Remote',
      experience: 'intermediate',
      type: 'Full-time',
      posted: '1 week ago'
    }
  ],

  'ml-engineer': [
    {
      id: 'ml-001',
      title: 'ML Engineer',
      company: 'Ola',
      match: '93%',
      description: 'Develop machine learning models for ride optimization and demand forecasting.',
      whyMatch: 'Your ML skills and Python expertise are perfect for transportation AI.',
      skills: ['Python', 'TensorFlow', 'Scikit-learn', 'Pandas', 'AWS SageMaker'],
      salary: '₹15,00,000 - ₹30,00,000 per year (15-30 LPA)',
      location: 'Bangalore / Hybrid',
      experience: 'intermediate',
      type: 'Full-time',
      posted: '3 days ago'
    },
    {
      id: 'ml-002',
      title: 'MLOps Engineer',
      company: 'Freshworks',
      match: '89%',
      description: 'Deploy and scale ML models in production for customer experience platform.',
      whyMatch: 'Your ML and DevOps skills make you ideal for MLOps role.',
      skills: ['Python', 'Docker', 'Kubernetes', 'MLflow', 'GCP'],
      salary: '₹18,00,000 - ₹32,00,000 per year (18-32 LPA)',
      location: 'Chennai / Remote',
      experience: 'advanced',
      type: 'Full-time',
      posted: '1 day ago'
    }
  ],

  'data-scientist': [
    {
      id: 'ds-001',
      title: 'Data Scientist',
      company: 'Myntra',
      match: '90%',
      description: 'Analyze customer behavior and build recommendation systems for fashion e-commerce.',
      whyMatch: 'Your data analysis skills and ML knowledge fit perfectly with our needs.',
      skills: ['Python', 'R', 'SQL', 'Tableau', 'Machine Learning'],
      salary: '₹12,00,000 - ₹25,00,000 per year (12-25 LPA)',
      location: 'Bangalore / Hybrid',
      experience: 'intermediate',
      type: 'Full-time',
      posted: '4 days ago'
    }
  ],

  'devops-engineer': [
    {
      id: 'do-001',
      title: 'DevOps Engineer',
      company: 'Zerodha',
      match: '87%',
      description: 'Manage cloud infrastructure and CI/CD pipelines for trading platform.',
      whyMatch: 'Your cloud and automation skills are exactly what we need.',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins'],
      salary: '₹14,00,000 - ₹26,00,000 per year (14-26 LPA)',
      location: 'Bangalore / Remote',
      experience: 'intermediate',
      type: 'Full-time',
      posted: '2 days ago'
    }
  ],

  'mobile-developer': [
    {
      id: 'md-001',
      title: 'React Native Developer',
      company: 'Dream11',
      match: '88%',
      description: 'Build cross-platform mobile apps for fantasy sports platform.',
      whyMatch: 'Your React skills translate perfectly to React Native development.',
      skills: ['React Native', 'JavaScript', 'Redux', 'Firebase', 'iOS/Android'],
      salary: '₹10,00,000 - ₹20,00,000 per year (10-20 LPA)',
      location: 'Mumbai / Hybrid',
      experience: 'intermediate',
      type: 'Full-time',
      posted: '1 week ago'
    }
  ],

  'ui-ux-designer': [
    {
      id: 'ux-001',
      title: 'UI/UX Designer',
      company: 'Nykaa',
      match: '85%',
      description: 'Design user experiences for beauty and fashion e-commerce platform.',
      whyMatch: 'Your design skills and user-centric approach align with our vision.',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
      salary: '₹8,00,000 - ₹16,00,000 per year (8-16 LPA)',
      location: 'Mumbai / Hybrid',
      experience: 'intermediate',
      type: 'Full-time',
      posted: '3 days ago'
    }
  ]
};

/**
 * Get job recommendations based on user profile
 */
export const getJobRecommendations = (userProfile, resumeAnalysis = null) => {
  const { careerGoal, experience, interests } = userProfile;
  
  // Get jobs for the user's career goal
  let jobs = INDIAN_JOBS_DATABASE[careerGoal] || [];
  
  // Filter by experience level if specified
  if (experience && experience !== '') {
    jobs = jobs.filter(job => 
      job.experience === experience || 
      job.experience === 'any' ||
      (experience === 'beginner' && job.experience === 'intermediate') // Allow some stretch
    );
  }
  
  // If no jobs found for specific career goal, provide related jobs
  if (jobs.length === 0) {
    // Fallback to related career paths
    const relatedJobs = getRelatedJobs(careerGoal, interests);
    jobs = relatedJobs.slice(0, 3);
  }
  
  // Limit to top 5 recommendations
  return jobs.slice(0, 5).map(job => ({
    ...job,
    // Adjust match percentage based on interests
    match: adjustMatchPercentage(job, interests),
    // Add application URL (mock)
    applyUrl: `https://careers.${job.company.toLowerCase().replace(/[^a-z]/g, '')}.com/jobs/${job.id}`,
    // Add company logo (mock)
    companyLogo: `https://logo.clearbit.com/${job.company.toLowerCase().replace(/[^a-z]/g, '')}.com`
  }));
};

/**
 * Get related jobs when no direct match found
 */
const getRelatedJobs = (careerGoal, interests) => {
  const relatedMapping = {
    'frontend-developer': ['fullstack-developer', 'ui-ux-designer'],
    'backend-developer': ['fullstack-developer', 'devops-engineer'],
    'fullstack-developer': ['frontend-developer', 'backend-developer'],
    'ml-engineer': ['data-scientist', 'backend-developer'],
    'data-scientist': ['ml-engineer', 'backend-developer'],
    'devops-engineer': ['backend-developer', 'ml-engineer'],
    'mobile-developer': ['frontend-developer', 'fullstack-developer'],
    'ui-ux-designer': ['frontend-developer', 'mobile-developer']
  };
  
  const related = relatedMapping[careerGoal] || ['fullstack-developer'];
  let allRelatedJobs = [];
  
  related.forEach(relatedCareer => {
    const relatedJobsList = INDIAN_JOBS_DATABASE[relatedCareer] || [];
    allRelatedJobs = [...allRelatedJobs, ...relatedJobsList];
  });
  
  return allRelatedJobs;
};

/**
 * Adjust match percentage based on user interests
 */
const adjustMatchPercentage = (job, interests) => {
  if (!interests || interests.length === 0) {
    return job.match;
  }
  
  const interestMapping = {
    'web-development': ['frontend-developer', 'fullstack-developer', 'backend-developer'],
    'mobile-development': ['mobile-developer', 'frontend-developer'],
    'machine-learning': ['ml-engineer', 'data-scientist'],
    'data-science': ['data-scientist', 'ml-engineer'],
    'cloud-computing': ['devops-engineer', 'backend-developer'],
    'ui-ux-design': ['ui-ux-designer', 'frontend-developer']
  };
  
  let bonus = 0;
  interests.forEach(interest => {
    const relatedRoles = interestMapping[interest] || [];
    if (relatedRoles.some(role => job.title.toLowerCase().includes(role.replace('-', ' ')))) {
      bonus += 2;
    }
  });
  
  const currentMatch = parseInt(job.match.replace('%', ''));
  const newMatch = Math.min(95, currentMatch + bonus);
  
  return `${newMatch}%`;
};

/**
 * Get job details by ID
 */
export const getJobById = (jobId) => {
  for (const category of Object.values(INDIAN_JOBS_DATABASE)) {
    const job = category.find(j => j.id === jobId);
    if (job) {
      return {
        ...job,
        applyUrl: `https://careers.${job.company.toLowerCase().replace(/[^a-z]/g, '')}.com/jobs/${job.id}`,
        companyLogo: `https://logo.clearbit.com/${job.company.toLowerCase().replace(/[^a-z]/g, '')}.com`,
        // Add more detailed information
        requirements: [
          `${job.experience === 'beginner' ? '0-2' : job.experience === 'intermediate' ? '2-5' : '5+'} years of experience`,
          'Strong problem-solving skills',
          'Good communication skills',
          'Team collaboration experience'
        ],
        benefits: [
          'Health insurance',
          'Flexible working hours',
          'Learning and development budget',
          'Stock options',
          'Work from home options'
        ]
      };
    }
  }
  return null;
};

/**
 * Search jobs by query
 */
export const searchJobs = (query, userProfile = null) => {
  const allJobs = Object.values(INDIAN_JOBS_DATABASE).flat();
  
  if (!query || query.trim() === '') {
    return userProfile ? getJobRecommendations(userProfile) : allJobs.slice(0, 10);
  }
  
  const searchTerm = query.toLowerCase();
  const filteredJobs = allJobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm) ||
    job.company.toLowerCase().includes(searchTerm) ||
    job.skills.some(skill => skill.toLowerCase().includes(searchTerm)) ||
    job.description.toLowerCase().includes(searchTerm)
  );
  
  return filteredJobs.slice(0, 10);
};

export default {
  getJobRecommendations,
  getJobById,
  searchJobs
};