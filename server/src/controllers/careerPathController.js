const Profile = require('../models/Profile');

exports.getCareerPaths = async (req, res) => {
  try {
    const { department, batch, domain, company } = req.query;

    const userMatch = { role: 'alumni' };
    if (department) userMatch.department = department;
    if (batch) userMatch.batch = batch;

    const profileQuery = {};
    if (domain) profileQuery.domains = domain;
    if (company) profileQuery.currentCompany = new RegExp(company, 'i');

    const profiles = await Profile.find(profileQuery).populate({
      path: 'user',
      match: userMatch,
      select: 'firstName lastName department batch role'
    }).lean();

    // Filter out profiles where user is null (due to match condition failing)
    const validProfiles = profiles.filter(p => p.user !== null);

    // Grouping for career progression data (Department-wise)
    const progressionData = {};
    validProfiles.forEach(p => {
      const dept = p.user.department || 'Unknown';
      if (!progressionData[dept]) {
        progressionData[dept] = {
          department: dept,
          alumniCount: 0,
          companies: {},
          roles: {},
          domains: {}
        };
      }
      
      const deptData = progressionData[dept];
      deptData.alumniCount += 1;
      
      if (p.currentCompany) {
        deptData.companies[p.currentCompany] = (deptData.companies[p.currentCompany] || 0) + 1;
      }
      if (p.currentRole) {
        deptData.roles[p.currentRole] = (deptData.roles[p.currentRole] || 0) + 1;
      }
      if (p.domains && p.domains.length) {
        p.domains.forEach(d => {
          deptData.domains[d] = (deptData.domains[d] || 0) + 1;
        });
      }
    });

    return res.json({
      success: true,
      data: {
        totalProfiles: validProfiles.length,
        departmentWiseData: Object.values(progressionData),
        profiles: validProfiles.map(p => ({
          id: p._id,
          name: `${p.user.firstName} ${p.user.lastName}`,
          department: p.user.department,
          batch: p.user.batch,
          company: p.currentCompany,
          role: p.currentRole,
          domains: p.domains,
          experience: p.experience
        }))
      }
    });

  } catch (error) {
    console.error('Career Path Explorer Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching career paths' });
  }
};
