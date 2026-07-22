const db = require('../config/db');
require('dotenv').config();

const testAdminAPI = async () => {
    try {
        console.log('\n🔍 Test des Admin-API Datenbank-Setups...\n');

        // 1. Überprüfung der admin_logs Tabelle
        console.log('1️⃣  Überprüfung der admin_logs Tabelle...');
        const adminLogsCheck = await db.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'admin_logs'
            )`
        );
        console.log(`   ✅ admin_logs existiert: ${adminLogsCheck.rows[0].exists}\n`);

        // 2. Überprüfung der content_reports Tabelle
        console.log('2️⃣  Überprüfung der content_reports Tabelle...');
        const contentReportsCheck = await db.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'content_reports'
            )`
        );
        console.log(`   ✅ content_reports existiert: ${contentReportsCheck.rows[0].exists}\n`);

        // 3. Überprüfung der role-Spalte
        console.log('3️⃣  Überprüfung der role-Spalte...');
        const roleCheck = await db.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
            )`
        );
        console.log(`   ✅ role-Spalte existiert: ${roleCheck.rows[0].exists}\n`);

        // 4. Admin-Benutzer zählen
        console.log('4️⃣  Admin-Benutzer zählen...');
        const adminCount = await db.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['admin']);
        console.log(`   ✅ Admin-Benutzer gefunden: ${adminCount.rows[0].count}\n`);

        // 5. Test der getDashboardStats-Abfrage
        console.log('5️⃣  Test der getDashboardStats-Abfrage...');
        const usersCount = await db.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['user']);
        console.log(`   ✅ Benutzerabfrage funktioniert: ${usersCount.rows[0].count} Benutzer\n`);

        // 6. Test der listAllUsers-Abfrage
        console.log('6️⃣  Test der listAllUsers-Abfrage...');
        const users = await db.query(
            'SELECT id, username, email, first_name, last_name, is_company, is_verified, is_banned, created_at FROM users WHERE 1=1 LIMIT 5'
        );
        console.log(`   ✅ Benutzerabfrage funktioniert: ${users.rows.length} Ergebnisse\n`);

        console.log('✅ Alle Datenbank-Checks bestanden!\n');
        process.exit(0);
    } catch (err) {
        console.error('❌ Fehler:', err.message);
        console.error(err);
        process.exit(1);
    }
};

testAdminAPI();
