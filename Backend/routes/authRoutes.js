const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { login, register, getMe, updateMe, listMyActivities, getUserProfile } = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/register (Hilfsroute zum Erstellen von Benutzern)
router.post('/register', register);

router.get('/me', verifyToken, getMe);
router.patch('/me', verifyToken, upload.single('profilePicture'), updateMe);
router.get('/me/activities', verifyToken, listMyActivities);
router.get('/profile/:id', verifyToken, getUserProfile);

module.exports = router;
