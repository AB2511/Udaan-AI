import InterviewSession from '../models/InterviewSession.js';
import QuestionBank from '../models/QuestionBank.js';

/**
 * InterviewService - Advanced interview management with NLP-based analysis
 * Provides response analysis, performance scoring, and improvement recommendations
 */
class InterviewService {
  
  /**
   * Analyze user response using NLP techniques
   * @param {string} response - User's text response
   * @param {string} question - Original question
   * @param {string} category - Question category
   * @param {string} sessionType - Interview session type
   * @returns {Object} Analysis results
   */
  async retry(fn, retries = 3, delay = 2000) { // Increase delay to 2s
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  isRetryableError(error) {
    return error.response && [429, 503].includes(error.response.status);
  }

  async getInterviewHistory() {
    const cacheKey = 'interview-history';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;
    return this.retry(async () => {
      const response = await api.get('/interviews/history');
      this.setCachedData(cacheKey, response.data);
      return response.data;
    });
  }

  static analyzeResponse(response, question, category, sessionType) {
    if (!response || typeof response !== 'string') {
      return {
        score: 0,
        confidence: 0,
        clarity: 0,
        completeness: 0,
        relevance: 0,
        keywordMatches: [],
        sentimentScore: 0,
        structureScore: 0,
        insights: ['No response provided']
      };
    }

    const analysis = {
      score: 0,
      confidence: 0,
      clarity: 0,
      completeness: 0,
      relevance: 0,
      keywordMatches: [],
      sentimentScore: 0,
      structureScore: 0,
      insights: []
    };

    // Basic text analysis
    const wordCount = response.trim().split(/\s+/).length;
    const sentenceCount = response.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;

    // Analyze completeness based on response length
    analysis.completeness = this.analyzeCompleteness(wordCount, category);
    
    // Analyze clarity based on sentence structure
    analysis.clarity = this.analyzeClarity(avgWordsPerSentence, sentenceCount, response);
    
    // Analyze relevance based on keyword matching
    analysis.relevance = this.analyzeRelevance(response, question, category, sessionType);
    
    // Analyze confidence based on language patterns
    analysis.confidence = this.analyzeConfidence(response);
    
    // Analyze sentiment
    analysis.sentimentScore = this.analyzeSentiment(response);
    
    // Analyze structure
    analysis.structureScore = this.analyzeStructure(response, category);
    
    // Calculate overall score
    analysis.score = this.calculateOverallScore(analysis);
    
    // Generate insights
    analysis.insights = this.generateInsights(analysis, wordCount, category);

    return analysis;
  }

  /**
   * Analyze response completeness
   * @param {number} wordCount - Number of words in response
   * @param {string} category - Question category
   * @returns {number} Completeness score (0-10)
   */
  static analyzeCompleteness(wordCount, category) {
    const expectedLengths = {
      'technical': { min: 50, optimal: 150, max: 300 },
      'behavioral': { min: 80, optimal: 200, max: 400 },
      'situational': { min: 60, optimal: 180, max: 350 },
      'problem-solving': { min: 70, optimal: 200, max: 400 },
      'communication': { min: 40, optimal: 120, max: 250 }
    };

    const expected = expectedLengths[category] || expectedLengths['communication'];
    
    if (wordCount === 0) return 0;
    if (wordCount < expected.min * 0.5) return 2;
    if (wordCount < expected.min) return 4;
    if (wordCount >= expected.min && wordCount <= expected.optimal) {
      return 6 + (4 * (wordCount - expected.min) / (expected.optimal - expected.min));
    }
    if (wordCount <= expected.max) return 10;
    
    // Penalize overly long responses
    const excess = wordCount - expected.max;
    return Math.max(7, 10 - (excess / 50));
  }

  /**
   * Analyze response clarity
   * @param {number} avgWordsPerSentence - Average words per sentence
   * @param {number} sentenceCount - Number of sentences
   * @param {string} response - Full response text
   * @returns {number} Clarity score (0-10)
   */
  static analyzeClarity(avgWordsPerSentence, sentenceCount, response) {
    let score = 5; // Base score
    
    // Optimal sentence length (12-20 words)
    if (avgWordsPerSentence >= 12 && avgWordsPerSentence <= 20) {
      score += 2;
    } else if (avgWordsPerSentence >= 8 && avgWordsPerSentence <= 25) {
      score += 1;
    } else if (avgWordsPerSentence < 5 || avgWordsPerSentence > 30) {
      score -= 2;
    }
    
    // Sentence variety (good if 2+ sentences)
    if (sentenceCount >= 2) score += 1;
    if (sentenceCount >= 4) score += 1;
    
    // Check for transition words
    const transitionWords = ['however', 'therefore', 'furthermore', 'additionally', 'consequently', 'meanwhile', 'moreover', 'nevertheless'];
    const hasTransitions = transitionWords.some(word => response.toLowerCase().includes(word));
    if (hasTransitions) score += 1;
    
    // Check for filler words (reduce score)
    const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually'];
    const fillerCount = fillerWords.reduce((count, word) => {
      return count + (response.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
    }, 0);
    score -= Math.min(fillerCount * 0.5, 2);
    
    return Math.max(0, Math.min(10, score));
  }

  /**
   * Analyze response relevance to question
   * @param {string} response - User response
   * @param {string} question - Original question
   * @param {string} category - Question category
   * @param {string} sessionType - Interview session type
   * @returns {number} Relevance score (0-10)
   */
  static analyzeRelevance(response, question, category, sessionType) {
    const responseLower = response.toLowerCase();
    const questionLower = question.toLowerCase();
    
    // Extract key terms from question
    const questionWords = questionLower
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['what', 'when', 'where', 'which', 'would', 'could', 'should', 'have', 'been', 'this', 'that', 'with', 'from'].includes(word));
    
    // Count keyword matches
    const keywordMatches = questionWords.filter(word => responseLower.includes(word));
    const keywordScore = Math.min(10, (keywordMatches.length / Math.max(questionWords.length, 1)) * 10);
    
    // Category-specific keyword analysis
    const categoryKeywords = this.getCategoryKeywords(category, sessionType);
    const categoryMatches = categoryKeywords.filter(keyword => responseLower.includes(keyword.toLowerCase()));
    const categoryScore = Math.min(5, categoryMatches.length);
    
    // Structure relevance (STAR method for behavioral questions)
    let structureScore = 0;
    if (category === 'behavioral' || category === 'situational') {
      const starElements = ['situation', 'task', 'action', 'result'];
      const starMatches = starElements.filter(element => {
        const synonyms = this.getStarSynonyms(element);
        return synonyms.some(synonym => responseLower.includes(synonym));
      });
      structureScore = (starMatches.length / 4) * 3;
    }
    
    return Math.min(10, keywordScore * 0.6 + categoryScore * 0.3 + structureScore * 0.1);
  }

  /**
   * Analyze confidence level in response
   * @param {string} response - User response
   * @returns {number} Confidence score (0-10)
   */
  static analyzeConfidence(response) {
    const responseLower = response.toLowerCase();
    let score = 5; // Base confidence
    
    // Confident language patterns
    const confidentPhrases = [
      'i am confident', 'i believe', 'i know', 'i have experience',
      'i successfully', 'i achieved', 'i led', 'i managed',
      'i implemented', 'i developed', 'i created', 'i solved'
    ];
    
    const uncertainPhrases = [
      'i think maybe', 'i guess', 'i suppose', 'i might',
      'probably', 'perhaps', 'i\'m not sure', 'i don\'t know'
    ];
    
    // Count confident vs uncertain language
    const confidentCount = confidentPhrases.reduce((count, phrase) => {
      return count + (responseLower.includes(phrase) ? 1 : 0);
    }, 0);
    
    const uncertainCount = uncertainPhrases.reduce((count, phrase) => {
      return count + (responseLower.includes(phrase) ? 1 : 0);
    }, 0);
    
    score += confidentCount * 1.5;
    score -= uncertainCount * 2;
    
    // Check for specific examples (increases confidence)
    const exampleIndicators = ['for example', 'for instance', 'specifically', 'in particular'];
    const hasExamples = exampleIndicators.some(indicator => responseLower.includes(indicator));
    if (hasExamples) score += 1;
    
    // Check for quantifiable results
    const numberPattern = /\b\d+(\.\d+)?(%|percent|million|thousand|hours|days|weeks|months|years)\b/g;
    const hasNumbers = numberPattern.test(responseLower);
    if (hasNumbers) score += 1;
    
    return Math.max(0, Math.min(10, score));
  }

  /**
   * Analyze sentiment of response
   * @param {string} response - User response
   * @returns {number} Sentiment score (-5 to 5, where 5 is very positive)
   */
  static analyzeSentiment(response) {
    const responseLower = response.toLowerCase();
    
    const positiveWords = [
      'excellent', 'great', 'good', 'successful', 'achieved', 'accomplished',
      'improved', 'enhanced', 'optimized', 'effective', 'efficient', 'innovative',
      'creative', 'collaborative', 'teamwork', 'leadership', 'growth', 'learning'
    ];
    
    const negativeWords = [
      'failed', 'difficult', 'challenging', 'problem', 'issue', 'struggle',
      'conflict', 'disagreement', 'mistake', 'error', 'wrong', 'bad'
    ];
    
    const positiveCount = positiveWords.reduce((count, word) => {
      return count + (responseLower.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
    }, 0);
    
    const negativeCount = negativeWords.reduce((count, word) => {
      return count + (responseLower.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
    }, 0);
    
    // Calculate sentiment score
    const sentimentScore = (positiveCount - negativeCount) * 0.5;
    return Math.max(-5, Math.min(5, sentimentScore));
  }

  /**
   * Analyze response structure
   * @param {string} response - User response
   * @param {string} category - Question category
   * @returns {number} Structure score (0-10)
   */
  static analyzeStructure(response, category) {
    let score = 5; // Base score
    
    // Check for logical flow indicators
    const flowIndicators = ['first', 'second', 'third', 'then', 'next', 'finally', 'in conclusion'];
    const hasFlow = flowIndicators.some(indicator => response.toLowerCase().includes(indicator));
    if (hasFlow) score += 2;
    
    // Check for problem-solution structure
    const problemSolutionWords = ['problem', 'solution', 'challenge', 'approach', 'strategy', 'method'];
    const hasProblemSolution = problemSolutionWords.filter(word => 
      response.toLowerCase().includes(word)
    ).length >= 2;
    if (hasProblemSolution) score += 1;
    
    // Category-specific structure analysis
    if (category === 'behavioral' || category === 'situational') {
      // Look for STAR method elements
      const starScore = this.analyzeStarStructure(response);
      score += starScore * 0.3;
    } else if (category === 'technical' || category === 'problem-solving') {
      // Look for technical explanation structure
      const techScore = this.analyzeTechnicalStructure(response);
      score += techScore * 0.3;
    }
    
    return Math.max(0, Math.min(10, score));
  }

  /**
   * Calculate overall response score
   * @param {Object} analysis - Analysis components
   * @returns {number} Overall score (0-10)
   */
  static calculateOverallScore(analysis) {
    const weights = {
      completeness: 0.25,
      clarity: 0.20,
      relevance: 0.25,
      confidence: 0.15,
      structure: 0.15
    };
    
    const weightedScore = 
      (analysis.completeness * weights.completeness) +
      (analysis.clarity * weights.clarity) +
      (analysis.relevance * weights.relevance) +
      (analysis.confidence * weights.confidence) +
      (analysis.structureScore * weights.structure);
    
    // Apply sentiment bonus/penalty
    const sentimentAdjustment = analysis.sentimentScore * 0.1;
    
    return Math.max(0, Math.min(10, weightedScore + sentimentAdjustment));
  }

  /**
   * Generate performance insights
   * @param {Object} analysis - Analysis results
   * @param {number} wordCount - Word count
   * @param {string} category - Question category
   * @returns {Array} Array of insights
   */
  static generateInsights(analysis, wordCount, category) {
    const insights = [];
    
    // Completeness insights
    if (analysis.completeness < 4) {
      insights.push('Response is too brief. Provide more detailed explanations and examples.');
    } else if (analysis.completeness > 9) {
      insights.push('Excellent response length with comprehensive details.');
    }
    
    // Clarity insights
    if (analysis.clarity < 5) {
      insights.push('Improve clarity by using shorter sentences and clearer structure.');
    } else if (analysis.clarity > 8) {
      insights.push('Very clear and well-structured response.');
    }
    
    // Relevance insights
    if (analysis.relevance < 5) {
      insights.push('Focus more on directly answering the question asked.');
    } else if (analysis.relevance > 8) {
      insights.push('Excellent relevance to the question topic.');
    }
    
    // Confidence insights
    if (analysis.confidence < 5) {
      insights.push('Use more confident language and provide specific examples.');
    } else if (analysis.confidence > 8) {
      insights.push('Shows strong confidence and conviction in responses.');
    }
    
    // Structure insights
    if (analysis.structureScore < 5) {
      if (category === 'behavioral') {
        insights.push('Consider using the STAR method (Situation, Task, Action, Result) for behavioral questions.');
      } else {
        insights.push('Improve response structure with logical flow and clear organization.');
      }
    }
    
    return insights;
  }

  /**
   * Generate comprehensive feedback for interview session
   * @param {Object} session - Interview session
   * @returns {Object} Comprehensive feedback
   */
  static async generateComprehensiveFeedback(session) {
    const questionAnalyses = [];
    
    // Analyze each question response
    for (const question of session.questions) {
      if (question.isAnswered && question.userAnswer.text) {
        const analysis = this.analyzeResponse(
          question.userAnswer.text,
          question.question,
          question.category,
          session.sessionType
        );
        
        questionAnalyses.push({
          questionId: question.questionId,
          category: question.category,
          analysis
        });
        
        // Update question feedback with detailed analysis
        question.feedback = {
          content: this.generateDetailedFeedback(analysis, question.category),
          strengths: this.identifyStrengths(analysis),
          improvements: this.identifyImprovements(analysis, question.category),
          score: Math.round(analysis.score)
        };
      }
    }
    
    // Calculate category averages
    const categoryScores = this.calculateCategoryScores(questionAnalyses);
    
    // Generate overall feedback
    const overallFeedback = {
      communication: {
        score: Math.round(categoryScores.communication || 6),
        feedback: this.generateCommunicationFeedback(categoryScores.communication)
      },
      technicalAccuracy: {
        score: Math.round(categoryScores.technical || categoryScores.problemSolving || 6),
        feedback: this.generateTechnicalFeedback(categoryScores.technical, session.sessionType)
      },
      confidence: {
        score: Math.round(this.calculateAverageConfidence(questionAnalyses)),
        feedback: this.generateConfidenceFeedback(questionAnalyses)
      },
      problemSolving: {
        score: Math.round(categoryScores.problemSolving || categoryScores.technical || 6),
        feedback: this.generateProblemSolvingFeedback(categoryScores.problemSolving)
      },
      overall: this.generateOverallMessage(session.overallScore, session.sessionType, questionAnalyses),
      improvementAreas: this.generateImprovementAreas(categoryScores, questionAnalyses, session.sessionType),
      strengths: this.generateStrengths(categoryScores, questionAnalyses),
      nextSteps: this.generateNextSteps(session.overallScore, session.sessionType, categoryScores)
    };
    
    return overallFeedback;
  }

  // Helper methods for feedback generation

  static getCategoryKeywords(category, sessionType) {
    const keywords = {
      'technical': ['algorithm', 'data structure', 'complexity', 'optimization', 'implementation', 'design pattern', 'architecture'],
      'behavioral': ['team', 'leadership', 'communication', 'conflict', 'collaboration', 'motivation', 'challenge'],
      'situational': ['situation', 'decision', 'approach', 'outcome', 'result', 'impact', 'solution'],
      'problem-solving': ['problem', 'solution', 'analysis', 'approach', 'strategy', 'method', 'process'],
      'communication': ['explain', 'describe', 'communicate', 'present', 'discuss', 'clarify', 'understand']
    };
    
    return keywords[category] || keywords['communication'];
  }

  static getStarSynonyms(element) {
    const synonyms = {
      'situation': ['situation', 'context', 'background', 'scenario', 'circumstance'],
      'task': ['task', 'goal', 'objective', 'responsibility', 'assignment', 'challenge'],
      'action': ['action', 'approach', 'method', 'strategy', 'steps', 'process', 'did', 'implemented'],
      'result': ['result', 'outcome', 'impact', 'achievement', 'success', 'improvement', 'benefit']
    };
    
    return synonyms[element] || [];
  }

  static analyzeStarStructure(response) {
    const responseLower = response.toLowerCase();
    const starElements = ['situation', 'task', 'action', 'result'];
    let score = 0;
    
    starElements.forEach(element => {
      const synonyms = this.getStarSynonyms(element);
      const hasElement = synonyms.some(synonym => responseLower.includes(synonym));
      if (hasElement) score += 2.5;
    });
    
    return Math.min(10, score);
  }

  static analyzeTechnicalStructure(response) {
    const responseLower = response.toLowerCase();
    const technicalStructure = ['problem', 'approach', 'implementation', 'complexity', 'testing'];
    let score = 0;
    
    technicalStructure.forEach(element => {
      if (responseLower.includes(element)) score += 2;
    });
    
    return Math.min(10, score);
  }

  static generateDetailedFeedback(analysis, category) {
    const score = analysis.score;
    
    if (score >= 8) {
      return `Excellent response! You demonstrated strong ${category} skills with clear, comprehensive, and well-structured answers. Your confidence and relevance to the topic were particularly impressive.`;
    } else if (score >= 6) {
      return `Good response with solid understanding. Your answer shows competence in ${category} but could benefit from more specific examples and clearer structure.`;
    } else if (score >= 4) {
      return `Adequate response that addresses the question but needs improvement. Focus on providing more detailed explanations and relevant examples for ${category} questions.`;
    } else {
      return `This response needs significant improvement. Consider researching ${category} topics more thoroughly and practice structuring your answers with specific examples.`;
    }
  }

  static identifyStrengths(analysis) {
    const strengths = [];
    
    if (analysis.completeness >= 7) strengths.push('Comprehensive and detailed response');
    if (analysis.clarity >= 7) strengths.push('Clear and well-articulated communication');
    if (analysis.relevance >= 7) strengths.push('Highly relevant to the question');
    if (analysis.confidence >= 7) strengths.push('Confident and assertive delivery');
    if (analysis.structureScore >= 7) strengths.push('Well-organized response structure');
    if (analysis.sentimentScore > 2) strengths.push('Positive and professional tone');
    
    return strengths.length > 0 ? strengths : ['Shows potential for improvement'];
  }

  static identifyImprovements(analysis, category) {
    const improvements = [];
    
    if (analysis.completeness < 5) improvements.push('Provide more detailed and comprehensive answers');
    if (analysis.clarity < 5) improvements.push('Improve clarity and sentence structure');
    if (analysis.relevance < 5) improvements.push('Focus more directly on answering the specific question');
    if (analysis.confidence < 5) improvements.push('Use more confident language and provide specific examples');
    if (analysis.structureScore < 5) {
      if (category === 'behavioral') {
        improvements.push('Use the STAR method for behavioral questions');
      } else {
        improvements.push('Organize responses with clearer logical structure');
      }
    }
    
    return improvements.length > 0 ? improvements : ['Continue practicing to maintain consistency'];
  }

  static calculateCategoryScores(questionAnalyses) {
    const categoryGroups = {};
    
    questionAnalyses.forEach(qa => {
      if (!categoryGroups[qa.category]) {
        categoryGroups[qa.category] = [];
      }
      categoryGroups[qa.category].push(qa.analysis.score);
    });
    
    const categoryScores = {};
    Object.keys(categoryGroups).forEach(category => {
      const scores = categoryGroups[category];
      categoryScores[category] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });
    
    return categoryScores;
  }

  static calculateAverageConfidence(questionAnalyses) {
    if (questionAnalyses.length === 0) return 6;
    
    const totalConfidence = questionAnalyses.reduce((sum, qa) => sum + qa.analysis.confidence, 0);
    return totalConfidence / questionAnalyses.length;
  }

  static generateCommunicationFeedback(score) {
    if (score >= 8) return 'Excellent communication skills with clear, articulate responses';
    if (score >= 6) return 'Good communication with room for improvement in clarity';
    if (score >= 4) return 'Adequate communication but needs better structure and clarity';
    return 'Communication skills need significant improvement';
  }

  static generateTechnicalFeedback(score, sessionType) {
    const skillType = sessionType === 'technical' ? 'technical' : 'analytical';
    
    if (score >= 8) return `Excellent ${skillType} knowledge and problem-solving approach`;
    if (score >= 6) return `Good ${skillType} understanding with minor gaps`;
    if (score >= 4) return `Basic ${skillType} knowledge that needs strengthening`;
    return `${skillType} skills require significant development`;
  }

  static generateConfidenceFeedback(questionAnalyses) {
    const avgConfidence = this.calculateAverageConfidence(questionAnalyses);
    
    if (avgConfidence >= 8) return 'Demonstrates strong confidence and conviction in responses';
    if (avgConfidence >= 6) return 'Shows good confidence with occasional uncertainty';
    if (avgConfidence >= 4) return 'Moderate confidence level, could be more assertive';
    return 'Needs to build confidence and use more decisive language';
  }

  static generateProblemSolvingFeedback(score) {
    if (score >= 8) return 'Excellent problem-solving approach with systematic thinking';
    if (score >= 6) return 'Good problem-solving skills with logical reasoning';
    if (score >= 4) return 'Basic problem-solving approach that needs refinement';
    return 'Problem-solving methodology needs significant improvement';
  }

  static generateOverallMessage(score, sessionType, questionAnalyses) {
    const performance = this.getPerformanceLevel(score);
    const avgConfidence = this.calculateAverageConfidence(questionAnalyses);
    
    let message = `You scored ${score}% in this ${sessionType} interview, indicating ${performance.toLowerCase()} performance. `;
    
    if (score >= 80) {
      message += 'You demonstrated strong interview skills and would likely perform well in real interviews.';
    } else if (score >= 60) {
      message += 'You have solid foundations but should focus on the identified improvement areas.';
    } else {
      message += 'This interview highlights several areas that need attention before real interviews.';
    }
    
    if (avgConfidence < 5) {
      message += ' Work on building confidence in your responses.';
    }
    
    return message;
  }

  static generateImprovementAreas(categoryScores, questionAnalyses, sessionType) {
    const areas = [];
    
    // Analyze category performance
    Object.entries(categoryScores).forEach(([category, score]) => {
      if (score < 6) {
        areas.push({
          area: category,
          suggestion: `Focus on improving ${category} skills through targeted practice and study`,
          priority: score < 4 ? 'high' : 'medium'
        });
      }
    });
    
    // Analyze confidence across all responses
    const avgConfidence = this.calculateAverageConfidence(questionAnalyses);
    if (avgConfidence < 6) {
      areas.push({
        area: 'confidence',
        suggestion: 'Practice speaking with more conviction and provide specific examples',
        priority: avgConfidence < 4 ? 'high' : 'medium'
      });
    }
    
    // Session-type specific recommendations
    if (sessionType === 'behavioral' && categoryScores.behavioral < 6) {
      areas.push({
        area: 'STAR method',
        suggestion: 'Learn and practice the STAR method for behavioral questions',
        priority: 'high'
      });
    }
    
    if (areas.length === 0) {
      areas.push({
        area: 'consistency',
        suggestion: 'Maintain consistent high performance across all question types',
        priority: 'low'
      });
    }
    
    return areas;
  }

  static generateStrengths(categoryScores, questionAnalyses) {
    const strengths = [];
    
    // Category strengths
    Object.entries(categoryScores).forEach(([category, score]) => {
      if (score >= 7) {
        strengths.push(`Strong ${category} skills demonstrated throughout the interview`);
      }
    });
    
    // Overall confidence strength
    const avgConfidence = this.calculateAverageConfidence(questionAnalyses);
    if (avgConfidence >= 7) {
      strengths.push('Confident and assertive communication style');
    }
    
    // Consistency strength
    const scores = Object.values(categoryScores);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    if (maxScore - minScore < 2 && minScore >= 6) {
      strengths.push('Consistent performance across all question categories');
    }
    
    return strengths.length > 0 ? strengths : ['Shows potential and willingness to improve'];
  }

  static generateNextSteps(score, sessionType, categoryScores) {
    const steps = [];
    
    if (score < 60) {
      steps.push(`Review fundamental ${sessionType} interview concepts and common questions`);
      steps.push('Practice with mock interviews to build confidence and fluency');
      steps.push('Study industry-specific knowledge and best practices');
    } else if (score < 80) {
      steps.push('Focus on identified improvement areas through targeted practice');
      steps.push('Record yourself answering questions to improve delivery');
      steps.push('Seek feedback from mentors or interview coaches');
    } else {
      steps.push('Excellent performance! Consider helping others with interview preparation');
      steps.push('Focus on advanced interview techniques and leadership questions');
      steps.push('Practice with senior-level or specialized interview scenarios');
    }
    
    // Add specific recommendations based on category performance
    const weakestCategory = Object.entries(categoryScores).reduce((min, [cat, score]) => 
      score < min.score ? { category: cat, score } : min, 
      { category: '', score: 10 }
    );
    
    if (weakestCategory.score < 6) {
      steps.push(`Prioritize improving ${weakestCategory.category} skills through focused study and practice`);
    }
    
    steps.push(`Continue practicing ${sessionType} interviews to maintain and improve skills`);
    
    return steps;
  }

  static getPerformanceLevel(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    if (score >= 60) return 'Below Average';
    return 'Needs Improvement';
  }

  /**
   * Track improvement over time for a user
   * @param {string} userId - User ID
   * @param {string} sessionType - Interview session type
   * @returns {Object} Improvement tracking data
   */
  static async trackImprovement(userId, sessionType = null) {
    try {
      const query = { userId, status: 'completed' };
      if (sessionType) query.sessionType = sessionType;
      
      const sessions = await InterviewSession.find(query)
        .sort({ completedAt: 1 })
        .select('sessionType overallScore feedback completedAt')
        .limit(20);
      
      if (sessions.length < 2) {
        return {
          hasImprovement: false,
          message: 'Need at least 2 completed interviews to track improvement'
        };
      }
      
      // Calculate improvement metrics
      const firstSession = sessions[0];
      const lastSession = sessions[sessions.length - 1];
      const scoreImprovement = lastSession.overallScore - firstSession.overallScore;
      
      // Calculate average improvement per session
      const improvements = [];
      for (let i = 1; i < sessions.length; i++) {
        improvements.push(sessions[i].overallScore - sessions[i-1].overallScore);
      }
      
      const avgImprovement = improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;
      
      return {
        hasImprovement: true,
        totalSessions: sessions.length,
        scoreImprovement,
        avgImprovement: Math.round(avgImprovement * 100) / 100,
        firstScore: firstSession.overallScore,
        lastScore: lastSession.overallScore,
        trend: scoreImprovement > 0 ? 'improving' : scoreImprovement < 0 ? 'declining' : 'stable',
        sessions: sessions.map(s => ({
          date: s.completedAt,
          score: s.overallScore,
          type: s.sessionType
        }))
      };
    } catch (error) {
      console.error('Error tracking improvement:', error);
      throw error;
    }
  }

  /**
   * Get personalized practice recommendations
   * @param {string} userId - User ID
   * @returns {Object} Practice recommendations
   */
  static async getPersonalizedRecommendations(userId) {
    try {
      // Get recent interview performance
      const recentSessions = await InterviewSession.find({
        userId,
        status: 'completed'
      })
      .sort({ completedAt: -1 })
      .limit(5)
      .select('sessionType overallScore feedback questions');
      
      if (recentSessions.length === 0) {
        return {
          recommendations: [
            'Start with a behavioral interview to assess communication skills',
            'Try a technical interview to evaluate problem-solving abilities',
            'Practice with HR questions to prepare for general interviews'
          ],
          focusAreas: ['communication', 'confidence', 'structure'],
          suggestedSessionType: 'behavioral'
        };
      }
      
      // Analyze performance patterns
      const performanceByType = {};
      const weakAreas = new Set();
      
      recentSessions.forEach(session => {
        if (!performanceByType[session.sessionType]) {
          performanceByType[session.sessionType] = [];
        }
        performanceByType[session.sessionType].push(session.overallScore);
        
        // Identify weak areas from feedback
        if (session.feedback && session.feedback.improvementAreas) {
          session.feedback.improvementAreas.forEach(area => {
            if (area.priority === 'high' || area.priority === 'medium') {
              weakAreas.add(area.area);
            }
          });
        }
      });
      
      // Generate recommendations
      const recommendations = [];
      const focusAreas = Array.from(weakAreas);
      
      // Find weakest session type
      let weakestType = null;
      let lowestAvg = 100;
      
      Object.entries(performanceByType).forEach(([type, scores]) => {
        const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        if (avg < lowestAvg) {
          lowestAvg = avg;
          weakestType = type;
        }
      });
      
      if (weakestType && lowestAvg < 70) {
        recommendations.push(`Focus on ${weakestType} interviews - your average score is ${Math.round(lowestAvg)}%`);
      }
      
      // Add specific recommendations based on weak areas
      if (weakAreas.has('communication')) {
        recommendations.push('Practice articulating thoughts clearly and concisely');
      }
      if (weakAreas.has('confidence')) {
        recommendations.push('Work on confident delivery and assertive language');
      }
      if (weakAreas.has('technical')) {
        recommendations.push('Review technical concepts and practice coding problems');
      }
      if (weakAreas.has('behavioral')) {
        recommendations.push('Practice STAR method for behavioral questions');
      }
      
      // Suggest next session type
      const suggestedSessionType = weakestType || 'behavioral';
      
      return {
        recommendations,
        focusAreas,
        suggestedSessionType,
        performanceSummary: performanceByType
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }
}

export default InterviewService;