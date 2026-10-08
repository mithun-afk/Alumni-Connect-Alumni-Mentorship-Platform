const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

router.post(
  '/:mentorshipId',
  authenticate,
  [
    check('mentorshipId', 'Valid mentorship ID is required').isMongoId(),
    check('content', 'Message content is required').not().isEmpty()
  ],
  validate,
  messageController.sendMessage
);

router.get(
  '/:mentorshipId',
  authenticate,
  [
    check('mentorshipId', 'Valid mentorship ID is required').isMongoId()
  ],
  validate,
  messageController.getMessages
);

module.exports = router;
