const { User, Profile, Opportunity, Event } = require('../models');
const notificationService = require('./notificationService');
const auditLogService = require('./auditLogService');
const AppError = require('../utils/AppError');

class AdminService {
  async getPendingAlumni() {
    return await User.find({ role: 'alumni', alumniStatus: 'pending' }).sort('-createdAt');
  }

  async getAllUsers(filters = {}) {
    const query = {};
    if (filters.role) query.role = filters.role;
    if (filters.status) query.alumniStatus = filters.status;
    
    return await User.find(query).sort('-createdAt');
  }

  async updateAlumniStatus(alumniId, status, reason, adminId, ipAddress) {
    const user = await User.findById(alumniId);
    if (!user || user.role !== 'alumni') {
      throw new AppError('Alumni not found', 404);
    }

    user.alumniStatus = status;
    await user.save();

    await auditLogService.create({
      performedBy: adminId,
      action: 'UPDATE_ALUMNI_STATUS',
      targetType: 'User',
      targetId: alumniId,
      details: { status, reason },
      ipAddress
    });

    let title, message;
    if (status === 'verified') {
      title = 'Account Verified';
      message = 'Your alumni account has been verified successfully!';
    } else {
      title = `Account ${status.charAt(0).toUpperCase() + status.slice(1)}`;
      message = `Your alumni account has been ${status}. Reason: ${reason}`;
    }

    await notificationService.create(alumniId, {
      type: 'ACCOUNT_STATUS',
      title,
      message,
      relatedId: adminId
    });

    return user;
  }

  async getDashboardStats() {
    const stats = {};
    
    stats.totalUsers = await User.countDocuments();
    stats.totalStudents = await User.countDocuments({ role: 'student' });
    stats.totalAlumni = await User.countDocuments({ role: 'alumni' });
    stats.pendingAlumni = await User.countDocuments({ role: 'alumni', alumniStatus: 'pending' });
    stats.totalOpportunities = await Opportunity.countDocuments();
    stats.totalEvents = await Event.countDocuments();
    
    return stats;
  }
}

module.exports = new AdminService();
