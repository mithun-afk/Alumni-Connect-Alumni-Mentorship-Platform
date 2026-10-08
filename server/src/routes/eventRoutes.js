const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const eventController = require('../controllers/eventController');
const { authenticate } = require('../middleware/auth');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

router.post(
  '/',
  authenticate,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('type', 'Type must be valid').isIn(['webinar', 'workshop', 'meetup', 'ama']),
    check('date', 'Date is required').isISO8601(),
    check('startTime', 'Start time is required').not().isEmpty(),
    check('endTime', 'End time is required').not().isEmpty()
  ],
  validate,
  eventController.createEvent
);

router.get('/', authenticate, eventController.getEvents);

router.post(
  '/:id/rsvp',
  authenticate,
  [
    check('id', 'Valid event ID is required').isMongoId()
  ],
  validate,
  eventController.rsvpEvent
);

module.exports = router;
