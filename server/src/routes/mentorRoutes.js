const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { getMentors } = require('../controllers/mentorController');

router.get('/', authenticate, getMentors);

module.exports = router;
