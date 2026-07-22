const db = require('../config/db');
const userService = require('../services/userService');

// Hilfsfunktion zum Protokollieren von Admin-Aktionen
const logAdminAction = async (adminId, action, targetType, targetId, description) => {
    try {
        await db.query(
            'INSERT INTO admin_logs (admin_id, action, target_type, target_id, description) VALUES ($1, $2, $3, $4, $5)',
            [adminId, action, targetType, targetId, description]
        );
    } catch (err) {
        console.error('Error logging admin action:', err);
    }
};

// === DASHBOARD-STATISTIKEN ===
const getDashboardStats = async (req, res) => {
    try {
        const adminId = req.user.id;

        // Gesamtzahl der Benutzer
        const usersCount = await db.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['user']);
        
        // Gesamtzahl der NGOs
        const ngosCount = await db.query('SELECT COUNT(*) as count FROM users WHERE is_company = true AND role = $1', ['user']);
        
        // Verifizierte NGOs
        const verifiedNgos = await db.query(
            'SELECT COUNT(*) as count FROM users WHERE is_company = true AND is_verified = true AND role = $1',
            ['user']
        );
        
        // Gesamtzahl der Spenden
        const donationsCount = await db.query(
            'SELECT COUNT(*) as count, SUM(CAST(amount AS FLOAT)) as total FROM donations'
        );
        
        // Ausstehende NGO-Verifizierungen
        const pendingNgos = await db.query(
            'SELECT COUNT(*) as count FROM users WHERE is_company = true AND is_verified = false AND is_banned = false AND role = $1',
            ['user']
        );

        // Gesperrte Benutzer
        const bannedUsers = await db.query('SELECT COUNT(*) as count FROM users WHERE is_banned = true');

        // Ausstehende Meldungen
        const pendingReports = await db.query(
            'SELECT COUNT(*) as count FROM content_reports WHERE status = $1',
            ['pending']
        );

        res.json({
            totalUsers: parseInt(usersCount.rows[0]?.count || 0),
            totalNgos: parseInt(ngosCount.rows[0]?.count || 0),
            verifiedNgos: parseInt(verifiedNgos.rows[0]?.count || 0),
            totalDonations: donationsCount.rows[0]?.count || 0,
            totalDonationAmount: parseFloat(donationsCount.rows[0]?.total || 0),
            pendingNgoVerifications: parseInt(pendingNgos.rows[0]?.count || 0),
            bannedUsers: parseInt(bannedUsers.rows[0]?.count || 0),
            pendingReports: parseInt(pendingReports.rows[0]?.count || 0),
        });
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ message: 'Fehler beim Abrufen der Statistiken' });
    }
};

// === BENUTZERVERWALTUNG ===
const listAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', role = '', isBanned = '' } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT id, username, email, first_name, last_name, is_company, is_verified, is_banned, created_at FROM users WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as count FROM users WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (search) {
            const searchCondition = `(username ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`;
            query += ` AND ${searchCondition}`;
            countQuery += ` AND ${searchCondition}`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (role) {
            query += ` AND role = $${paramIndex}`;
            countQuery += ` AND role = $${paramIndex}`;
            params.push(role);
            paramIndex++;
        }

        if (isBanned === 'true') {
            query += ` AND is_banned = true`;
            countQuery += ` AND is_banned = true`;
        } else if (isBanned === 'false') {
            query += ` AND is_banned = false`;
            countQuery += ` AND is_banned = false`;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const [users, countResult] = await Promise.all([
            db.query(query, params),
            db.query(countQuery, params.slice(0, -2))
        ]);

        res.json({
            users: users.rows,
            total: parseInt(countResult.rows[0].count),
            page,
            limit
        });
    } catch (err) {
        console.error('Error listing users:', err);
        res.status(500).json({ message: 'Fehler beim Abrufen der Benutzer' });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        const adminId = req.user.id;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Ungültige Rolle' });
        }

        // Selbst-Herabstufung verhindern
        if (parseInt(userId) === adminId && role === 'user') {
            return res.status(403).json({ message: 'Sie können sich selbst nicht herabstufen' });
        }

        await db.query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
        
        await logAdminAction(adminId, 'CHANGE_ROLE', 'user', userId, `Rolle geändert zu: ${role}`);

        res.json({ message: 'Rolle aktualisiert' });
    } catch (err) {
        console.error('Error updating user role:', err);
        res.status(500).json({ message: 'Fehler beim Aktualisieren der Rolle' });
    }
};

const banUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        if (parseInt(userId) === adminId) {
            return res.status(403).json({ message: 'Sie können sich selbst nicht sperren' });
        }

        await db.query(
            'UPDATE users SET is_banned = true, ban_reason = $1 WHERE id = $2',
            [reason || '', userId]
        );

        await logAdminAction(adminId, 'BAN_USER', 'user', userId, `Grund: ${reason || 'Keine Angabe'}`);

        res.json({ message: 'Benutzer gesperrt' });
    } catch (err) {
        console.error('Error banning user:', err);
        res.status(500).json({ message: 'Fehler beim Sperren des Benutzers' });
    }
};

const unbanUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user.id;

        await db.query('UPDATE users SET is_banned = false, ban_reason = NULL WHERE id = $1', [userId]);
        
        await logAdminAction(adminId, 'UNBAN_USER', 'user', userId, 'Benutzer entsperrt');

        res.json({ message: 'Benutzer entsperrt' });
    } catch (err) {
        console.error('Error unbanning user:', err);
        res.status(500).json({ message: 'Fehler beim Entsperren des Benutzers' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user.id;

        if (parseInt(userId) === adminId) {
            return res.status(403).json({ message: 'Sie können Ihr eigenes Konto nicht löschen' });
        }

        // Benutzerinformationen vor dem Löschen abrufen
        const user = await db.query('SELECT username, email FROM users WHERE id = $1', [userId]);

        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'Benutzer nicht gefunden' });
        }

        // Benutzer löschen
        await db.query('DELETE FROM users WHERE id = $1', [userId]);

        await logAdminAction(adminId, 'DELETE_USER', 'user', userId, `Benutzer gelöscht: ${user.rows[0].username}`);

        res.json({ message: 'Benutzer gelöscht' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Fehler beim Löschen des Benutzers' });
    }
};

// === NGO-VERIFIZIERUNG ===
const listPendingNgos = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT id, username, email, first_name, last_name, company_name, company_country, 
                   company_city, company_address, profile_description, profile_picture, created_at
            FROM users 
            WHERE is_company = true AND is_verified = false AND is_banned = false AND role = 'user'
        `;
        let countQuery = 'SELECT COUNT(*) as count FROM users WHERE is_company = true AND is_verified = false AND is_banned = false AND role = $1';

        const params = [limit, offset];
        const countParams = ['user'];

        if (search) {
            const searchParam = `%${search}%`;
            query += ` AND (username ILIKE $3 OR company_name ILIKE $3 OR email ILIKE $3)`;
            countQuery += ` AND (username ILIKE $2 OR company_name ILIKE $2 OR email ILIKE $2)`;
            params.push(searchParam);
            countParams.push(searchParam);
        }

        query += ` ORDER BY created_at ASC LIMIT $1 OFFSET $2`;

        const [ngos, countResult] = await Promise.all([
            db.query(query, params),
            db.query(countQuery, countParams)
        ]);

        res.json({
            ngos: ngos.rows,
            total: parseInt(countResult.rows[0].count),
            page,
            limit
        });
    } catch (err) {
        console.error('Error listing pending NGOs:', err);
        res.status(500).json({ message: 'Fehler beim Abrufen der NGOs' });
    }
};

const verifyNgo = async (req, res) => {
    try {
        const { ngoId } = req.params;
        const adminId = req.user.id;

        await db.query('UPDATE users SET is_verified = true WHERE id = $1', [ngoId]);
        
        await logAdminAction(adminId, 'VERIFY_NGO', 'ngo', ngoId, 'NGO verifiziert');

        res.json({ message: 'NGO verifiziert' });
    } catch (err) {
        console.error('Error verifying NGO:', err);
        res.status(500).json({ message: 'Fehler bei der Verifizierung' });
    }
};

const rejectNgo = async (req, res) => {
    try {
        const { ngoId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        await db.query(
            'UPDATE users SET is_banned = true, ban_reason = $1 WHERE id = $2',
            [`NGO-Ablehnung: ${reason || 'Keine Angabe'}`, ngoId]
        );

        await logAdminAction(adminId, 'REJECT_NGO', 'ngo', ngoId, `Grund: ${reason || 'Keine Angabe'}`);

        res.json({ message: 'NGO abgelehnt' });
    } catch (err) {
        console.error('Error rejecting NGO:', err);
        res.status(500).json({ message: 'Fehler beim Ablehnen' });
    }
};

const getVerifiedNgos = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT id, username, email, first_name, last_name, company_name, company_country, 
                   company_city, profile_description, is_verified, created_at
            FROM users 
            WHERE is_company = true AND is_verified = true AND is_banned = false
        `;
        let countQuery = 'SELECT COUNT(*) as count FROM users WHERE is_company = true AND is_verified = true AND is_banned = false';

        const params = [limit, offset];
        const countParams = [];

        if (search) {
            const searchParam = `%${search}%`;
            query += ` AND (username ILIKE $3 OR company_name ILIKE $3)`;
            countQuery += ` AND (username ILIKE $1 OR company_name ILIKE $1)`;
            params.push(searchParam);
            countParams.push(searchParam);
        }

        query += ` ORDER BY created_at DESC LIMIT $1 OFFSET $2`;

        const [ngos, countResult] = await Promise.all([
            db.query(query, params),
            db.query(countQuery, countParams)
        ]);

        res.json({
            ngos: ngos.rows,
            total: parseInt(countResult.rows[0].count),
            page,
            limit
        });
    } catch (err) {
        console.error('Error fetching verified NGOs:', err);
        res.status(500).json({ message: 'Fehler beim Abrufen der verifizierten NGOs' });
    }
};

