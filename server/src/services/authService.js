const jwt = require('jsonwebtoken');
const { User, Profile, Notification } = require('../models');
const config = require('../config');
const AppError = require('../utils/AppError');

class AuthService {
  generateToken(userId) {
    return jwt.sign({ id: userId }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });
  }

  async register(userData) {
    // Check if user exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    // Set alumni specific fields
    if (userData.role === 'alumni') {
      userData.alumniStatus = 'pending';
    } else {
      userData.alumniStatus = undefined;
    }

    const user = await User.create(userData);
    
    // Create empty profile
    await Profile.create({ user: user._id });

    // Notify admins if new alumni
    if (user.role === 'alumni') {
      const admins = await User.find({ role: 'admin' });
      const notifications = admins.map(admin => ({
        user: admin._id,
        type: 'ALUMNI_REGISTRATION',
        title: 'New Alumni Registration',
        message: `${user.firstName} ${user.lastName} registered as alumni and is pending verification.`,
        relatedId: user._id
      }));
      if (notifications.length) {
        await Notification.insertMany(notifications);
      }
    }

    const token = this.generateToken(user._id);
    user.password = undefined; // Do not return password

    return { user, token };
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Incorrect email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated', 401);
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = this.generateToken(user._id);
    user.password = undefined;

    return { user, token };
  }
}

module.exports = new AuthService();
