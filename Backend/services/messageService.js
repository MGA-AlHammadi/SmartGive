const db = require('../config/db');

/**
 * Send a message from one user to another
 */
const sendMessage = async (senderId, receiverId, content) => {
    const result = await db.query(
        'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
        [senderId, receiverId, content]
    );
    return result.rows[0];
};

/**
 * Get message history between two users
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
 * Get all conversations for a user
 * Returns the latest message and the other participant for each conversation
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
 * Mark messages as read
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