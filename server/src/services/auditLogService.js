const { AuditLog } = require('../models');

class AuditLogService {
  async create({ performedBy, action, targetType, targetId, details, ipAddress }) {
    return await AuditLog.create({
      performedBy,
      action,
      targetType,
      targetId,
      details,
      ipAddress
    });
  }

  async getLogs(filters = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return await AuditLog.find(filters)
      .populate('performedBy', 'firstName lastName email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
  }
}

module.exports = new AuditLogService();
