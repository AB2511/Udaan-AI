/**
 * Interview Evaluation Service
 * Handles interview answer evaluation using AI integration
 */

import aiService from './aiService.js';

// Scoring algorithms and criteria
const SCORING_CRITERIA = {
  technical: {
    accuracy: {
      weight: 0.3,
      description: 'Technical correctness and accuracy of the answer'
    },
    depth: {
      weight: 0.25,
      description: 'Depth of understanding and knowledge demonstrated'
    },
    clarity: {
      weight: 0.2,
      description: 'Clear explanation and communication of technical concepts'
    },
    implementation: {
      weight: 0.15,
      description: 'Practical implementation knowledge and experience'
    },
    problemSolving: {
      weight: 0.1,
      description: 'Problem-solving approach and methodology'
    }
  },
  behavioral: {
    relevance: {
      weight: 0.25,
      description: 'Relevance of examples and experiences shared'
    },
    structure: {
      weight: 0.2,
      description: 'Well-structured answer using frameworks like STAR'
    },
    selfAwareness: {
      weight: 0.2,
      description: 'Self-awareness and reflection on experiences'
    },
    communication: {
      weight: 0.2,
      description: 'Clear and effective communication skills'
    },
    learning: {
      weight: 0.15,
      description: 'Demonstration of learning and growth mindset'
    }
  },
  situational: {
    reasoning: {
      weight: 0.3,
      description: 'Logical reasoning and thought process'
    },
    practicality: {
      weight: 0.25,
      description: 'Practical and realistic approach to the situation'
    },
    consideration: {
      weight: 0.2,
      description: 'Consideration of multiple perspectives and stakeholders'
    },
    communication: {
      weight: 0.15,
      description: 'Clear communication of approach and rationale'
    },
    adaptability: {
      weight: 0.1,
      description: 'Flexibility and adaptability in approach'
    }
  }
};

const COMPETENCY_AREAS = {
  technical: {
    description: 'Technical knowledge and problem-solving abilities',
    subAreas: ['domain_knowledge', 'problem_solving', 'best_practices', 'implementation']
  },
  communication: {
    description: 'Verbal and written communication effectiveness',
    subAreas: ['clarity', 'structure', 'listening', 'presentation']
  },
  leadership: {
    description: 'Leadership potential and team management skills',
    subAreas: ['influence', 'decision_making', 'team_building', 'vision']
  },
  problemSolving: {
    description: 'Analytical thinking and problem resolution',
    subAreas: ['analysis', 'creativity', 'systematic_approach', 'solution_quality']
  },
  adaptability: {
    description: 'Flexibility and ability to handle change',
    subAreas: ['learning_agility', 'resilience', 'openness', 'innovation']
  },
  collaboration: {
    description: 'Teamwork and interpersonal skills',
    subAreas: ['teamwork', 'conflict_resolution', 'empathy', 'cultural_awareness']
  }
};

const FEEDBACK_TEMPLATES = {
  strengths: {
    technical: [
      'Demonstrated strong technical knowledge in {area}',
      'Showed excellent problem-solving approach',
      'Provided clear and accurate technical explanations',
      'Displayed good understanding of best practices',
      'Showed practical implementation experience'
    ],
    behavioral: [
      'Provided relevant and specific examples',
      'Demonstrated strong self-awareness',
      'Showed excellent communication skills',
      'Used structured approach (STAR method) effectively',
      'Displayed growth mindset and learning orientation'
    ],
    situational: [
      'Showed logical and systematic thinking',
      'Considered multiple perspectives and stakeholders',
      'Provided practical and realistic solutions',
      'Demonstrated good judgment and decision-making',
      'Showed flexibility in approach'
    ]
  },
  improvements: {
    technical: [
      'Could provide more specific technical details',
      'Consider discussing alternative approaches',
      'Include more practical implementation examples',
      'Explain the reasoning behind technical choices',
      'Address potential edge cases or limitations'
    ],
    behavioral: [
      'Use more specific examples with measurable outcomes',
      'Structure answers using the STAR method',
      'Include more reflection on lessons learned',
      'Provide more context about the situation',
      'Discuss how you would apply learnings in future'
    ],
    situational: [
      'Consider more stakeholder perspectives',
      'Discuss potential risks and mitigation strategies',
      'Provide more detailed step-by-step approach',
      'Include contingency planning',
      'Consider long-term implications of decisions'
    ]
  }
};

