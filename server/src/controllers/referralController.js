const Referral = require('../models/Referral');
const Notification = require('../models/Notification');
// Profile model is needed to get snapshot
const mongoose = require('mongoose');
const Profile = mongoose.model('Profile'); // Ensure Profile is registered, if not I should import it. Let me just use mongoose.model('Profile') or require('../models/Profile')

exports.requestReferral = async (req, res) => {
  try {
    const { alumniId, opportunityId } = req.body;
    
    // Get student profile
    const profile = await mongoose.model('Profile').findOne({ user: req.user._id });
    if (!profile) {
      return res.status(400).json({ success: false, message: 'Profile not found to snapshot' });
    }

    const newReferral = await Referral.create({
      student: req.user._id,
      alumni: alumniId,
      opportunity: opportunityId,
      profileSnapshot: profile.toObject() // Extract profile snapshot
    });

    await Notification.create({
      user: alumniId,
      type: 'REFERRAL_REQUEST',
      title: 'New Referral Request',
      message: `${req.user.firstName} ${req.user.lastName} requested a referral.`,
      relatedId: newReferral._id
    });

    res.json({ success: true, data: newReferral });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReferrals = async (req, res) => {
  try {
    // Return referrals where user is either student or alumni
    const referrals = await Referral.find({
      $or: [{ student: req.user._id }, { alumni: req.user._id }]
    })
      .populate('student', 'firstName lastName email')
      .populate('alumni', 'firstName lastName email')
      .populate('opportunity', 'title company');

    res.json({ success: true, data: referrals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, outcomeDetails } = req.body;
    const referralId = req.params.id;

    const referral = await Referral.findById(referralId);
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }

    // Only alumni or authorized personnel should update, checking alumni:
    if (referral.alumni.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
       return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    referral.status = status;
    if (outcomeDetails) referral.outcomeDetails = outcomeDetails;
    await referral.save();

    await Notification.create({
      user: referral.student,
      type: 'REFERRAL_UPDATE',
      title: 'Referral Status Updated',
      message: `Your referral request status has been updated to ${status}.`,
      relatedId: referral._id
    });

    res.json({ success: true, data: referral });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
