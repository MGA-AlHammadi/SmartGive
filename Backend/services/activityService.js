const db = require('../config/db');

const createActivity = async ({ userId, title, details }) => {
    if (!userId || !title) {
        return null;
    }

    const result = await db.query(
        `INSERT INTO user_activities (user_id, title, details)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, title, details || null]
    );

    return result.rows[0];
};

const listUserActivities = async (userId, limit = 10) => {
    const parsedLimit = Number(limit) > 0 ? Number(limit) : 10;

    const result = await db.query(
        `SELECT id, title, details, created_at
         FROM user_activities
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, parsedLimit]
    );

    return result.rows;
};

module.exports = {
    createActivity,
    listUserActivities
};
