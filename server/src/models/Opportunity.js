const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['job', 'internship', 'project', 'research'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: [String],
  location: String,
  isRemote: {
    type: Boolean,
    default: false
  },
  applicationDeadline: Date,
  applicationLink: String,
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  applicants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'rejected'],
      default: 'applied'
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Opportunity', opportunitySchema);
