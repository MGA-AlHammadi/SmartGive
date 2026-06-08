const db = require('../config/db');

const createActivity = async ({ userId, title, details }) => {
    if (!userId || !title) {
        return null;
    }

    try {
        const result = await db.query(
            `INSERT INTO user_activities (user_id, title, details)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [userId, title, details || null]
        );

        return result.rows[0];
    } catch (err) {
        if (err.code === '42P01') {
            return null;
        }
        throw err;
    }
};

const listUserActivities = async (userId, limit = 10) => {
    const parsedLimit = Number(limit) > 0 ? Number(limit) : 10;

    try {
        const result = await db.query(
            `SELECT id, title, details, created_at
             FROM user_activities
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT $2`,
            [userId, parsedLimit]
        );

        return result.rows;
    } catch (err) {
        if (err.code === '42P01') {
            return [];
        }
        throw err;
    }
};

module.exports = {
    createActivity,
    listUserActivities
};
