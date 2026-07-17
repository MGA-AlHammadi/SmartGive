const db = require('../config/db');

const getUsersColumns = async () => {
    const result = await db.query(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'users'`
    );

    return new Set(result.rows.map((row) => row.column_name));
};

const hasUsersColumn = async (columnName) => {
    const columns = await getUsersColumns();
    return columns.has(columnName);
};

const buildUserSelectClause = async () => {
    const hasCompanyCountry = await hasUsersColumn('company_country');
    const hasCompanyCity = await hasUsersColumn('company_city');
    const hasPhone = await hasUsersColumn('phone');
    const hasProfileDescription = await hasUsersColumn('profile_description');
    const hasProfilePicture = await hasUsersColumn('profile_picture');
    const hasRole = await hasUsersColumn('role');
    const hasIsVerified = await hasUsersColumn('is_verified');
    const hasIsBanned = await hasUsersColumn('is_banned');

    return `
        id,
        username,
        email,
        password_hash,
        first_name,
        last_name,
        company_name,
        company_address,
        is_company,
        created_at,
        is_company AS "isCompany",
        first_name AS "firstName",
        last_name AS "lastName",
        company_name AS "companyName",
        company_address AS "companyAddress",
        ${hasCompanyCountry ? 'company_country' : 'NULL'} AS "companyCountry",
        ${hasCompanyCity ? 'company_city' : 'NULL'} AS "companyCity",
        ${hasPhone ? 'phone' : 'NULL'} AS phone,
        ${hasProfileDescription ? 'profile_description' : 'NULL'} AS "profileDescription",
        ${hasProfilePicture ? 'profile_picture' : 'NULL'} AS "profilePicture",
        ${hasRole ? 'role' : "'user'"} AS role,
        ${hasIsVerified ? 'is_verified' : 'false'} AS is_verified,
        ${hasIsBanned ? 'is_banned' : 'false'} AS is_banned
    `;
};

const getUserByUsername = async (username) => {
    const selectClause = await buildUserSelectClause();
    const result = await db.query(
        `SELECT ${selectClause}
         FROM users
         WHERE username = $1`,
        [username]
    );
    return result.rows[0]; // Returns the user object if found, otherwise undefined
};

const getUserByEmail = async (email) => {
    const selectClause = await buildUserSelectClause();
    const result = await db.query(
        `SELECT ${selectClause}
         FROM users
         WHERE email = $1`,
        [email]
    );
    return result.rows[0]; // Returns the user object if found, otherwise undefined
};

const getUserById = async (userId) => {
    const selectClause = await buildUserSelectClause();
    const result = await db.query(
        `SELECT ${selectClause}
         FROM users
         WHERE id = $1`,
        [userId]
    );
    return result.rows[0];
};

const updateLastLogin = async (userId) => {
    await db.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
};

const searchUsers = async (searchTerm) => {
    const result = await db.query(
        `SELECT id, username, first_name, last_name, company_name, is_company 
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
        username,
        email,
        passwordHash,
        firstName,
        lastName,
        companyName,
        address,
        companyCountry,
        companyCity,
        isCompany
    } = userData;

    const columns = [
        'username',
        'email',
        'password_hash',
        'first_name',
        'last_name',
        'company_name',
        'company_address',
        'is_company'
    ];

    const values = [
        username,
        email,
        passwordHash,
        firstName,
        lastName,
        companyName,
        address,
        isCompany
    ];

    if (await hasUsersColumn('company_country')) {
        columns.push('company_country');
        values.push(companyCountry || null);
    }

    if (await hasUsersColumn('company_city')) {
        columns.push('company_city');
        values.push(companyCity || null);
    }

    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

    const result = await db.query(
        `INSERT INTO users (${columns.join(', ')})
         VALUES (${placeholders})
         RETURNING id`,
        values
    );

    return getUserById(result.rows[0].id);
};

const updateUserProfile = async (userId, userData) => {
    const {
        firstName,
        lastName,
        companyName,
        companyCountry,
        companyCity,
        phone,
        profileDescription,
        profilePicture
    } = userData;

    const companyAddress = companyCity && companyCountry
        ? `${companyCity}, ${companyCountry}`
        : null;

    const setParts = [
        'first_name = COALESCE($1, first_name)',
        'last_name = COALESCE($2, last_name)',
        'company_name = COALESCE($3, company_name)',
        'company_address = COALESCE($4, company_address)'
    ];

    const values = [firstName, lastName, companyName, companyAddress];

    if (await hasUsersColumn('company_country')) {
        values.push(companyCountry || null);
        setParts.push(`company_country = COALESCE($${values.length}, company_country)`);
    }

    if (await hasUsersColumn('company_city')) {
        values.push(companyCity || null);
        setParts.push(`company_city = COALESCE($${values.length}, company_city)`);
    }

    if (await hasUsersColumn('phone')) {
        values.push(phone || null);
        setParts.push(`phone = $${values.length}`);
    }

    if (await hasUsersColumn('profile_description')) {
        values.push(profileDescription || null);
        setParts.push(`profile_description = $${values.length}`);
    }

    if (await hasUsersColumn('profile_picture')) {
        values.push(profilePicture || null);
        setParts.push(`profile_picture = COALESCE($${values.length}, profile_picture)`);
    }

    setParts.push('updated_at = CURRENT_TIMESTAMP');

    values.push(userId);

    const result = await db.query(
        `UPDATE users
         SET ${setParts.join(', ')}
         WHERE id = $${values.length}
         RETURNING id`,
        values
    );

    if (!result.rows[0]) {
        return null;
    }

    return getUserById(result.rows[0].id);
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
