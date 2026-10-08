const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    required: true
  },
  headline: String,
  bio: String,
  currentCompany: String,
  currentRole: String,
  location: String,
  skills: [String],
  domains: [String],
  experience: Number, // in years
  linkedinUrl: String,
  githubUrl: String,
  portfolioUrl: String,
  phone: String,
  profileVisibility: {
    type: String,
    enum: ['public', 'students-only', 'private'],
    default: 'public'
  },
  careerGoals: [String],
  interests: [String],
  achievements: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);
