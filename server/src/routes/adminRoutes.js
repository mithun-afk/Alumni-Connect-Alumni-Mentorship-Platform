const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { updateAlumniStatusValidation } = require('../validators/adminValidator');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/pending-alumni', adminController.getPendingAlumni);
router.get('/users', adminController.getAllUsers);
router.patch('/alumni/:id/status', updateAlumniStatusValidation, adminController.updateAlumniStatus);
router.get('/stats', adminController.getDashboardStats);
router.get('/audit-logs', adminController.getAuditLogs);

// Moderation routes
router.get('/moderation', adminController.getModerationList);
router.patch('/moderation/:id', adminController.moderateItem);

module.exports = router;
