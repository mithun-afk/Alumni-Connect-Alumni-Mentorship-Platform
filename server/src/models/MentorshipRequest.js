const mongoose = require('mongoose');

const mentorshipRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  matchScore: Number,
  matchBreakdown: {
    skills: Number,
    domain: Number,
    goals: Number,
    experience: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MentorshipRequest', mentorshipRequestSchema);
