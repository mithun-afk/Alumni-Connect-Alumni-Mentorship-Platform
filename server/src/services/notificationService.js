const { Notification } = require('../models');

class NotificationService {
  async create(userId, { type, title, message, relatedId }) {
    return await Notification.create({
      user: userId,
      type,
      title,
      message,
      relatedId
    });
  }

  async getUserNotifications(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return await Notification.find({ user: userId })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
  }

  async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );
  }

  async getUnreadCount(userId) {
    return await Notification.countDocuments({ user: userId, isRead: false });
  }
}

module.exports = new NotificationService();
