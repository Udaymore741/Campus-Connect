const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create a compound index to ensure a user can only enroll once in a college
enrollmentSchema.index({ user: 1, college: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment; 