class InterviewEvaluationService {
  constructor() {
    this.aiService = aiService;
    this.logger = {
      info: (message, data) => console.log(`[InterviewEvaluationService] ${message}`, data || ''),
      error: (message, data) => console.error(`[InterviewEvaluationService] ${message}`, data || ''),
      warn: (message, data) => console.warn(`[InterviewEvaluationService] ${message}`, data || '')
    };
  }

  /**
   * Evaluate interview answers and provide comprehensive feedback
   */
  async evaluateAnswers(options = {}) {
    try {
      const {
        questionsAndAnswers,
        role = 'software-developer',
        experience = 'entry',
        userProfile = {},
        evaluationCriteria = null
      } = options;

      // Validate inputs
      this.validateEvaluationInputs(questionsAndAnswers, role, experience);

      // Get AI-powered evaluation
      const aiEvaluation = await this.getAIEvaluation(
        questionsAndAnswers,
        role,
        experience,
        userProfile
      );

      // Process and enhance AI evaluation
      const processedEvaluation = await this.processAIEvaluation(
        aiEvaluation,
        questionsAndAnswers,
        role,
        experience
      );

      // Calculate detailed scores
      const detailedScores = this.calculateDetailedScores(
        processedEvaluation,
        questionsAndAnswers
      );

      // Generate comprehensive feedback
      const comprehensiveFeedback = this.generateComprehensiveFeedback(
        processedEvaluation,
        detailedScores,
        questionsAndAnswers,
        role,
        experience
      );

      // Create evaluation report
      const evaluationReport = this.createEvaluationReport(
        processedEvaluation,
        detailedScores,
        comprehensiveFeedback,
        questionsAndAnswers,
        role,
        experience
      );

      this.logger.info('Interview evaluation completed successfully', {
        role,
        experience,
        questionsEvaluated: questionsAndAnswers.length,
        overallScore: evaluationReport.overallScore
      });

      return evaluationReport;

    } catch (error) {
      this.logger.error('Failed to evaluate interview answers', {
        error: error.message,
        options
      });
      
      // Fallback to basic evaluation if AI fails
      return this.getFallbackEvaluation(options);
    }
  }

  /**
   * Validate evaluation inputs
   */
  validateEvaluationInputs(questionsAndAnswers, role, experience) {
    if (!Array.isArray(questionsAndAnswers) || questionsAndAnswers.length === 0) {
      throw new Error('Questions and answers array is required and cannot be empty');
    }

    questionsAndAnswers.forEach((qa, index) => {
      if (!qa.question || !qa.answer) {
        throw new Error(`Question and answer are required for item ${index + 1}`);
      }
    });

    const validExperience = ['entry', 'mid', 'senior'];
    if (!validExperience.includes(experience)) {
      throw new Error(`Invalid experience level. Must be one of: ${validExperience.join(', ')}`);
    }
  }

