const User = require('../models/User');
const Profile = require('../models/Profile');
const matchService = require('../services/matchService');

exports.getMentors = async (req, res, next) => {
  try {
    const { department, domain, batch, company } = req.query;

    // department and batch live on User, not Profile — filter User first
    const userFilter = { role: 'alumni' };
    if (department) userFilter.department = department;
    if (batch) userFilter.batch = batch;

    const alumniUsers = await User.find(userFilter).select('_id firstName lastName email department batch');
    const alumniUserIds = alumniUsers.map(u => u._id);

    // Build profile query — Profile fields: domains[], currentCompany
    const profileQuery = { user: { $in: alumniUserIds } };
    if (domain) profileQuery.domains = domain;                           // domains is an array field
    if (company) profileQuery.currentCompany = new RegExp(company, 'i'); // currentCompany is the correct field

    let mentors = await Profile.find(profileQuery)
      .populate('user', 'firstName lastName email department batch');

    // Build a lookup map so we can access user data quickly
    const userMap = {};
    alumniUsers.forEach(u => { userMap[u._id.toString()] = u; });

    // If student is logged in, calculate match score
    if (req.user && req.user.role === 'student') {
      const studentProfile = await Profile.findOne({ user: req.user.id });
      if (studentProfile) {
        mentors = mentors.map(mentor => {
          const match = matchService.calculateMatch(studentProfile, mentor);
          return {
            ...mentor.toObject(),
            matchScore: match.totalScore,
            matchBreakdown: match.breakdown
          };
        });

        // Sort by match score DESC
        mentors.sort((a, b) => b.matchScore - a.matchScore);
      }
    }

    // Normalize response shape so frontend always gets consistent fields
    const data = mentors.map(mentor => {
      const raw = mentor.toObject ? mentor.toObject() : mentor;
      const user = raw.user || {};
      return {
        ...raw,
        id: raw._id ? raw._id.toString() : undefined,          // profile _id
        userId: user._id ? user._id.toString() : undefined,    // user _id — needed for mentorship requests
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        department: user.department || '',
        batch: user.batch || '',
        company: raw.currentCompany || '',
        jobTitle: raw.currentRole || '',
        bio: raw.bio || ''
      };
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};
