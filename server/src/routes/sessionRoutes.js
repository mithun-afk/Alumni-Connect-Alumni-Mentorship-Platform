const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getSessions, updateSession } = require('../controllers/sessionController');

router.get('/:mentorshipId', getSessions);

router.patch('/:id', [
  body('notes').optional().isString(),
  body('studentNotes').optional().isString(),
  body('status').optional().isIn(['scheduled', 'completed', 'cancelled']),
  body('rating').optional().isInt({ min: 1, max: 5 })
], updateSession);

module.exports = router;
