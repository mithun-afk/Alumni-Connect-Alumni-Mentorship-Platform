const { body } = require('express-validator');

exports.updateAlumniStatusValidation = [
  body('status')
    .isIn(['verified', 'rejected', 'suspended'])
    .withMessage('Status must be verified, rejected, or suspended'),
  body('reason')
    .if(body('status').isIn(['rejected', 'suspended']))
    .notEmpty().withMessage('Reason is required when rejecting or suspending')
];
