const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { updateProfileValidation } = require('../validators/profileValidator');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', profileController.getMyProfile);
router.put('/', updateProfileValidation, profileController.updateProfile);
router.get('/:userId', profileController.getPublicProfile);

module.exports = router;
