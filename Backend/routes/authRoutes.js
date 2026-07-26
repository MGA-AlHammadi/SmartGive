const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { login, register, getMe, updateMe, listMyActivities, getUserProfile } = require('../controllers/authController');
const validate = require('../middlewares/validateMiddleware');
const { registerSchema, loginSchema } = require('../validations/authSchema');

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// POST /api/auth/register (Hilfsroute zum Erstellen von Benutzern)
router.post('/register', validate(registerSchema), register);

router.get('/me', verifyToken, getMe);
router.patch('/me', verifyToken, upload.single('profilePicture'), updateMe);
router.get('/me/activities', verifyToken, listMyActivities);
router.get('/profile/:id', verifyToken, getUserProfile);

module.exports = router;
