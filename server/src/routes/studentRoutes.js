const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getStudents } = require('../controllers/studentController');

router.get('/', authenticate, getStudents);

module.exports = router;
