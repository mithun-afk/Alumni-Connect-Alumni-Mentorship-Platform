const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const opportunityController = require('../controllers/opportunityController');
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
    check('company', 'Company is required').not().isEmpty(),
    check('type', 'Type is required').isIn(['job', 'internship', 'project', 'research']),
    check('description', 'Description is required').not().isEmpty(),
  ],
  validate,
  opportunityController.createOpportunity
);

router.get('/', authenticate, opportunityController.getOpportunities);

router.post(
  '/:id/apply',
  authenticate,
  [
    check('id', 'Valid opportunity ID required').isMongoId()
  ],
  validate,
  opportunityController.applyOpportunity
);

module.exports = router;
