const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const profileRoutes = require('./profileRoutes');
const adminRoutes = require('./adminRoutes');
const notificationRoutes = require('./notificationRoutes');
const mentorRoutes = require('./mentorRoutes');
const studentRoutes = require('./studentRoutes');
const mentorshipRoutes = require('./mentorshipRoutes');
const officeHourRoutes = require('./officeHourRoutes');
const sessionRoutes = require('./sessionRoutes');

const opportunityRoutes = require('./opportunityRoutes');
const referralRoutes = require('./referralRoutes');
const eventRoutes = require('./eventRoutes');
const messageRoutes = require('./messageRoutes');

// Phase 4 routes
const dashboardRoutes = require('./dashboardRoutes');
const careerPathRoutes = require('./careerPathRoutes');

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/mentors', mentorRoutes);
router.use('/students', studentRoutes);
router.use('/mentorship', mentorshipRoutes);
router.use('/office-hours', officeHourRoutes);
router.use('/sessions', sessionRoutes);

// Phase 3 routes
router.use('/opportunities', opportunityRoutes);
router.use('/referrals', referralRoutes);
router.use('/events', eventRoutes);
router.use('/messages', messageRoutes);

// Phase 4 routes
router.use('/dashboard', dashboardRoutes);
router.use('/career-paths', careerPathRoutes);

module.exports = router;

