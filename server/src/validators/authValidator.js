const { body } = require('express-validator');

exports.registerValidation = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase and number'),
  body('firstName')
    .notEmpty().withMessage('First name is required')
    .trim()
    .escape(),
  body('lastName')
    .notEmpty().withMessage('Last name is required')
    .trim()
    .escape(),
  body('role')
    .isIn(['student', 'alumni']).withMessage('Role must be student or alumni'),
  body('department')
    .if(body('role').equals('alumni'))
    .notEmpty().withMessage('Department is required for alumni'),
  body('batch')
    .if(body('role').equals('alumni'))
    .notEmpty().withMessage('Batch is required for alumni'),
  body('rollNo')
    .if(body('role').equals('alumni'))
    .notEmpty().withMessage('Roll number is required for alumni')
];

exports.loginValidation = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];
