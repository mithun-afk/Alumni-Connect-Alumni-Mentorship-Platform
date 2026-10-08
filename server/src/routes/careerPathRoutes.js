const express = require('express');
const router = express.Router();
const careerPathController = require('../controllers/careerPathController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, careerPathController.getCareerPaths);

module.exports = router;
