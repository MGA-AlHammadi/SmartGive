const db = require('../config/db');

const getUserByUsername = async (username) => {
    const result = await db.query('SELECT *, is_company AS "isCompany" FROM users WHERE username = $1', [username]);
    return result.rows[0]; // Returns the user object if found, otherwise undefined
};

const updateLastLogin = async (userId) => {
    await db.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
};

const createUser = async (userData) => {
    const { username, email, passwordHash, firstName, lastName, companyName, address, isCompany } = userData;
    const result = await db.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, company_name, company_address, is_company) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, username, email, is_company AS "isCompany"`,
        [username, email, passwordHash, firstName, lastName, companyName, address, isCompany]
    );
    return result.rows[0];
};

module.exports = {
    getUserByUsername,
    updateLastLogin,
    createUser
};
