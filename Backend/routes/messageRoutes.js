const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');

// Alle Routen hier erfordern Authentifizierung
router.use(authMiddleware);

router.get('/conversations', messageController.getConversations);
router.get('/history/:otherUserId', messageController.getMessages);
router.post('/send', messageController.sendMessage);
router.get('/search', messageController.searchUsersForMessaging);

module.exports = router;