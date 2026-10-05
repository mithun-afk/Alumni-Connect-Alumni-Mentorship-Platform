const MentorshipRequest = require('../models/MentorshipRequest');
const Mentorship = require('../models/Mentorship');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');
const matchService = require('../services/matchService');
const AppError = require('../utils/appError');

exports.requestMentor = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { mentorId, message } = req.body;

    if (studentId === mentorId) {
      return next(new AppError('Cannot request mentorship from yourself', 400));
    }

    const existingReq = await MentorshipRequest.findOne({
      student: studentId,
      mentor: mentorId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingReq) {
      return next(new AppError('Mentorship request already exists', 400));
    }

    const studentProfile = await Profile.findOne({ user: studentId });
    const mentorProfile = await Profile.findOne({ user: mentorId });

    if (!mentorProfile) {
      return next(new AppError('Mentor not found', 404));
    }

    let matchScore = 0;
    let matchBreakdown = {};

    if (studentProfile) {
      const match = matchService.calculateMatch(studentProfile, mentorProfile);
      matchScore = match.totalScore;
      matchBreakdown = match.breakdown;
    }

    const newRequest = await MentorshipRequest.create({
      student: studentId,
      mentor: mentorId,
      message,
      matchScore,
      matchBreakdown,
      status: 'pending'
    });

    await Notification.create({
      user: mentorId,
      type: 'MENTORSHIP_REQUEST',
      title: 'New Mentorship Request',
      message: `You have a new mentorship request.`,
      relatedId: newRequest._id
    });

    res.status(201).json({
      success: true,
      data: newRequest
    });
  } catch (error) {
    next(error);
  }
};

exports.getRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const requests = await MentorshipRequest.find({
      $or: [{ student: userId }, { mentor: userId }]
    })
      .populate('student', 'firstName lastName email')
      .populate('mentor', 'firstName lastName email')
      .sort('-createdAt');

    const mapped = requests.map(r => ({
      ...r.toObject(),
      mentorId: r.mentor._id.toString(),
      mentorName: `${r.mentor.firstName} ${r.mentor.lastName}`,
      studentId: r.student._id.toString(),
      studentName: `${r.student.firstName} ${r.student.lastName}`
    }));

    res.status(200).json({
      success: true,
      count: mapped.length,
      data: mapped
    });
  } catch (error) {
    next(error);
  }
};

exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const requestId = req.params.id;

    if (!['accepted', 'declined'].includes(status)) {
      return next(new AppError('Invalid status update', 400));
    }

    const request = await MentorshipRequest.findById(requestId);
    if (!request) {
      return next(new AppError('Request not found', 404));
    }

    if (request.mentor.toString() !== req.user.id) {
      return next(new AppError('Not authorized to update this request', 403));
    }

    request.status = status;
    await request.save();

    let mentorship = null;

    if (status === 'accepted') {
      mentorship = await Mentorship.create({
        student: request.student,
        mentor: request.mentor,
        request: request._id,
        status: 'active',
        startDate: new Date(),
        goals: [],
        milestones: []
      });

      await Notification.create({
        user: request.student,
        type: 'MENTORSHIP_ACCEPTED',
        title: 'Mentorship Request Accepted',
        message: `Your mentorship request has been accepted.`,
        relatedId: mentorship._id
      });
    } else {
      await Notification.create({
        user: request.student,
        type: 'MENTORSHIP_DECLINED',
        title: 'Mentorship Request Declined',
        message: `Your mentorship request was declined.`,
        relatedId: request._id
      });
    }

    res.status(200).json({
      success: true,
      data: {
        request,
        mentorship
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyMentorships = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const query = { $or: [{ student: userId }, { mentor: userId }] };

    const mentorships = await Mentorship.find(query)
      .populate('student', 'firstName lastName email')
      .populate('mentor', 'firstName lastName email')
      .sort('-createdAt');

    const mapped = mentorships.map(m => ({
      ...m.toObject(),
      mentorId: m.mentor._id.toString(),
      mentorName: `${m.mentor.firstName} ${m.mentor.lastName}`,
      studentId: m.student._id.toString(),
      studentName: `${m.student.firstName} ${m.student.lastName}`
    }));

    res.status(200).json({
      success: true,
      count: mapped.length,
      data: mapped
    });
  } catch (error) {
    next(error);
  }
};

exports.getMentorshipDetails = async (req, res, next) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id)
      .populate('student', 'firstName lastName email')
      .populate('mentor', 'firstName lastName email');

    if (!mentorship) {
      return next(new AppError('Mentorship not found', 404));
    }

    if (mentorship.student._id.toString() !== req.user.id && mentorship.mentor._id.toString() !== req.user.id) {
      return next(new AppError('Not authorized to view this mentorship', 403));
    }

    res.status(200).json({
      success: true,
      data: mentorship
    });
  } catch (error) {
    next(error);
  }
};

exports.updateGoals = async (req, res, next) => {
  try {
    const { goals } = req.body;
    const mentorship = await Mentorship.findById(req.params.id);

    if (!mentorship) {
      return next(new AppError('Mentorship not found', 404));
    }

    if (mentorship.student.toString() !== req.user.id && mentorship.mentor.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    mentorship.goals = goals;
    await mentorship.save();

    res.status(200).json({
      success: true,
      data: mentorship
    });
  } catch (error) {
    next(error);
  }
};

exports.updateMilestones = async (req, res, next) => {
  try {
    const { milestoneId, title, description, isCompleted } = req.body;
    const mentorship = await Mentorship.findById(req.params.id);

    if (!mentorship) {
      return next(new AppError('Mentorship not found', 404));
    }

    if (mentorship.student.toString() !== req.user.id && mentorship.mentor.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    if (milestoneId) {
      const milestone = mentorship.milestones.id(milestoneId);
      if (!milestone) {
        return next(new AppError('Milestone not found', 404));
      }
      if (title !== undefined) milestone.title = title;
      if (description !== undefined) milestone.description = description;
      if (isCompleted !== undefined) milestone.isCompleted = isCompleted;
    } else {
      mentorship.milestones.push({ title, description, isCompleted });
    }

    await mentorship.save();

    res.status(200).json({
      success: true,
      data: mentorship
    });
  } catch (error) {
    next(error);
  }
};

exports.getMilestones = async (req, res, next) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id)
      .populate('student', 'firstName lastName email')
      .populate('mentor', 'firstName lastName email');

    if (!mentorship) {
      return next(new AppError('Mentorship not found', 404));
    }

    if (mentorship.student._id.toString() !== req.user.id && mentorship.mentor._id.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    const mapped = {
      ...mentorship.toObject(),
      mentorId: mentorship.mentor._id.toString(),
      mentorName: `${mentorship.mentor.firstName} ${mentorship.mentor.lastName}`,
      studentId: mentorship.student._id.toString(),
      studentName: `${mentorship.student.firstName} ${mentorship.student.lastName}`,
      milestones: mentorship.milestones.map(m => ({
        ...m.toObject(),
        id: m._id.toString()
      }))
    };

    res.status(200).json({
      success: true,
      data: mapped
    });
  } catch (error) {
    next(error);
  }
};
