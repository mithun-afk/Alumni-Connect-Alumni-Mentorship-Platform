const { Session } = require('../models');
const AppError = require('../utils/AppError');

const getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ mentorship: req.params.mentorshipId }).populate('officeHourSlot').sort('-scheduledAt');
    res.json({ success: true, data: { sessions } });
  } catch (error) {
    next(error);
  }
};

const updateSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return next(new AppError('Session not found', 404));

    if (req.body.notes !== undefined) session.notes = req.body.notes;
    if (req.body.studentNotes !== undefined) session.studentNotes = req.body.studentNotes;
    if (req.body.status) session.status = req.body.status;
    if (req.body.rating) session.rating = req.body.rating;
    
    await session.save();
    res.json({ success: true, message: 'Session updated', data: { session } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSessions,
  updateSession
};
