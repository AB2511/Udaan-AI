import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    profile: {
      careerGoal: {
        type: String,
        enum: [
          'frontend-developer',
          'backend-developer', 
          'fullstack-developer',
          'ml-engineer',
          'data-scientist',
          'devops-engineer',
          'mobile-developer',
          'ui-ux-designer',
          ''
        ],
        default: ''
      },
      experience: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', ''],
        default: ''
      },
      interests: [{
        type: String,
        enum: [
          'web-development',
          'mobile-development',
          'machine-learning',
          'data-science',
          'cloud-computing',
          'cybersecurity',
          'blockchain',
          'game-development',
          'ui-ux-design',
          'devops',
          'artificial-intelligence',
          'database-management'
        ]
      }]
    },
    resumeText: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// Hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to get user without sensitive data
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;
