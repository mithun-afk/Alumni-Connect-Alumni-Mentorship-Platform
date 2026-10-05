const User = require('../models/User');
const Mentorship = require('../models/Mentorship');
const Session = require('../models/Session');
const Referral = require('../models/Referral');
const Opportunity = require('../models/Opportunity');
const Event = require('../models/Event');

exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    // Shared stats that every role needs (matches frontend DashboardStats interface)
    const [totalAlumni, upcomingEventsCount, openOpportunitiesCount] = await Promise.all([
      User.countDocuments({ role: 'alumni' }),
      Event.countDocuments({ date: { $gte: new Date() } }),
      Opportunity.countDocuments({ status: 'active' })
    ]);

    if (role === 'alumni') {
      // Alumni-specific stats
      const [activeMentorships, completedSessions, referralsProvided, opportunitiesPosted] = await Promise.all([
        Mentorship.countDocuments({ mentor: userId, status: 'active' }),
        Session.countDocuments({ mentor: userId, status: 'completed' }),
        Referral.countDocuments({ alumni: userId }),
        Opportunity.countDocuments({ postedBy: userId })
      ]);

      const impactScore = completedSessions + referralsProvided + opportunitiesPosted;

      // Chart Data: Opportunities posted grouped by status
      const oppsChart = await Opportunity.aggregate([
        { $match: { postedBy: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      return res.json({
        success: true,
        data: {
          totalAlumni,
          activeMentorships,
          upcomingEvents: upcomingEventsCount,
          openOpportunities: openOpportunitiesCount,
          alumniImpactScore: impactScore,
          stats: {
            completedSessions,
            referralsProvided,
            opportunitiesPosted,
            activeMentorships
          },
          chartData: {
            title: 'Opportunities by Status',
            data: oppsChart.map(item => ({ label: item._id, value: item.count }))
          }
        }
      });
    } else if (role === 'student') {
      const [activeMentorships, referralsRequested, opportunitiesApplied] = await Promise.all([
        Mentorship.countDocuments({ student: userId, status: 'active' }),
        Referral.countDocuments({ student: userId }),
        Opportunity.countDocuments({ 'applicants.user': userId })
      ]);

      // Chart Data: Sessions grouped by status
      const sessionsChart = await Session.aggregate([
        { $match: { student: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      return res.json({
        success: true,
        data: {
          totalAlumni,
          activeMentorships,
          upcomingEvents: upcomingEventsCount,
          openOpportunities: openOpportunitiesCount,
          stats: {
            activeMentorships,
            referralsRequested,
            opportunitiesApplied
          },
          chartData: {
            title: 'Sessions by Status',
            data: sessionsChart.map(item => ({ label: item._id, value: item.count }))
          }
        }
      });
    } else if (role === 'admin') {
      const [activeMentorships, totalUsers, totalOpportunities, totalEvents] = await Promise.all([
        Mentorship.countDocuments({ status: 'active' }),
        User.countDocuments(),
        Opportunity.countDocuments(),
        Event.countDocuments()
      ]);

      // Chart Data: Users by Role
      const usersChart = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);

      return res.json({
        success: true,
        data: {
          totalAlumni,
          activeMentorships,
          upcomingEvents: upcomingEventsCount,
          openOpportunities: openOpportunitiesCount,
          stats: {
            totalUsers,
            activeMentorships,
            totalOpportunities,
            totalEvents
          },
          chartData: {
            title: 'Users by Role',
            data: usersChart.map(item => ({ label: item._id, value: item.count }))
          }
        }
      });
    }

    return res.status(403).json({ success: false, message: 'Invalid role for dashboard.' });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching dashboard stats' });
  }
};
