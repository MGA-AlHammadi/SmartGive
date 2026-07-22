const db = require('../config/db');

/**
 * Nachricht von einem Benutzer an einen anderen senden
 */
const sendMessage = async (senderId, receiverId, content) => {
    const result = await db.query(
        'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
        [senderId, receiverId, content]
    );
    return result.rows[0];
};

/**
 * Nachrichtenverlauf zwischen zwei Benutzern abrufen
 */
const getMessagesBetweenUsers = async (user1Id, user2Id) => {
    const result = await db.query(
        `SELECT m.*, 
                u1.username as sender_username, 
                u2.username as receiver_username
         FROM messages m
         JOIN users u1 ON m.sender_id = u1.id
         JOIN users u2 ON m.receiver_id = u2.id
         WHERE (m.sender_id = $1 AND m.receiver_id = $2)
            OR (m.sender_id = $2 AND m.receiver_id = $1)
         ORDER BY m.created_at ASC`,
        [user1Id, user2Id]
    );
    return result.rows;
};

/**
 * Alle Konversationen eines Benutzers abrufen
 * Gibt die letzte Nachricht und den anderen Teilnehmer für jede Konversation zurück
 */
const getUserConversations = async (userId) => {
    const result = await db.query(
        `WITH LastMessages AS (
            SELECT DISTINCT ON (
                CASE WHEN sender_id < receiver_id THEN sender_id ELSE receiver_id END,
                CASE WHEN sender_id < receiver_id THEN receiver_id ELSE sender_id END
            )
            id, sender_id, receiver_id, content, created_at, is_read
            FROM messages
            WHERE sender_id = $1 OR receiver_id = $1
            ORDER BY 
                CASE WHEN sender_id < receiver_id THEN sender_id ELSE receiver_id END,
                CASE WHEN sender_id < receiver_id THEN receiver_id ELSE sender_id END,
                created_at DESC
        )
        SELECT lm.*, 
               u.id as other_user_id,
               u.username as other_username,
               u.company_name as other_company_name,
               u.is_company as other_is_company
        FROM LastMessages lm
        JOIN users u ON u.id = CASE WHEN lm.sender_id = $1 THEN lm.receiver_id ELSE lm.sender_id END
        ORDER BY lm.created_at DESC`,
        [userId]
    );
    return result.rows;
};

/**
 * Nachrichten als gelesen markieren
 */
const markAsRead = async (senderId, receiverId) => {
    await db.query(
        'UPDATE messages SET is_read = TRUE WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE',
        [senderId, receiverId]
    );
};

module.exports = {
    sendMessage,
    getMessagesBetweenUsers,
    getUserConversations,
    markAsRead
};