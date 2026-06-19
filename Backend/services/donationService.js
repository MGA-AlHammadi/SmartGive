const db = require('../config/db');

const createDonation = async (data) => {
    const {
        donorUserId,
        ngoNeedId,
        ngoUserId,
        itemName,
        category,
        gender,
        size,
        quantity,
        condition,
        country,
        city,
        notes,
        imageUrls
    } = data;

    const result = await db.query(
        `INSERT INTO donations (
            donor_user_id, ngo_need_id, ngo_user_id, item_name, category, gender, size,
            quantity, condition, country, city, notes, image_urls
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [donorUserId, ngoNeedId, ngoUserId, itemName, category, gender, size, quantity, condition, country, city, notes, imageUrls || []]
    );

    return result.rows[0];
};

const getDonationById = async (donationId) => {
    const result = await db.query('SELECT * FROM donations WHERE id = $1', [donationId]);
    return result.rows[0];
};

const listMyDonations = async (donorUserId) => {
    const result = await db.query(
        `SELECT d.*, nn.title AS need_title, u.company_name AS ngo_name
         FROM donations d
         LEFT JOIN ngo_needs nn ON nn.id = d.ngo_need_id
         LEFT JOIN users u ON u.id = COALESCE(d.ngo_user_id, nn.ngo_user_id)
         WHERE d.donor_user_id = $1
         ORDER BY d.created_at DESC`,
        [donorUserId]
    );

    return result.rows;
};

const listReceivedDonations = async (ngoUserId) => {
    const result = await db.query(
        `SELECT d.*, nn.title AS need_title,
                (d.ngo_need_id IS NULL AND d.ngo_user_id IS NULL) AS is_public_offer,
                donor.first_name AS donor_first_name,
                donor.last_name AS donor_last_name
         FROM donations d
         LEFT JOIN ngo_needs nn ON nn.id = d.ngo_need_id
         JOIN users donor ON donor.id = d.donor_user_id
         WHERE d.ngo_user_id = $1
            OR nn.ngo_user_id = $1
            OR (d.ngo_user_id IS NULL AND d.ngo_need_id IS NULL AND d.status = 'pending')
         ORDER BY d.created_at DESC`,
        [ngoUserId]
    );

    return result.rows;
};

const updateDonationStatus = async (donationId, status, actingNgoUserId = null) => {
    // Zuerst aktuellen Status holen, um festzustellen, ob sich der Status zu 'delivered' ändert
    const currentResult = await db.query('SELECT status, ngo_need_id, quantity FROM donations WHERE id = $1', [donationId]);
    const currentDonation = currentResult.rows[0];

    if (!currentDonation) return null;

    // Claim public offer: assign ngo_user_id when NGO accepts an unclaimed donation
    if (status === 'accepted' && actingNgoUserId) {
        await db.query(
            `UPDATE donations
             SET ngo_user_id = COALESCE(ngo_user_id, $1)
             WHERE id = $2 AND ngo_user_id IS NULL`,
            [actingNgoUserId, donationId]
        );
    }

    // Build timestamp fields in JS to avoid PostgreSQL parameter type conflicts
    const extraSets = [];
    if (status === 'accepted') {
        extraSets.push('accepted_at = CURRENT_TIMESTAMP');
    }
    if (status === 'delivered') {
        extraSets.push('delivered_at = CURRENT_TIMESTAMP');
    }

    const extraSql = extraSets.length > 0 ? `, ${extraSets.join(', ')}` : '';

    const result = await db.query(
        `UPDATE donations
         SET status = $1,
             updated_at = CURRENT_TIMESTAMP
             ${extraSql}
         WHERE id = $2
         RETURNING *`,
        [status, donationId]
    );

    const updatedDonation = result.rows[0];

    // Wenn der Status auf 'delivered' gesetzt wurde und er vorher nicht 'delivered' war
    if (status === 'delivered' && currentDonation.status !== 'delivered' && currentDonation.ngo_need_id) {
        await db.query(
            `UPDATE ngo_needs 
             SET quantity_received = quantity_received + $1,
                 status = CASE WHEN quantity_received + $1 >= quantity_needed THEN 'fulfilled' ELSE status END,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [currentDonation.quantity, currentDonation.ngo_need_id]
        );
    }

    return updatedDonation;
};

const updateDonationByOwner = async (donationId, donorUserId, data) => {
    const {
        itemName,
        category,
        gender,
        size,
        quantity,
        condition,
        country,
        city,
        notes,
        imageUrls
    } = data;

    const result = await db.query(
        `UPDATE donations
         SET item_name = COALESCE($1, item_name),
             category = COALESCE($2, category),
             gender = COALESCE($3, gender),
             size = COALESCE($4, size),
             quantity = COALESCE($5, quantity),
             condition = COALESCE($6, condition),
             country = COALESCE($7, country),
             city = COALESCE($8, city),
             notes = COALESCE($9, notes),
             image_urls = COALESCE($10, image_urls),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $11 AND donor_user_id = $12
         RETURNING *`,
        [itemName, category, gender, size, quantity, condition, country, city, notes, imageUrls || null, donationId, donorUserId]
    );

    return result.rows[0];
};

const deleteDonationByOwner = async (donationId, donorUserId) => {
    const result = await db.query(
        'DELETE FROM donations WHERE id = $1 AND donor_user_id = $2 RETURNING id',
        [donationId, donorUserId]
    );

    return result.rows[0];
};

module.exports = {
    createDonation,
    getDonationById,
    listMyDonations,
    listReceivedDonations,
    updateDonationStatus,
    updateDonationByOwner,
    deleteDonationByOwner
};
