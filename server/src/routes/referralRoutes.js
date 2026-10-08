const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const referralController = require('../controllers/referralController');
const { authenticate } = require('../middleware/auth');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

router.post(
  '/request',
  authenticate,
  [
    check('alumniId', 'Valid alumni ID is required').isMongoId(),
    check('opportunityId', 'Valid opportunity ID is required').optional().isMongoId()
  ],
  validate,
  referralController.requestReferral
);

router.get('/', authenticate, referralController.getReferrals);

router.patch(
  '/:id/status',
  authenticate,
  [
    check('status', 'Status must be valid').isIn(['Requested', 'Reviewed', 'Referred', 'Outcome'])
  ],
  validate,
  referralController.updateStatus
);

module.exports = router;
