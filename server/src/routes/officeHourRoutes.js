const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { addSlots, getMentorSlots, bookSlot } = require('../controllers/officeHourController');

router.post('/', [
  body('startTime').isISO8601().withMessage('Valid start time required'),
  body('endTime').isISO8601().withMessage('Valid end time required')
], addSlots);

router.get('/:mentorId', getMentorSlots);

router.post('/:slotId/book', [
  body('mentorshipId').isMongoId().withMessage('Mentorship ID required')
], bookSlot);

module.exports = router;
