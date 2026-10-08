const Message = require('../models/Message');
const Mentorship = require('../models/Mentorship');

exports.sendMessage = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    const { content } = req.body;

    const mentorship = await Mentorship.findById(mentorshipId);
    if (!mentorship) {
      return res.status(404).json({ success: false, message: 'Mentorship not found' });
    }

    if (mentorship.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Mentorship is not active' });
    }

    const userId = req.user._id.toString();
    const studentId = mentorship.student.toString();
    const mentorId = mentorship.mentor.toString();

    if (userId !== studentId && userId !== mentorId) {
      return res.status(403).json({ success: false, message: 'Not a participant of this mentorship' });
    }

    const receiverId = userId === studentId ? mentorId : studentId;

    const newMessage = await Message.create({
      mentorship: mentorshipId,
      sender: userId,
      receiver: receiverId,
      content
    });

    res.json({ success: true, data: newMessage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { mentorshipId } = req.params;

    const mentorship = await Mentorship.findById(mentorshipId);
    if (!mentorship) {
      return res.status(404).json({ success: false, message: 'Mentorship not found' });
    }

    const userId = req.user._id.toString();
    if (userId !== mentorship.student.toString() && userId !== mentorship.mentor.toString()) {
      return res.status(403).json({ success: false, message: 'Not a participant of this mentorship' });
    }

    const messages = await Message.find({ mentorship: mentorshipId }).sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
