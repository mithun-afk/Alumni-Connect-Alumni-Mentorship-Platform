const { Profile } = require('../models');
const AppError = require('../utils/AppError');

class ProfileService {
  async getProfile(userId) {
    const profile = await Profile.findOne({ user: userId }).populate('user', '-password');
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }
    return profile;
  }

  async updateProfile(userId, data) {
    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      data,
      { new: true, runValidators: true }
    ).populate('user', '-password');

    if (!profile) {
      throw new AppError('Profile not found', 404);
    }
    return profile;
  }

  async getPublicProfile(profileUserId, requestingUser) {
    const profile = await Profile.findOne({ user: profileUserId }).populate('user', '-password');
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    if (profile.profileVisibility === 'private' && profileUserId.toString() !== requestingUser._id.toString()) {
      throw new AppError('This profile is private', 403);
    }

    if (profile.profileVisibility === 'students-only' && requestingUser.role !== 'student' && requestingUser.role !== 'admin' && profileUserId.toString() !== requestingUser._id.toString()) {
      throw new AppError('This profile is only visible to students', 403);
    }

    return profile;
  }
}

module.exports = new ProfileService();
