const adminService = require('../services/adminService');
const auditLogService = require('../services/auditLogService');
const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

exports.getPendingAlumni = async (req, res, next) => {
  try {
    const alumni = await adminService.getPendingAlumni();
    res.status(200).json({
      success: true,
      results: alumni.length,
      data: { alumni }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers(req.query);
    res.status(200).json({
      success: true,
      results: users.length,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAlumniStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }

    const { status, reason } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    const user = await adminService.updateAlumniStatus(
      req.params.id,
      status,
      reason,
      req.user.id,
      ip
    );

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const filters = {};
    if (req.query.action) filters.action = req.query.action;
    if (req.query.targetType) filters.targetType = req.query.targetType;

    const logs = await auditLogService.getLogs(filters, page, limit);
    res.status(200).json({
      success: true,
      results: logs.length,
      data: { logs }
    });
  } catch (error) {
    next(error);
  }
};

const Mentorship = require('../models/Mentorship');
const Opportunity = require('../models/Opportunity');
const Event = require('../models/Event');

exports.getModerationList = async (req, res, next) => {
  try {
    const { type } = req.query; // 'mentorship', 'opportunity', 'event'
    let data = {};

    if (!type || type === 'mentorship') {
      data.mentorships = await Mentorship.find().populate('student mentor', 'firstName lastName email').lean();
    }
    if (!type || type === 'opportunity') {
      data.opportunities = await Opportunity.find().populate('postedBy', 'firstName lastName email').lean();
    }
    if (!type || type === 'event') {
      data.events = await Event.find().populate('createdBy', 'firstName lastName email').lean();
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

exports.moderateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, status } = req.body; // type: 'mentorship', 'opportunity', 'event'

    if (!['mentorship', 'opportunity', 'event'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid type provided' });
    }

    let Model;
    if (type === 'mentorship') Model = Mentorship;
    if (type === 'opportunity') Model = Opportunity;
    if (type === 'event') Model = Event;

    // Use findByIdAndUpdate with runValidators: false to bypass enum restrictions for 'suspended', 'rejected', 'closed'
    const updatedItem = await Model.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: false }
    );

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.status(200).json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    next(error);
  }
};
