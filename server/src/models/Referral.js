const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
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
  profileSnapshot: {
    type: Object,
    required: true
  },
  status: {
    type: String,
    enum: ['Requested', 'Reviewed', 'Referred', 'Outcome'],
    default: 'Requested'
  },
  outcomeDetails: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Referral', referralSchema);