  /**
   * Get AI-powered evaluation
   */
  async getAIEvaluation(questionsAndAnswers, role, experience, userProfile) {
    try {
      const aiResponse = await this.aiService.evaluateInterviewAnswers(
        questionsAndAnswers,
        role,
        experience,
        userProfile
      );

      if (!aiResponse || typeof aiResponse.overallScore === 'undefined') {
        throw new Error('Invalid AI evaluation response');
      }

      return aiResponse;
    } catch (error) {
      this.logger.error('AI evaluation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Process and enhance AI evaluation
   */
  async processAIEvaluation(aiEvaluation, questionsAndAnswers, role, experience) {
    // Validate AI response structure
    const processedEvaluation = {
      overallScore: Math.max(0, Math.min(100, aiEvaluation.overallScore || 0)),
      individualScores: [],
      summary: aiEvaluation.summary || {},
      competencyAssessment: aiEvaluation.competencyAssessment || {}
    };

    // Process individual question scores
    if (aiEvaluation.individualScores && Array.isArray(aiEvaluation.individualScores)) {
      processedEvaluation.individualScores = aiEvaluation.individualScores.map((score, index) => ({
        questionIndex: index,
        score: Math.max(0, Math.min(10, score.score || 0)),
        feedback: score.feedback || 'No specific feedback provided',
        strengths: Array.isArray(score.strengths) ? score.strengths : [],
        improvements: Array.isArray(score.improvements) ? score.improvements : [],
        category: questionsAndAnswers[index]?.type || 'general',
        question: questionsAndAnswers[index]?.question || ''
      }));
    } else {
      // Generate individual scores if not provided by AI
      processedEvaluation.individualScores = questionsAndAnswers.map((qa, index) => ({
        questionIndex: index,
        score: Math.round(processedEvaluation.overallScore / 10), // Convert to 0-10 scale
        feedback: 'Evaluation completed',
        strengths: [],
        improvements: [],
        category: qa.type || 'general',
        question: qa.question
      }));
    }

    // Ensure competency assessment has all required areas
    const defaultCompetencies = {
      technical: 0,
      communication: 0,
      problemSolving: 0,
      leadership: 0,
      adaptability: 0,
      collaboration: 0
    };

    processedEvaluation.competencyAssessment = {
      ...defaultCompetencies,
      ...processedEvaluation.competencyAssessment
    };

    // Validate and normalize competency scores
    Object.keys(processedEvaluation.competencyAssessment).forEach(key => {
      const score = processedEvaluation.competencyAssessment[key];
      processedEvaluation.competencyAssessment[key] = Math.max(0, Math.min(10, score || 0));
    });

    return processedEvaluation;
  }

  /**
   * Calculate detailed scores using scoring algorithms
   */
  calculateDetailedScores(evaluation, questionsAndAnswers) {
    const detailedScores = {
      byCategory: {},
      byCompetency: {},
      trends: {},
      distribution: {}
    };

    // Calculate scores by question category
    const categoryGroups = {};
    evaluation.individualScores.forEach(score => {
      const category = score.category || 'general';
      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push(score.score);
    });

    Object.keys(categoryGroups).forEach(category => {
      const scores = categoryGroups[category];
      detailedScores.byCategory[category] = {
        average: this.calculateAverage(scores),
        count: scores.length,
        highest: Math.max(...scores),
        lowest: Math.min(...scores),
        consistency: this.calculateConsistency(scores)
      };
    });

    // Calculate competency-based scores
    Object.keys(evaluation.competencyAssessment).forEach(competency => {
      const score = evaluation.competencyAssessment[competency];
      detailedScores.byCompetency[competency] = {
        score,
        percentile: this.calculatePercentile(score, competency),
        level: this.getCompetencyLevel(score),
        description: COMPETENCY_AREAS[competency]?.description || 'General competency'
      };
    });

    // Calculate score distribution
    const allScores = evaluation.individualScores.map(s => s.score);
    detailedScores.distribution = {
      excellent: allScores.filter(s => s >= 8).length,
      good: allScores.filter(s => s >= 6 && s < 8).length,
      average: allScores.filter(s => s >= 4 && s < 6).length,
      needsImprovement: allScores.filter(s => s < 4).length
    };

    return detailedScores;
  }

  /**
   * Generate comprehensive feedback
   */
  generateComprehensiveFeedback(evaluation, detailedScores, questionsAndAnswers, role, experience) {
    const feedback = {
      overallFeedback: this.generateOverallFeedback(evaluation, detailedScores, role, experience),
      categoryFeedback: this.generateCategoryFeedback(detailedScores.byCategory, questionsAndAnswers),
      competencyFeedback: this.generateCompetencyFeedback(detailedScores.byCompetency),
      improvementPlan: this.generateImprovementPlan(evaluation, detailedScores, role, experience),
      nextSteps: this.generateNextSteps(evaluation, detailedScores, role, experience)
    };

    return feedback;
  }

  /**
   * Generate overall feedback
   */
  generateOverallFeedback(evaluation, detailedScores, role, experience) {
    const score = evaluation.overallScore;
    let performanceLevel = 'needs improvement';
    
    if (score >= 80) performanceLevel = 'excellent';
    else if (score >= 70) performanceLevel = 'good';
    else if (score >= 60) performanceLevel = 'satisfactory';
    else if (score >= 50) performanceLevel = 'below average';

    const strongestCompetency = Object.entries(detailedScores.byCompetency)
      .sort(([,a], [,b]) => b.score - a.score)[0];
    
    const weakestCompetency = Object.entries(detailedScores.byCompetency)
      .sort(([,a], [,b]) => a.score - b.score)[0];

    return {
      performanceLevel,
      score,
      summary: `Your interview performance was ${performanceLevel} with an overall score of ${score}/100. ` +
               `Your strongest area is ${strongestCompetency[0]} (${strongestCompetency[1].score}/10), ` +
               `while ${weakestCompetency[0]} (${weakestCompetency[1].score}/10) presents the most opportunity for growth.`,
      keyHighlights: this.generateKeyHighlights(evaluation, detailedScores),
      areasOfStrength: this.extractStrengths(evaluation),
      developmentAreas: this.extractImprovementAreas(evaluation)
    };
  }

  /**
   * Generate category-specific feedback
   */
  generateCategoryFeedback(categoryScores, questionsAndAnswers) {
    const feedback = {};

    Object.entries(categoryScores).forEach(([category, scores]) => {
      const templates = FEEDBACK_TEMPLATES.strengths[category] || FEEDBACK_TEMPLATES.strengths.behavioral;
      const improvementTemplates = FEEDBACK_TEMPLATES.improvements[category] || FEEDBACK_TEMPLATES.improvements.behavioral;

      feedback[category] = {
        score: scores.average,
        performance: this.getPerformanceLevel(scores.average),
        consistency: scores.consistency,
        feedback: scores.average >= 7 ? 
          this.selectRandomTemplate(templates) : 
          this.selectRandomTemplate(improvementTemplates),
        recommendations: this.generateCategoryRecommendations(category, scores.average)
      };
    });

    return feedback;
  }

  /**
   * Generate competency-specific feedback
   */
  generateCompetencyFeedback(competencyScores) {
    const feedback = {};

    Object.entries(competencyScores).forEach(([competency, data]) => {
      feedback[competency] = {
        ...data,
        feedback: this.generateCompetencySpecificFeedback(competency, data.score),
        developmentSuggestions: this.generateCompetencyDevelopmentSuggestions(competency, data.score)
      };
    });

    return feedback;
  }

  /**
   * Generate improvement plan
   */
  generateImprovementPlan(evaluation, detailedScores, role, experience) {
    const weakAreas = Object.entries(detailedScores.byCompetency)
      .filter(([, data]) => data.score < 6)
      .sort(([,a], [,b]) => a.score - b.score)
      .slice(0, 3);

    const improvementPlan = {
      priority: 'high',
      timeframe: '3-6 months',
      focusAreas: weakAreas.map(([competency, data]) => ({
        area: competency,
        currentScore: data.score,
        targetScore: Math.min(10, data.score + 2),
        actions: this.generateImprovementActions(competency, data.score, role, experience),
        resources: this.generateLearningResources(competency, role, experience),
        timeline: this.generateImprovementTimeline(competency, data.score)
      })),
      milestones: this.generateMilestones(weakAreas, role, experience)
    };

    return improvementPlan;
  }

  /**
   * Generate next steps
   */
  generateNextSteps(evaluation, detailedScores, role, experience) {
    const score = evaluation.overallScore;
    const nextSteps = [];

    if (score >= 80) {
      nextSteps.push('Continue practicing to maintain your excellent performance');
      nextSteps.push('Focus on advanced topics and leadership scenarios');
      nextSteps.push('Consider mentoring others to reinforce your knowledge');
    } else if (score >= 70) {
      nextSteps.push('Work on consistency across all question types');
      nextSteps.push('Practice more complex scenarios and edge cases');
      nextSteps.push('Seek feedback from senior professionals in your field');
    } else if (score >= 60) {
      nextSteps.push('Focus on fundamental concepts and best practices');
      nextSteps.push('Practice structured answering techniques (STAR method)');
      nextSteps.push('Seek additional training or courses in weak areas');
    } else {
      nextSteps.push('Start with basic concepts and build foundation knowledge');
      nextSteps.push('Practice regularly with mock interviews');
      nextSteps.push('Consider working with a mentor or career coach');
    }

    return {
      immediate: nextSteps.slice(0, 2),
      shortTerm: this.generateShortTermSteps(detailedScores, role, experience),
      longTerm: this.generateLongTermSteps(evaluation.overallScore, role, experience)
    };
  }

  /**
   * Create comprehensive evaluation report
   */
  createEvaluationReport(evaluation, detailedScores, feedback, questionsAndAnswers, role, experience) {
    return {
      // Core evaluation data
      overallScore: evaluation.overallScore,
      individualScores: evaluation.individualScores,
      competencyAssessment: evaluation.competencyAssessment,
      
      // Detailed analysis
      detailedScores,
      
      // Comprehensive feedback
      feedback,
      
      // Summary and recommendations
      summary: {
        strengths: feedback.overallFeedback.areasOfStrength,
        areasForImprovement: feedback.overallFeedback.developmentAreas,
        recommendations: evaluation.summary.recommendations || [],
        nextSteps: feedback.nextSteps.immediate
      },
      
      // Improvement planning
      improvementPlan: feedback.improvementPlan,
      
      // Metadata
      metadata: {
        role,
        experience,
        questionsEvaluated: questionsAndAnswers.length,
        evaluationDate: new Date().toISOString(),
        evaluationVersion: '1.0',
        aiGenerated: true
      }
    };
  }

  /**
   * Get fallback evaluation when AI service fails
   */
  getFallbackEvaluation(options) {
    const {
      questionsAndAnswers,
      role = 'software-developer',
      experience = 'entry'
    } = options;

    this.logger.warn('Using fallback evaluation due to AI service failure', { role, experience });

    // Basic scoring based on answer length and structure
    const individualScores = questionsAndAnswers.map((qa, index) => {
      const answerLength = qa.answer.length;
      const hasStructure = qa.answer.includes('.') || qa.answer.includes(',');
      const baseScore = Math.min(8, Math.max(3, Math.floor(answerLength / 50)));
      const structureBonus = hasStructure ? 1 : 0;
      
      return {
        questionIndex: index,
        score: Math.min(10, baseScore + structureBonus),
        feedback: 'Basic evaluation completed - detailed AI analysis unavailable',
        strengths: ['Provided a response'],
        improvements: ['Consider providing more detailed examples'],
        category: qa.type || 'general',
        question: qa.question
      };
    });

    const overallScore = Math.round(
      individualScores.reduce((sum, score) => sum + score.score, 0) / individualScores.length * 10
    );

    return {
      overallScore,
      individualScores,
      competencyAssessment: {
        technical: Math.round(overallScore / 10),
        communication: Math.round(overallScore / 10),
        problemSolving: Math.round(overallScore / 10),
        leadership: Math.round(overallScore / 10),
        adaptability: Math.round(overallScore / 10),
        collaboration: Math.round(overallScore / 10)
      },
      summary: {
        strengths: ['Completed the interview'],
        areasForImprovement: ['Detailed evaluation unavailable - AI service temporarily unavailable'],
        recommendations: ['Try again later for detailed AI-powered feedback'],
        nextSteps: ['Practice more interview questions', 'Prepare specific examples']
      },
      metadata: {
        role,
        experience,
        questionsEvaluated: questionsAndAnswers.length,
        evaluationDate: new Date().toISOString(),
        evaluationVersion: '1.0',
        aiGenerated: false,
        fallback: true
      }
    };
  }

  // Helper methods
  calculateAverage(numbers) {
    return numbers.length > 0 ? numbers.reduce((sum, num) => sum + num, 0) / numbers.length : 0;
  }

  calculateConsistency(scores) {
    if (scores.length <= 1) return 1;
    const avg = this.calculateAverage(scores);
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
    return Math.max(0, 1 - (Math.sqrt(variance) / 10)); // Normalize to 0-1 scale
  }

  calculatePercentile(score, competency) {
    // Simplified percentile calculation - in production, this would use historical data
    return Math.min(100, Math.max(0, score * 10));
  }

  getCompetencyLevel(score) {
    if (score >= 8) return 'Expert';
    if (score >= 6) return 'Proficient';
    if (score >= 4) return 'Developing';
    return 'Beginner';
  }

  getPerformanceLevel(score) {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Satisfactory';
    return 'Needs Improvement';
  }

  selectRandomTemplate(templates) {
    return templates[Math.floor(Math.random() * templates.length)];
  }

  generateKeyHighlights(evaluation, detailedScores) {
    const highlights = [];
    
    // Add performance highlights
    if (evaluation.overallScore >= 80) {
      highlights.push('Exceptional overall performance');
    }
    
    // Add competency highlights
    Object.entries(detailedScores.byCompetency).forEach(([competency, data]) => {
      if (data.score >= 8) {
        highlights.push(`Strong ${competency} skills demonstrated`);
      }
    });

    return highlights.slice(0, 3); // Limit to top 3 highlights
  }

  extractStrengths(evaluation) {
    const strengths = [];
    
    if (evaluation.summary && evaluation.summary.strengths) {
      strengths.push(...evaluation.summary.strengths);
    }
    
    evaluation.individualScores.forEach(score => {
      if (score.strengths && score.strengths.length > 0) {
        strengths.push(...score.strengths);
      }
    });

    // Remove duplicates and limit
    return [...new Set(strengths)].slice(0, 5);
  }

  extractImprovementAreas(evaluation) {
    const improvements = [];
    
    if (evaluation.summary && evaluation.summary.areasForImprovement) {
      improvements.push(...evaluation.summary.areasForImprovement);
    }
    
    evaluation.individualScores.forEach(score => {
      if (score.improvements && score.improvements.length > 0) {
        improvements.push(...score.improvements);
      }
    });

    // Remove duplicates and limit
    return [...new Set(improvements)].slice(0, 5);
  }

  generateCategoryRecommendations(category, score) {
    const recommendations = {
      technical: [
        'Practice coding problems regularly',
        'Study system design concepts',
        'Review fundamental computer science topics',
        'Build more projects to gain practical experience'
      ],
      behavioral: [
        'Practice the STAR method for answering questions',
        'Prepare specific examples from your experience',
        'Work on storytelling and communication skills',
        'Reflect on your experiences and lessons learned'
      ],
      situational: [
        'Practice case study analysis',
        'Develop frameworks for problem-solving',
        'Study business scenarios and decision-making',
        'Improve analytical and critical thinking skills'
      ]
    };

    const categoryRecs = recommendations[category] || recommendations.behavioral;
    return score < 6 ? categoryRecs.slice(0, 2) : categoryRecs.slice(2, 4);
  }

  generateCompetencySpecificFeedback(competency, score) {
    const feedbackMap = {
      technical: score >= 7 ? 'Strong technical foundation demonstrated' : 'Focus on building technical depth',
      communication: score >= 7 ? 'Excellent communication skills' : 'Work on clarity and structure in responses',
      leadership: score >= 7 ? 'Good leadership potential shown' : 'Develop leadership experiences and examples',
      problemSolving: score >= 7 ? 'Solid analytical approach' : 'Practice systematic problem-solving methods',
      adaptability: score >= 7 ? 'Shows good flexibility' : 'Work on demonstrating adaptability in examples',
      collaboration: score >= 7 ? 'Strong teamwork orientation' : 'Focus on team collaboration experiences'
    };

    return feedbackMap[competency] || 'Continue developing this competency';
  }

  generateCompetencyDevelopmentSuggestions(competency, score) {
    const suggestions = {
      technical: ['Take online courses', 'Build side projects', 'Contribute to open source', 'Attend tech meetups'],
      communication: ['Join Toastmasters', 'Practice presentations', 'Write technical blogs', 'Seek feedback on communication'],
      leadership: ['Lead a project', 'Mentor junior colleagues', 'Take leadership courses', 'Volunteer for leadership roles'],
      problemSolving: ['Practice case studies', 'Learn problem-solving frameworks', 'Solve coding challenges', 'Analyze business problems'],
      adaptability: ['Seek diverse experiences', 'Learn new technologies', 'Work in different teams', 'Embrace change initiatives'],
      collaboration: ['Work on team projects', 'Practice active listening', 'Learn conflict resolution', 'Build cross-functional relationships']
    };

    return suggestions[competency]?.slice(0, 3) || ['Continue practicing and seeking feedback'];
  }

  generateImprovementActions(competency, currentScore, role, experience) {
    // Generate specific, actionable improvement steps
    const actions = [];
    
    if (currentScore < 4) {
      actions.push(`Start with fundamentals of ${competency}`);
      actions.push(`Seek mentorship or coaching in ${competency}`);
    } else if (currentScore < 6) {
      actions.push(`Practice ${competency} through structured exercises`);
      actions.push(`Get regular feedback on ${competency} development`);
    } else {
      actions.push(`Refine and advance ${competency} skills`);
      actions.push(`Share knowledge and mentor others in ${competency}`);
    }

    return actions;
  }

  generateLearningResources(competency, role, experience) {
    // Generate relevant learning resources
    return [
      `Online courses for ${competency} development`,
      `Books and articles on ${competency}`,
      `Professional workshops and seminars`,
      `Industry conferences and networking events`
    ];
  }

  generateImprovementTimeline(competency, currentScore) {
    const timeframes = {
      low: '6-12 months',
      medium: '3-6 months',
      high: '1-3 months'
    };

    if (currentScore < 4) return timeframes.low;
    if (currentScore < 6) return timeframes.medium;
    return timeframes.high;
  }

  generateMilestones(weakAreas, role, experience) {
    return [
      'Complete initial assessment and create development plan',
      'Achieve 20% improvement in weakest competency area',
      'Demonstrate progress through practice interviews',
      'Reach target scores in all focus areas'
    ];
  }

  generateShortTermSteps(detailedScores, role, experience) {
    return [
      'Schedule regular practice sessions',
      'Identify specific learning resources',
      'Set up feedback mechanisms'
    ];
  }

  generateLongTermSteps(overallScore, role, experience) {
    return [
      'Develop expertise in your field',
      'Build leadership and mentoring skills',
      'Contribute to professional community'
    ];
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      service: 'InterviewEvaluationService',
      aiServiceReady: this.aiService.isReady(),
      scoringCriteria: Object.keys(SCORING_CRITERIA),
      competencyAreas: Object.keys(COMPETENCY_AREAS),
      evaluationVersion: '1.0'
    };
  }
}

// Export singleton instance
const interviewEvaluationService = new InterviewEvaluationService();

export { InterviewEvaluationService };
export default interviewEvaluationService;