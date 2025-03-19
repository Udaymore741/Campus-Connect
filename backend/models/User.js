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
    required: true,
    enum: ['student', 'faculty', 'visitor', 'admin']
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    required: function() { return this.role === 'student'; }
  },
  currentYear: {
    type: Number,
    required: function() { return this.role === 'student'; }
  },
  passoutYear: {
    type: Number,
    required: function() { return this.role === 'student'; }
  },
  position: {
    type: String,
    required: function() { return this.role === 'faculty'; }
  },
  grade: {
    type: String,
    required: function() { return this.role === 'visitor'; }
  },
  enrolledColleges: [{
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

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
