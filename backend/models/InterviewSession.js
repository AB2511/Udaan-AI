import mongoose from 'mongoose';
import { ENUMS } from '../constants/enums.js';

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  sessionType: {
    type: String,
    required: [true, 'Session type is required'],
    enum: {
      values: ENUMS.INTERVIEW.SESSION_TYPES,
      message: `Session type must be one of: ${ENUMS.INTERVIEW.SESSION_TYPES.join(', ')}`
    },
    index: true
  },
  title: {
    type: String,
    required: [true, 'Session title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  difficulty: {
    type: String,
    enum: {
      values: ENUMS.INTERVIEW.DIFFICULTIES,
      message: `Difficulty must be one of: ${ENUMS.INTERVIEW.DIFFICULTIES.join(', ')}`
    },
    default: 'medium'
  },
  targetRole: {
    type: String,
    trim: true,
    maxlength: [100, 'Target role cannot exceed 100 characters']
  },
  questions: [{
    questionId: {
      type: String,
      required: [true, 'Question ID is required']
    },
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    category: {
      type: String,
      enum: {
        values: ENUMS.INTERVIEW.CATEGORIES,
        message: `Question category must be one of: ${ENUMS.INTERVIEW.CATEGORIES.join(', ')}`
      },
      required: [true, 'Question category is required']
    },
    expectedAnswer: {
      type: String,
      trim: true
    },
    keyPoints: [{
      type: String,
      trim: true
    }],
    userAnswer: {
      text: {
        type: String,
        trim: true
      },
      audioUrl: {
        type: String,
        trim: true
      },
      duration: {
        type: Number, // in seconds
        min: [0, 'Duration cannot be negative'],
        default: 0
      }
    },
    feedback: {
      content: {
        type: String,
        trim: true
      },
      strengths: [{
        type: String,
        trim: true
      }],
      improvements: [{
        type: String,
        trim: true
      }],
      score: {
        type: Number,
        min: [0, 'Score cannot be negative'],
        max: [10, 'Score cannot exceed 10'],
        default: 0
      }
    },
    timeSpent: {
      type: Number, // in seconds
      min: [0, 'Time spent cannot be negative'],
      default: 0
    },
    isAnswered: {
      type: Boolean,
      default: false
    }
  }],
  overallScore: {
    type: Number,
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100'],
    default: 0
  },
  feedback: {
    communication: {
      score: {
        type: Number,
        min: [0, 'Score cannot be negative'],
        max: [10, 'Score cannot exceed 10'],
        default: 0
      },
      feedback: {
        type: String,
        trim: true
      }
    },
    technicalAccuracy: {
      score: {
        type: Number,
        min: [0, 'Score cannot be negative'],
        max: [10, 'Score cannot exceed 10'],
        default: 0
      },
      feedback: {
        type: String,
        trim: true
      }
    },
    confidence: {
      score: {
        type: Number,
        min: [0, 'Score cannot be negative'],
        max: [10, 'Score cannot exceed 10'],
        default: 0
      },
      feedback: {
        type: String,
        trim: true
      }
    },
    problemSolving: {
      score: {
        type: Number,
        min: [0, 'Score cannot be negative'],
        max: [10, 'Score cannot exceed 10'],
        default: 0
      },
      feedback: {
        type: String,
        trim: true
      }
    },
    overall: {
      type: String,
      trim: true
    },
    improvementAreas: [{
      area: {
        type: String,
        required: [true, 'Improvement area is required'],
        trim: true
      },
      suggestion: {
        type: String,
        trim: true
      },
      priority: {
        type: String,
        enum: {
          values: ENUMS.INTERVIEW.IMPROVEMENT_PRIORITIES,
          message: `Priority must be one of: ${ENUMS.INTERVIEW.IMPROVEMENT_PRIORITIES.join(', ')}`
        },
        default: 'medium'
      }
    }],
    strengths: [{
      type: String,
      trim: true
    }],
    nextSteps: [{
      type: String,
      trim: true
    }]
  },
  status: {
    type: String,
    enum: {
      values: ENUMS.INTERVIEW.STATUSES,
      message: `Status must be one of: ${ENUMS.INTERVIEW.STATUSES.join(', ')}`
    },
    default: 'not-started',
    index: true
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  duration: {
    type: Number, // total duration in seconds
    min: [0, 'Duration cannot be negative'],
    default: 0
  },
  settings: {
    timeLimit: {
      type: Number, // in minutes
      min: [1, 'Time limit must be at least 1 minute'],
      default: 60
    },
    allowAudioRecording: {
      type: Boolean,
      default: true
    },
    showHints: {
      type: Boolean,
      default: false
    },
    randomizeQuestions: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes for performance optimization
interviewSessionSchema.index({ userId: 1, createdAt: -1 });
interviewSessionSchema.index({ sessionType: 1, difficulty: 1 });
interviewSessionSchema.index({ status: 1, completedAt: -1 });
interviewSessionSchema.index({ overallScore: -1 });
interviewSessionSchema.index({ targetRole: 1 });

// Instance method to calculate overall score
interviewSessionSchema.methods.calculateOverallScore = function() {
  if (this.questions.length === 0) return 0;
  
  const totalScore = this.questions.reduce((sum, question) => {
    return sum + (question.feedback.score || 0);
  }, 0);
  
  const maxPossibleScore = this.questions.length * 10;
  this.overallScore = Math.round((totalScore / maxPossibleScore) * 100);
  return this.overallScore;
};

// Instance method to start interview session
interviewSessionSchema.methods.startSession = function() {
  this.status = 'in-progress';
  this.startedAt = new Date();
  return this.save();
};

// Instance method to complete interview session
interviewSessionSchema.methods.completeSession = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  if (this.startedAt) {
    this.duration = Math.floor((this.completedAt - this.startedAt) / 1000);
  }
  this.calculateOverallScore();
  return this.save();
};

// Instance method to submit answer for a question
interviewSessionSchema.methods.submitAnswer = function(questionId, answer, timeSpent = 0) {
  const question = this.questions.id(questionId);
  if (!question) {
    throw new Error('Question not found');
  }
  
  question.userAnswer = answer;
  question.timeSpent = timeSpent;
  question.isAnswered = true;
  
  return this.save();
};

// Instance method to get next unanswered question
interviewSessionSchema.methods.getNextQuestion = function() {
  return this.questions.find(q => !q.isAnswered);
};

// Instance method to get session progress
interviewSessionSchema.methods.getProgress = function() {
  const totalQuestions = this.questions.length;
  const answeredQuestions = this.questions.filter(q => q.isAnswered).length;
  
  return {
    totalQuestions,
    answeredQuestions,
    percentage: totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0
  };
};

// Static method to get user's interview history
interviewSessionSchema.statics.getUserHistory = function(userId, sessionType = null) {
  const query = { userId };
  if (sessionType) query.sessionType = sessionType;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('userId', 'name email profile');
};

// Static method to get user's interview statistics
interviewSessionSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'completed' } },
    {
      $group: {
        _id: '$sessionType',
        averageScore: { $avg: '$overallScore' },
        totalSessions: { $sum: 1 },
        bestScore: { $max: '$overallScore' },
        totalDuration: { $sum: '$duration' },
        avgCommunication: { $avg: '$feedback.communication.score' },
        avgTechnical: { $avg: '$feedback.technicalAccuracy.score' },
        avgConfidence: { $avg: '$feedback.confidence.score' }
      }
    }
  ]);
};

// Static method to get improvement trends
interviewSessionSchema.statics.getImprovementTrends = function(userId, limit = 10) {
  return this.find({ 
    userId: new mongoose.Types.ObjectId(userId), 
    status: 'completed' 
  })
    .sort({ completedAt: 1 })
    .limit(limit)
    .select('sessionType overallScore feedback.communication.score feedback.technicalAccuracy.score feedback.confidence.score completedAt');
};

// Pre-save middleware
interviewSessionSchema.pre('save', function(next) {
  // Update completion status if all questions are answered
  if (this.questions.length > 0 && this.questions.every(q => q.isAnswered) && this.status === 'in-progress') {
    this.completeSession();
  }
  next();
});

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

export default InterviewSession;