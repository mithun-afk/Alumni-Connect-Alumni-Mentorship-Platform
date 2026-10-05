const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { requestMentor, getRequests, updateRequestStatus, getMyMentorships, getMentorshipDetails, updateGoals, updateMilestones, getMilestones } = require('../controllers/mentorshipController');

router.post('/request', authenticate, [
  body('mentorId').isMongoId().withMessage('Valid mentor ID required'),
  body('message').notEmpty().withMessage('Message is required')
], requestMentor);

router.get('/requests', authenticate, getRequests);

router.patch('/request/:id/status', authenticate, [
  body('status').isIn(['accepted', 'declined']).withMessage('Status must be accepted or declined')
], updateRequestStatus);

router.get('/my', authenticate, getMyMentorships);
router.get('/:id', authenticate, getMentorshipDetails);

router.patch('/:id/goals', authenticate, [
  body('goals').isArray().withMessage('Goals must be an array')
], updateGoals);

router.patch('/:id/milestones', authenticate, [
  body('milestoneId').optional().isString(),
  body('title').optional().isString(),
  body('description').optional().isString(),
  body('isCompleted').optional().isBoolean()
], updateMilestones);

router.get('/:id/milestones', authenticate, getMilestones);

module.exports = router;
