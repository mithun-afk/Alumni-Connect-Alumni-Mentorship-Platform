const mongoose = require('mongoose');

const referralRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity'
  },
  company: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  profileSnapshot: {
    headline: String,
    skills: [String],
    experience: Number,
    currentRole: String,
    linkedinUrl: String
  },
  status: {
    type: String,
    enum: ['requested', 'reviewed', 'referred', 'outcome_pending', 'interview', 'selected', 'rejected', 'withdrawn'],
    default: 'requested'
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('ReferralRequest', referralRequestSchema);
