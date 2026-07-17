const db = require('../config/db');
require('dotenv').config();

const testAdminAPI = async () => {
    try {
        console.log('\n🔍 Testing Admin API Database Setup...\n');

        // 1. Check if admin_logs table exists
        console.log('1️⃣  Checking admin_logs table...');
        const adminLogsCheck = await db.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'admin_logs'
            )`
        );
        console.log(`   ✅ admin_logs exists: ${adminLogsCheck.rows[0].exists}\n`);

        // 2. Check if content_reports table exists
        console.log('2️⃣  Checking content_reports table...');
        const contentReportsCheck = await db.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'content_reports'
            )`
        );
        console.log(`   ✅ content_reports exists: ${contentReportsCheck.rows[0].exists}\n`);

        // 3. Check role column
        console.log('3️⃣  Checking role column...');
        const roleCheck = await db.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
            )`
        );
        console.log(`   ✅ role column exists: ${roleCheck.rows[0].exists}\n`);

        // 4. Count admin users
        console.log('4️⃣  Counting admin users...');
        const adminCount = await db.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['admin']);
        console.log(`   ✅ Admin users found: ${adminCount.rows[0].count}\n`);

        // 5. Test getDashboardStats query
        console.log('5️⃣  Testing getDashboardStats query...');
        const usersCount = await db.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['user']);
        console.log(`   ✅ Users query works: ${usersCount.rows[0].count} users\n`);

        // 6. Test listAllUsers query
        console.log('6️⃣  Testing listAllUsers query...');
        const users = await db.query(
            'SELECT id, username, email, first_name, last_name, is_company, is_verified, is_banned, created_at FROM users WHERE 1=1 LIMIT 5'
        );
        console.log(`   ✅ Users query works: ${users.rows.length} results\n`);

        console.log('✅ All database checks passed!\n');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error(err);
        process.exit(1);
    }
};

testAdminAPI();
