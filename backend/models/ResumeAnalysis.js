import mongoose from 'mongoose';

const resumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative']
  },
  fileType: {
    type: String,
    required: [true, 'File type is required'],
    enum: ['pdf', 'doc', 'docx', 'txt'],
    lowercase: true
  },
  resumeText: {
    type: String,
    required: [true, 'Resume text is required'],
    trim: true
  },
  extractedSkills: [{
    skill: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['technical', 'soft', 'language', 'certification', 'tool'],
      default: 'technical'
    },
    confidence: {
      type: Number,
      min: [0, 'Confidence cannot be negative'],
      max: [1, 'Confidence cannot exceed 1'],
      default: 0.5
    }
  }],
  experience: [{
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true
    },
    duration: {
      startDate: {
        type: String,
        trim: true
      },
      endDate: {
        type: String,
        trim: true
      },
      totalMonths: {
        type: Number,
        min: [0, 'Duration cannot be negative'],
        default: 0
      }
    },
    description: {
      type: String,
      trim: true
    },
    skills: [{
      type: String,
      trim: true
    }],
    achievements: [{
      type: String,
      trim: true
    }]
  }],
  education: [{
    institution: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true
    },
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true
    },
    field: {
      type: String,
      trim: true
    },
    year: {
      type: Number,
      min: [1950, 'Year must be after 1950'],
      max: [new Date().getFullYear() + 10, 'Year cannot be too far in the future']
    },
    grade: {
      type: String,
      trim: true
    }
  }],
  certifications: [{
    name: {
      type: String,
      required: [true, 'Certification name is required'],
      trim: true
    },
    issuer: {
      type: String,
      trim: true
    },
    issueDate: {
      type: String,
      trim: true
    },
    expiryDate: {
      type: String,
      trim: true
    },
    credentialId: {
      type: String,
      trim: true
    }
  }],
  skillGaps: [{
    skill: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true
    },
    importance: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    category: {
      type: String,
      enum: ['technical', 'soft', 'certification', 'tool'],
      default: 'technical'
    },
    reason: {
      type: String,
      trim: true
    }
  }],
  recommendations: [{
    type: {
      type: String,
      enum: ['skill-development', 'certification', 'experience', 'education'],
      required: [true, 'Recommendation type is required']
    },
    title: {
      type: String,
      required: [true, 'Recommendation title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    estimatedTime: {
      type: String,
      trim: true
    }
  }],
  learningPath: [{
    skill: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true
    },
    priority: {
      type: Number,
      min: [1, 'Priority must be at least 1'],
      max: [10, 'Priority cannot exceed 10'],
      default: 5
    },
    estimatedTime: {
      type: String,
      trim: true
    },
    resources: [{
      title: {
        type: String,
        required: [true, 'Resource title is required'],
        trim: true
      },
      type: {
        type: String,
        enum: ['course', 'book', 'tutorial', 'certification', 'project'],
        required: [true, 'Resource type is required']
      },
      url: {
        type: String,
        trim: true
      },
      provider: {
        type: String,
        trim: true
      },
      duration: {
        type: String,
        trim: true
      },
      cost: {
        type: String,
        enum: ['free', 'paid', 'subscription'],
        default: 'free'
      }
    }],
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started'
    }
  }],
  analysisMetrics: {
    overallScore: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100'],
      default: 0
    },
    skillsScore: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100'],
      default: 0
    },
    experienceScore: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100'],
      default: 0
    },
    educationScore: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100'],
      default: 0
    },
    completenessScore: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100'],
      default: 0
    }
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  analyzedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance optimization
resumeAnalysisSchema.index({ userId: 1, analyzedAt: -1 });
resumeAnalysisSchema.index({ processingStatus: 1 });
resumeAnalysisSchema.index({ 'extractedSkills.skill': 'text' });
resumeAnalysisSchema.index({ 'analysisMetrics.overallScore': -1 });

// Instance method to calculate overall score
resumeAnalysisSchema.methods.calculateOverallScore = function() {
  const { skillsScore, experienceScore, educationScore, completenessScore } = this.analysisMetrics;
  this.analysisMetrics.overallScore = Math.round(
    (skillsScore * 0.4 + experienceScore * 0.3 + educationScore * 0.2 + completenessScore * 0.1)
  );
  return this.analysisMetrics.overallScore;
};

// Instance method to get skill categories summary
resumeAnalysisSchema.methods.getSkillsSummary = function() {
  const summary = {};
  this.extractedSkills.forEach(skill => {
    if (!summary[skill.category]) {
      summary[skill.category] = [];
    }
    summary[skill.category].push(skill.skill);
  });
  return summary;
};

// Instance method to get high priority learning items
resumeAnalysisSchema.methods.getHighPriorityLearning = function() {
  return this.learningPath
    .filter(item => item.priority >= 7)
    .sort((a, b) => b.priority - a.priority);
};

// Instance method to update learning path progress
resumeAnalysisSchema.methods.updateLearningProgress = function(skill, status) {
  const learningItem = this.learningPath.find(item => item.skill === skill);
  if (learningItem) {
    learningItem.status = status;
    return this.save();
  }
  throw new Error('Learning item not found');
};

// Static method to get user's latest analysis
resumeAnalysisSchema.statics.getLatestAnalysis = function(userId) {
  return this.findOne({ userId, processingStatus: 'completed' })
    .sort({ analyzedAt: -1 })
    .populate('userId', 'name email profile');
};

// Static method to get skill gap statistics
resumeAnalysisSchema.statics.getSkillGapStats = function() {
  return this.aggregate([
    { $match: { processingStatus: 'completed' } },
    { $unwind: '$skillGaps' },
    {
      $group: {
        _id: '$skillGaps.skill',
        count: { $sum: 1 },
        avgImportance: { $avg: { $cond: [
          { $eq: ['$skillGaps.importance', 'critical'] }, 4,
          { $cond: [
            { $eq: ['$skillGaps.importance', 'high'] }, 3,
            { $cond: [
              { $eq: ['$skillGaps.importance', 'medium'] }, 2, 1
            ]}
          ]}
        ]}}
      }
    },
    { $sort: { count: -1, avgImportance: -1 } }
  ]);
};

// Pre-save middleware to update analysis timestamp
resumeAnalysisSchema.pre('save', function(next) {
  if (this.isModified('processingStatus') && this.processingStatus === 'completed') {
    this.analyzedAt = new Date();
    this.calculateOverallScore();
  }
  next();
});

const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

export default ResumeAnalysis;