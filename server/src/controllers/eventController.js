const Event = require('../models/Event');
const Notification = require('../models/Notification');

exports.createEvent = async (req, res) => {
  try {
    const { title, description, type, date, startTime, endTime, location, isVirtual, meetingLink, maxAttendees } = req.body;
    
    const newEvent = await Event.create({
      createdBy: req.user._id,
      title,
      description,
      type,
      date,
      startTime,
      endTime,
      location,
      isVirtual,
      meetingLink,
      maxAttendees
    });

    res.json({ success: true, data: newEvent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'firstName lastName email').sort({ date: 1 });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rsvpEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.attendees && event.attendees.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already RSVPed' });
    }

    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }

    event.attendees.push(req.user._id);
    await event.save();

    await Notification.create({
      user: event.createdBy,
      type: 'EVENT_RSVP',
      title: 'New Event RSVP',
      message: `${req.user.firstName} ${req.user.lastName} RSVPed to your event: ${event.title}`,
      relatedId: event._id
    });

    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
