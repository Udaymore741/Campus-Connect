const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'student', 'faculty', 'visitor'],
    required: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  // Common fields for all roles
  dateOfBirth: {
    type: Date
  },
  bloodGroup: {
    type: String,
    trim: true
  },
  socialLinks: {
    github: {
      type: String,
      trim: true,
      default: ''
    },
    linkedin: {
      type: String,
      trim: true,
      default: ''
    },
    twitter: {
      type: String,
      trim: true,
      default: ''
    }
  },
  // Student specific fields
  department: {
    type: String,
    trim: true
  },
  degree: {
    type: String,
    trim: true
  },
  year: {
    type: String,
    trim: true
  },
  passoutYear: {
    type: String,
    trim: true
  },
  rollNumber: {
    type: String,
    trim: true
  },
  cgpa: {
    type: Number
  },
  // Faculty specific fields
  position: {
    type: String,
    trim: true
  },
  qualification: {
    type: String,
    trim: true
  },
  specialization: {
    type: String,
    trim: true
  },
  experience: {
    type: Number
  },
  // Visitor specific fields
  grade: {
    type: String,
    trim: true
  },
  // Admin specific fields
  adminRole: {
    type: String,
    trim: true
  },
  permissions: [{
    type: String,
    trim: true
  }],
  skills: {
    type: [String],
    default: []
  },
  achievements: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  // Common fields for all roles
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
