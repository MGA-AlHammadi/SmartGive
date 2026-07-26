const messageService = require('../services/messageService');
const userService = require('../services/userService');
const { getIO, getSocketIdByUserId } = require('../config/socket');

const sendMessage = async (req, res) => {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !content) {
        return res.status(400).json({ message: 'Empfänger und Inhalt sind erforderlich' });
    }

    try {
        const message = await messageService.sendMessage(senderId, receiverId, content);
        
        // Echtzeit-Benachrichtigung an den Empfänger
        const receiverSocketId = getSocketIdByUserId(receiverId);
        if (receiverSocketId) {
            const io = getIO();
            io.to(receiverSocketId).emit('new_message', message);
        }

        res.status(201).json(message);
    } catch (err) {
        console.error('Fehler beim Senden der Nachricht:', err);
        res.status(500).json({ message: 'Serverfehler' });
    }
};

const getConversations = async (req, res) => {
    const userId = req.user.id;

    try {
        const conversations = await messageService.getUserConversations(userId);
        res.json(conversations);
    } catch (err) {
        console.error('Fehler beim Abrufen der Konversationen:', err);
        res.status(500).json({ message: 'Serverfehler' });
    }
};

const getMessages = async (req, res) => {
    const userId = req.user.id;
    const otherUserId = req.params.otherUserId;

    try {
        const messages = await messageService.getMessagesBetweenUsers(userId, otherUserId);
        // Mark as read
        await messageService.markAsRead(otherUserId, userId);
        res.json(messages);
    } catch (err) {
        console.error('Fehler beim Abrufen der Nachrichten:', err);
        res.status(500).json({ message: 'Serverfehler' });
    }
};

const searchUsersForMessaging = async (req, res) => {
    const { query } = req.query;
    if (!query || query.trim().length === 0) {
        return res.json([]);
    }

    try {
        const users = await userService.searchUsers(query.trim());
        res.json(users);
    } catch (err) {
        console.error('Fehler bei der Nutzersuche:', err);
        res.status(500).json({ message: 'Serverfehler' });
    }
};

module.exports = {
    sendMessage,
    getConversations,
    getMessages,
    searchUsersForMessaging
};