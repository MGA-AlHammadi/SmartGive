const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const adminController = require('../controllers/adminController');

// Apply both auth and admin middleware to all routes
router.use(verifyToken, adminMiddleware);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.listAllUsers);
router.patch('/users/:userId/role', adminController.updateUserRole);
router.post('/users/:userId/ban', adminController.banUser);
router.post('/users/:userId/unban', adminController.unbanUser);
router.delete('/users/:userId', adminController.deleteUser);

// NGO Verification
router.get('/ngos/pending', adminController.listPendingNgos);
router.get('/ngos/verified', adminController.getVerifiedNgos);
router.post('/ngos/:ngoId/verify', adminController.verifyNgo);
router.post('/ngos/:ngoId/reject', adminController.rejectNgo);

// Content Moderation
router.get('/reports', adminController.listReports);
router.post('/reports/:reportId/review', adminController.reviewReport);

// Admin Logs
router.get('/logs', adminController.getAdminLogs);

module.exports = router;
