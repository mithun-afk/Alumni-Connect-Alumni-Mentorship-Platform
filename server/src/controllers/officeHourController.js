const OfficeHourSlot = require('../models/OfficeHourSlot');
const Mentorship = require('../models/Mentorship');
const Session = require('../models/Session');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');

exports.addSlots = async (req, res, next) => {
  try {
    const mentorId = req.user.id;
    const { startTime, endTime, duration } = req.body;

    const newSlot = await OfficeHourSlot.create({
      mentor: mentorId,
      startTime,
      endTime,
      duration,
      isBooked: false
    });

    res.status(201).json({
      success: true,
      data: newSlot
    });
  } catch (error) {
    next(error);
  }
};

exports.getMentorSlots = async (req, res, next) => {
  try {
    const slots = await OfficeHourSlot.find({ mentor: req.params.mentorId, isBooked: false })
      .sort('startTime');

    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots
    });
  } catch (error) {
    next(error);
  }
};

exports.bookSlot = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { mentorshipId, topic } = req.body;
    const slotId = req.params.slotId;

    const slot = await OfficeHourSlot.findById(slotId);
    if (!slot) return next(new AppError('Slot not found', 404));
    if (slot.isBooked) return next(new AppError('Slot is already booked', 400));

    const mentorship = await Mentorship.findById(mentorshipId);
    if (!mentorship || mentorship.status !== 'active') {
      return next(new AppError('Active mentorship not found', 404));
    }

    if (mentorship.student.toString() !== studentId) {
      return next(new AppError('Not authorized to book session for this mentorship', 403));
    }

    slot.isBooked = true;
    slot.bookedBy = studentId;
    await slot.save();

    const session = await Session.create({
      mentorship: mentorshipId,
      slot: slotId,
      topic,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: 'scheduled'
    });

    await Notification.create({
      user: slot.mentor,
      type: 'SESSION_BOOKED',
      message: `A session has been booked for ${topic || 'mentorship'} by the student.`,
      relatedId: session._id,
      relatedModel: 'Session'
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};
