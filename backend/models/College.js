const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  website: {
    type: String,
    trim: true
  },
  departments: [{
    type: String,
    trim: true
  }],
  establishedYear: {
    type: Number
  },
  accreditation: {
    type: String,
    trim: true
  },
  ranking: {
    type: Number
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const College = mongoose.model('College', collegeSchema);
module.exports = College; 