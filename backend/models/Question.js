import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'academic',
      'campus-life',
      'admissions',
      'careers',
      'general',
      'exams-results',
      'scholarship',
      'fresher-queries',
      'alumni-network',
      'academic-projects'
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  answers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  }],
  views: {
    type: Number,
    default: 0
  },
  isResolved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
questionSchema.index({ college: 1, category: 1 });
questionSchema.index({ author: 1 });
questionSchema.index({ title: 'text', content: 'text' });

const Question = mongoose.model('Question', questionSchema);
export default Question; 