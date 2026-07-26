const db = require("../config/db");

/**
 * Statische Definition der Benutzerfelder für SELECT-Abfragen.
 * Dies reduziert die Komplexität und verbessert die Performance.
 */
const USER_SELECT_FIELDS = `
    id,
    username,
    email,
    password_hash,
    first_name AS "firstName",
    last_name AS "lastName",
    company_name AS "companyName",
    company_address AS "companyAddress",
    company_country AS "companyCountry",
    company_city AS "companyCity",
    is_company AS "isCompany",
    phone,
    profile_description AS "profileDescription",
    profile_picture AS "profilePicture",
    role,
    is_verified AS "isVerified",
    is_banned AS "isBanned",
    created_at AS "createdAt"
`;

const getUserByUsername = async (username) => {
    const result = await db.query(
        `SELECT ${USER_SELECT_FIELDS} FROM users WHERE username = $1`,
        [username]
    );
    return result.rows[0];
};

const getUserByEmail = async (email) => {
    const result = await db.query(
        `SELECT ${USER_SELECT_FIELDS} FROM users WHERE email = $1`,
        [email]
    );
    return result.rows[0];
};

const getUserById = async (userId) => {
    const result = await db.query(
        `SELECT ${USER_SELECT_FIELDS} FROM users WHERE id = $1`,
        [userId]
    );
    return result.rows[0];
};

const updateLastLogin = async (userId) => {
    await db.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [userId]);
};

const searchUsers = async (searchTerm) => {
    const result = await db.query(
        `SELECT id, username, first_name AS "firstName", last_name AS "lastName", 
                company_name AS "companyName", is_company AS "isCompany" 
         FROM users 
         WHERE (username ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1 OR company_name ILIKE $1 OR email ILIKE $1)
         ORDER BY company_name NULLS LAST, username ASC
         LIMIT 20`,
        [`%${searchTerm}%`]
    );
    return result.rows;
};

const createUser = async (userData) => {
    const {
        username, email, passwordHash, firstName, lastName, 
        companyName, address, companyCountry, companyCity, isCompany
    } = userData;

    const result = await db.query(
        `INSERT INTO users (
            username, email, password_hash, first_name, last_name, 
            company_name, company_address, company_country, company_city, is_company
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
            username, email, passwordHash, firstName || null, lastName || null, 
            companyName || null, address || null, companyCountry || null, 
            companyCity || null, isCompany || false
        ]
    );

    return getUserById(result.rows[0].id);
};

const updateUserProfile = async (userId, userData) => {
    const {
        firstName, lastName, companyName, companyCountry, companyCity, 
        phone, profileDescription, profilePicture
    } = userData;

    const companyAddress = companyCity && companyCountry ? `${companyCity}, ${companyCountry}` : null;

    const result = await db.query(
        `UPDATE users
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             company_name = COALESCE($3, company_name),
             company_address = COALESCE($4, company_address),
             company_country = COALESCE($5, company_country),
             company_city = COALESCE($6, company_city),
             phone = $7,
             profile_description = $8,
             profile_picture = COALESCE($9, profile_picture),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $10
         RETURNING id`,
        [
            firstName, lastName, companyName, companyAddress, 
            companyCountry || null, companyCity || null, 
            phone || null, profileDescription || null, profilePicture, 
            userId
        ]
    );

    return result.rows[0] ? getUserById(result.rows[0].id) : null;
};

module.exports = {
    getUserByUsername,
    getUserByEmail,
    getUserById,
    updateLastLogin,
    createUser,
    updateUserProfile,
    searchUsers
};
