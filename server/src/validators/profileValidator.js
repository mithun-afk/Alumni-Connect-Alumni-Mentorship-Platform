const { body } = require('express-validator');

exports.updateProfileValidation = [
  body('headline').optional().trim(),
  body('bio').optional().trim(),
  body('skills').optional().isArray(),
  body('domains').optional().isArray(),
  body('experience').optional().isNumeric(),
  body('linkedinUrl').optional({ checkFalsy: true }).isURL().withMessage('Must be a valid URL'),
  body('githubUrl').optional({ checkFalsy: true }).isURL().withMessage('Must be a valid URL'),
  body('portfolioUrl').optional({ checkFalsy: true }).isURL().withMessage('Must be a valid URL'),
  body('phone').optional().trim(),
  body('profileVisibility').optional().isIn(['public', 'students-only', 'private']),
  body('careerGoals').optional().isArray(),
  body('interests').optional().isArray(),
  body('achievements').optional().isArray()
];