// === INHALTSMODERATION ===
const listReports = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'pending' } = req.query;
        const offset = (page - 1) * limit;

        const reports = await db.query(`
            SELECT cr.id, cr.reporter_id, cr.content_type, cr.content_id, cr.reason, 
                   cr.description, cr.status, cr.created_at, u.username as reporter_name
            FROM content_reports cr
            JOIN users u ON cr.reporter_id = u.id
            WHERE cr.status = $1
            ORDER BY cr.created_at DESC
            LIMIT $2 OFFSET $3
        `, [status, limit, offset]);

        const countResult = await db.query(
            'SELECT COUNT(*) as count FROM content_reports WHERE status = $1',
            [status]
        );

        res.json({
            reports: reports.rows,
            total: parseInt(countResult.rows[0].count),
            page,
            limit
        });
    } catch (err) {
        console.error('Error listing reports:', err);
        res.status(500).json({ message: 'Fehler beim Abrufen der Berichte' });
    }
};

const reviewReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { decision, notes } = req.body;
        const adminId = req.user.id;

        if (!['approved', 'rejected'].includes(decision)) {
            return res.status(400).json({ message: 'Ungültige Entscheidung' });
        }

        await db.query(
            'UPDATE content_reports SET status = $1, reviewed_by = $2, review_notes = $3, reviewed_at = CURRENT_TIMESTAMP WHERE id = $4',
            ['reviewed', adminId, notes || '', reportId]
        );

        await logAdminAction(adminId, 'REVIEW_REPORT', 'report', reportId, `Entscheidung: ${decision}`);

        res.json({ message: 'Bericht überprüft' });
    } catch (err) {
        console.error('Error reviewing report:', err);
        res.status(500).json({ message: 'Fehler beim Überprüfen des Berichts' });
    }
};

// === ADMIN-PROTOKOLLE ===
const getAdminLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, adminId = '' } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT al.*, u.username FROM admin_logs al JOIN users u ON al.admin_id = u.id WHERE 1=1';
        const params = [];

        if (adminId) {
            query += ` AND al.admin_id = $${params.length + 1}`;
            params.push(adminId);
        }

        query += ` ORDER BY al.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const [logs, countResult] = await Promise.all([
            db.query(query, params),
            db.query('SELECT COUNT(*) as count FROM admin_logs')
        ]);

        res.json({
            logs: logs.rows,
            total: parseInt(countResult.rows[0].count),
            page,
            limit
        });
    } catch (err) {
        console.error('Error fetching admin logs:', err);
        res.status(500).json({ message: 'Fehler beim Abrufen der Admin-Logs' });
    }
};

module.exports = {
    getDashboardStats,
    listAllUsers,
    updateUserRole,
    banUser,
    unbanUser,
    deleteUser,
    listPendingNgos,
    verifyNgo,
    rejectNgo,
    getVerifiedNgos,
    listReports,
    reviewReport,
    getAdminLogs
};
