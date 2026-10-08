const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
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
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentorshipRequest',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  goals: [String],
  milestones: [{
    title: String,
    description: String,
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  startDate: Date,
  endDate: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Mentorship', mentorshipSchema);
