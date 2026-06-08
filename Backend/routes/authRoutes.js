const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const { login, register, getMe, updateMe, listMyActivities } = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/register (Hilfsroute zum Erstellen von Benutzern)
router.post('/register', register);

router.get('/me', verifyToken, getMe);
router.patch('/me', verifyToken, updateMe);
router.get('/me/activities', verifyToken, listMyActivities);

module.exports = router;
