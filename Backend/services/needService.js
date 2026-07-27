const db = require('../config/db');

const createNeed = async (data) => {
    const {
        ngoUserId,
        title,
        category,
        gender,
        size,
        quantityNeeded,
        country,
        city,
        description,
        neededBy,
        imageUrls
    } = data;

    const result = await db.query(
        `INSERT INTO ngo_needs (
            ngo_user_id, title, category, gender, size, quantity_needed, country, city, description, needed_by, image_urls
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [ngoUserId, title, category, gender, size, quantityNeeded, country, city, description, neededBy, imageUrls || []]
    );

    return result.rows[0];
};

const listNeeds = async (filters) => {
    const { category, city, country, status } = filters;

    const conditions = [];
    const values = [];

    if (category) {
        values.push(category);
        conditions.push(`category = $${values.length}`);
    }

    if (city) {
        values.push(city);
        conditions.push(`city = $${values.length}`);
    }

    if (country) {
        values.push(country);
        conditions.push(`country = $${values.length}`);
    }

    if (status && status !== 'all') {
        values.push(status);
        conditions.push(`status = $${values.length}`);
    } else if (!status) {
        // Standardmäßig aktive und erledigte Bedarfe anzeigen
        conditions.push(`status IN ('active', 'erledigt')`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await db.query(
        `SELECT nn.*, u.company_name AS ngo_name,
                COALESCE((SELECT SUM(d.quantity) 
                          FROM donations d 
                          WHERE d.ngo_need_id = nn.id 
                            AND d.status IN ('pending', 'accepted', 'in_transit', 'delivered')), 0) as quantity_offered
         FROM ngo_needs nn
         JOIN users u ON u.id = nn.ngo_user_id
         ${whereClause}
         ORDER BY nn.created_at DESC`,
        values
    );

    return result.rows;
};

const getNeedById = async (needId) => {
    const result = await db.query(
        `SELECT nn.*,
                COALESCE((SELECT SUM(d.quantity) 
                          FROM donations d 
                          WHERE d.ngo_need_id = nn.id 
                            AND d.status IN ('pending', 'accepted', 'in_transit', 'delivered')), 0) as quantity_offered
         FROM ngo_needs nn 
         WHERE nn.id = $1`, 
        [needId]
    );
    return result.rows[0];
};

const updateNeed = async (needId, ngoUserId, data) => {
    const {
        title,
        category,
        gender,
        size,
        quantityNeeded,
        country,
        city,
        description,
        neededBy,
        status,
        imageUrls
    } = data;

    const result = await db.query(
        `UPDATE ngo_needs
         SET title = COALESCE($1, title),
             category = COALESCE($2, category),
             gender = COALESCE($3, gender),
             size = COALESCE($4, size),
             quantity_needed = COALESCE($5, quantity_needed),
             country = COALESCE($6, country),
             city = COALESCE($7, city),
             description = COALESCE($8, description),
             needed_by = COALESCE($9, needed_by),
             status = COALESCE($10, status),
             image_urls = COALESCE($11, image_urls),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $12 AND ngo_user_id = $13
         RETURNING *`,
        [title, category, gender, size, quantityNeeded, country, city, description, neededBy, status, imageUrls || null, needId, ngoUserId]
    );

    return result.rows[0];
};

const deleteNeed = async (needId, ngoUserId) => {
    const result = await db.query(
        'DELETE FROM ngo_needs WHERE id = $1 AND ngo_user_id = $2 RETURNING id',
        [needId, ngoUserId]
    );

    return result.rows[0];
};

module.exports = {
    createNeed,
    listNeeds,
    getNeedById,
    updateNeed,
    deleteNeed
};
