const User = require('../models/User');
const Profile = require('../models/Profile');

exports.getStudents = async (req, res, next) => {
  try {
    const { department, batch } = req.query;

    const userFilter = { role: 'student' };
    if (department) userFilter.department = department;
    if (batch) userFilter.batch = batch;

    const students = await User.find(userFilter).select('_id firstName lastName email department batch');
    const studentIds = students.map(u => u._id);

    const profileQuery = { user: { $in: studentIds } };
    let profiles = await Profile.find(profileQuery).populate('user', 'firstName lastName email department batch');

    const data = profiles.map(profile => {
      const raw = profile.toObject ? profile.toObject() : profile;
      const user = raw.user || {};
      return {
        ...raw,
        id: raw._id ? raw._id.toString() : undefined,
        userId: user._id ? user._id.toString() : undefined,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        department: user.department || '',
        batch: user.batch || '',
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
