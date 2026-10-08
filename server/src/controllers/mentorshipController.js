const MentorshipRequest = require('../models/MentorshipRequest');
const Mentorship = require('../models/Mentorship');
const Profile = require('../models/Profile');
const User = require('../models/User');
const Notification = require('../models/Notification');
const matchService = require('../services/matchService');
const AppError = require('../utils/AppError');

exports.requestMentor = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { mentorId, message } = req.body;
    if (studentId.toString() === mentorId) return next(new AppError('Cannot request mentorship from yourself', 400));
    const existingReq = await MentorshipRequest.findOne({ student: studentId, mentor: mentorId, status: { $in: ['pending', 'accepted'] } });
    if (existingReq) return next(new AppError('Mentorship request already exists or is active', 400));
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'alumni') return next(new AppError('Mentor not found', 404));
    const studentProfile = await Profile.findOne({ user: studentId });
    const mentorProfile = await Profile.findOne({ user: mentorId });
    let matchScore = 0, matchBreakdown = {};
    if (studentProfile && mentorProfile) {
      const match = matchService.calculateMatch(studentProfile, mentorProfile);
      matchScore = match.totalScore;
      matchBreakdown = match.breakdown;
    }
    const newRequest = await MentorshipRequest.create({ student: studentId, mentor: mentorId, message, matchScore, matchBreakdown, status: 'pending' });
    await Notification.create({ user: mentorId, type: 'MENTORSHIP_REQUEST', title: 'New Mentorship Request', message: `${req.user.firstName} ${req.user.lastName} wants you as their mentor.`, relatedId: newRequest._id });
    res.status(201).json({ success: true, data: newRequest });
  } catch (error) { next(error); }
};

exports.getRequests = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    const query = role === 'alumni' ? { mentor: userId } : { student: userId };
    const requests = await MentorshipRequest.find(query)
      .populate('student', 'firstName lastName email department batch')
      .populate('mentor', 'firstName lastName email department batch')
      .sort('-createdAt');
    const data = requests.map(r => ({ ...r.toObject(), type: role === 'alumni' ? 'received' : 'sent' }));
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) { next(error); }
};

exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const request = await MentorshipRequest.findById(req.params.id);
    if (!request) return next(new AppError('Request not found', 404));
    if (request.mentor.toString() !== req.user._id.toString()) return next(new AppError('Not authorized', 403));
    if (!['accepted', 'declined'].includes(status)) return next(new AppError('Invalid status', 400));
    request.status = status;
    await request.save();
    let mentorship = null;
    if (status === 'accepted') {
      mentorship = await Mentorship.create({ student: request.student, mentor: request.mentor, request: request._id, status: 'active', goals: [], milestones: [] });
      await Notification.create({ user: request.student, type: 'MENTORSHIP_ACCEPTED', title: 'Mentorship Request Accepted', message: 'Your mentorship request has been accepted! You can now book sessions.', relatedId: mentorship._id });
    } else {
      await Notification.create({ user: request.student, type: 'MENTORSHIP_DECLINED', title: 'Mentorship Request Declined', message: 'Your mentorship request was declined.', relatedId: request._id });
    }
    res.status(200).json({ success: true, data: { request, mentorship } });
  } catch (error) { next(error); }
};

exports.getMyMentorships = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const mentorships = await Mentorship.find({ $or: [{ student: userId }, { mentor: userId }] })
      .populate('student', 'firstName lastName email department batch')
      .populate('mentor', 'firstName lastName email department batch')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: mentorships.length, data: mentorships });
  } catch (error) { next(error); }
};

exports.getMentorshipDetails = async (req, res, next) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id)
      .populate('student', 'firstName lastName email')
      .populate('mentor', 'firstName lastName email');
    if (!mentorship) return next(new AppError('Mentorship not found', 404));
    if (mentorship.student._id.toString() !== req.user._id.toString() && mentorship.mentor._id.toString() !== req.user._id.toString()) return next(new AppError('Not authorized', 403));
    res.status(200).json({ success: true, data: mentorship });
  } catch (error) { next(error); }
};

exports.getMilestones = async (req, res, next) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) return next(new AppError('Mentorship not found', 404));
    res.status(200).json({ success: true, data: mentorship.milestones });
  } catch (error) { next(error); }
};

exports.updateGoals = async (req, res, next) => {
  try {
    const { goals } = req.body;
    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) return next(new AppError('Mentorship not found', 404));
    if (mentorship.student.toString() !== req.user._id.toString() && mentorship.mentor.toString() !== req.user._id.toString()) return next(new AppError('Not authorized', 403));
    mentorship.goals = goals;
    await mentorship.save();
    res.status(200).json({ success: true, data: mentorship });
  } catch (error) { next(error); }
};

exports.updateMilestones = async (req, res, next) => {
  try {
    const { title, description, isCompleted } = req.body;
    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) return next(new AppError('Mentorship not found', 404));
    if (mentorship.student.toString() !== req.user._id.toString() && mentorship.mentor.toString() !== req.user._id.toString()) return next(new AppError('Not authorized', 403));
    mentorship.milestones.push({ title, description, isCompleted: isCompleted || false });
    await mentorship.save();
    res.status(200).json({ success: true, data: mentorship });
  } catch (error) { next(error); }
};
